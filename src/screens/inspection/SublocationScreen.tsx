import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Camera, CheckCircle2, Plus, Wand2, Save } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import CustomCameraModal from '../../components/CustomCameraModal';
import { useZoneProgressStore } from '../../store/useZoneProgressStore';
import {
  type DraftAttribute,
  defaultSublocationAttributes,
  getSublocationDraftKey,
  useHoldInspectionDraftStore,
} from '../../store/useHoldInspectionDraftStore';

// Mock attribute options
const ATTRIBUTE_TYPES = ['Condition', 'Defect', 'Cleanliness', 'Structural', 'Other'];

export default function SublocationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const title = route.params?.title || 'Sublocation';
  const zoneTitle = route.params?.zoneTitle || '';
  const zoneId = route.params?.zoneId || '';
  const sublocationId = route.params?.sublocationId || '';
  const holdId = route.params?.holdId || 'unknown-hold';

  const draftKey = useMemo(
    () =>
      zoneId && sublocationId
        ? getSublocationDraftKey(holdId, zoneId, sublocationId)
        : '',
    [holdId, zoneId, sublocationId]
  );

  const upsertSublocationDraft = useHoldInspectionDraftStore((s) => s.upsertSublocationDraft);

  const markSublocationComplete = useZoneProgressStore((s) => s.markSublocationComplete);

  const [attributes, setAttributes] = useState(() => defaultSublocationAttributes());
  const [comment, setComment] = useState('');

  const commentRef = useRef(comment);
  commentRef.current = comment;

  const draftHydrated = useRef(false);

  const persistDraftAttributes = useCallback(
    (nextAttrs: DraftAttribute[]) => {
      if (!draftKey) return;
      useHoldInspectionDraftStore.getState().upsertSublocationDraft(draftKey, {
        attributes: nextAttrs,
        comment: commentRef.current,
      });
    },
    [draftKey]
  );

  useFocusEffect(
    useCallback(() => {
      const resetDefaults = () => {
        setAttributes(defaultSublocationAttributes());
        setComment('');
      };

      if (!draftKey) {
        resetDefaults();
        draftHydrated.current = true;
        return () => {
          draftHydrated.current = false;
        };
      }

      const stored =
        useHoldInspectionDraftStore.getState().sublocationDraftByKey[draftKey];
      if (stored) {
        setAttributes(stored.attributes.map((a) => ({ ...a })));
        setComment(stored.comment);
      } else {
        resetDefaults();
      }

      draftHydrated.current = true;

      return () => {
        draftHydrated.current = false;
      };
    }, [draftKey])
  );

  useEffect(() => {
    if (!draftKey || !draftHydrated.current) return;
    upsertSublocationDraft(draftKey, { attributes, comment });
  }, [attributes, comment, draftKey, upsertSublocationDraft]);

  const handleAddAttribute = () => {
    setAttributes([
      ...attributes, 
      { id: Date.now().toString(), type: 'Condition', value: '', uri: null }
    ]);
  };

  const [isCameraVisible, setCameraVisible] = useState(false);
  const [activeAttrId, setActiveAttrId] = useState<string | null>(null);

  const handleTakeShot = (id: string) => {
    setActiveAttrId(id);
    setCameraVisible(true);
  };

  const onPictureTaken = (uri: string) => {
    if (!activeAttrId) return;
    setAttributes((current) => {
      const next = current.map((attr) =>
        attr.id === activeAttrId ? { ...attr, uri } : attr
      );
      persistDraftAttributes(next);
      return next;
    });
  };

  const handleGenerateAI = () => {
    setComment("The area appears to be in fair condition. Minor surface rust observed but structurally sound. Further cleaning required in corners.");
  };

  const handleComplete = () => {
    if (zoneId && sublocationId) {
      markSublocationComplete(zoneId, sublocationId);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={['#10B981', '#10B981', '#34D399']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{zoneTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attributes & Evidence</Text>
          <Text style={styles.sectionSubtitle}>Add details and capture photos for this location.</Text>
        </View>

        <View style={styles.attributesContainer}>
          {attributes.map((attr, index) => (
            <View 
              key={attr.id}
              style={styles.attributeRow}
            >
              <View style={styles.attributeInputContainer}>
                <Text style={styles.attributeLabel}>Attribute {index + 1}</Text>
                <View style={styles.inputWithSelect}>
                  {/* Mock Dropdown Trigger */}
                  <View style={styles.dropdownTrigger}>
                    <Text style={styles.dropdownText}>{attr.type}</Text>
                  </View>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="Describe condition..."
                    placeholderTextColor="#94A3B8"
                    value={attr.value}
                    onChangeText={(val) => {
                      const newAttrs = [...attributes];
                      newAttrs[index].value = val;
                      setAttributes(newAttrs);
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.cameraButton, attr.uri && styles.cameraButtonSuccess]} 
                onPress={() => handleTakeShot(attr.id)}
                activeOpacity={0.8}
              >
                {attr.uri ? (
                  <View style={styles.thumbnailContainer}>
                    <Image source={{ uri: attr.uri }} style={styles.thumbnail} />
                    <View style={styles.badge}>
                      <CheckCircle2 size={16} color="#10B981" fill="#FFF" />
                    </View>
                  </View>
                ) : (
                  <Camera size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            </View>
          ))}
          
          <View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAttribute} activeOpacity={0.7}>
              <Plus size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Attribute</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <Text style={styles.sectionTitle}>Observations</Text>
            <TouchableOpacity style={styles.aiButton} onPress={handleGenerateAI} activeOpacity={0.8}>
              <Wand2 size={16} color="#8B5CF6" />
              <Text style={styles.aiButtonText}>Auto-Generate</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.textArea}
            placeholder="Add comments or use AI to generate..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity style={styles.draftButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Save size={20} color="#64748B" />
          <Text style={styles.draftButtonText}>Save Draft</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      </View>

      <CustomCameraModal 
        visible={isCameraVisible} 
        onClose={() => setCameraVisible(false)} 
        onPictureTaken={onPictureTaken} 
        guideText={attributes.find(a => a.id === activeAttrId)?.type ? `${attributes.find(a => a.id === activeAttrId)?.type} PHOTO`.toUpperCase() : "CAPTURE PHOTO"}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTextWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  attributesContainer: {
    paddingHorizontal: 24,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  attributeInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  attributeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWithSelect: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownTrigger: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E293B',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cameraButtonSuccess: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#3B82F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 32,
    marginHorizontal: 24,
  },
  commentContainer: {
    paddingHorizontal: 24,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  draftButtonText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  completeButton: {
    flex: 2,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
