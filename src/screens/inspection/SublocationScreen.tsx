import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Camera, CheckCircle2, Plus, Wand2, Save, FileText, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import CustomCameraModal from '../../components/CustomCameraModal';
import { useZoneProgressStore } from '../../store/useZoneProgressStore';
import {
  type DraftAttribute,
  defaultSublocationAttributes,
  getSublocationDraftKey,
  useHoldInspectionDraftStore,
} from '../../store/useHoldInspectionDraftStore';

const { width } = Dimensions.get('window');

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
        return;
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
    setComment("Observation: Area is well-maintained with negligible rust. Surface cleanliness meets standard requirements. Structural integrity confirmed via visual inspection.");
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
        colors={['#4F46E5', '#6366F1']}
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
          <View>
            <Text style={styles.sectionTitle}>Attribute Evidence</Text>
            <Text style={styles.sectionSubtitle}>Define conditions and capture proof</Text>
          </View>
          <AlertCircle size={20} color="#6366F1" />
        </View>

        <View style={styles.attributesContainer}>
          {attributes.map((attr, index) => (
            <View 
              key={attr.id}
              style={styles.attributeRow}
            >
              <View style={styles.attributeInputContainer}>
                <View style={styles.attributeLabelRow}>
                  <Text style={styles.attributeLabel}>PROPERTY {index + 1}</Text>
                </View>
                <View style={styles.inputWithSelect}>
                  <View style={styles.dropdownTrigger}>
                    <Text style={styles.dropdownText}>{attr.type.toUpperCase()}</Text>
                  </View>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="Enter condition..."
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
                  <Camera size={22} color="#6366F1" />
                )}
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddAttribute} activeOpacity={0.7}>
            <Plus size={20} color="#4F46E5" />
            <Text style={styles.addButtonText}>ADD NEW PROPERTY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <View style={styles.commentTitleRow}>
              <FileText size={18} color="#1E293B" style={{marginRight: 8}} />
              <Text style={styles.sectionTitle}>Detailed Observations</Text>
            </View>
            <TouchableOpacity style={styles.aiButton} onPress={handleGenerateAI} activeOpacity={0.8}>
              <Wand2 size={14} color="#4F46E5" />
              <Text style={styles.aiButtonText}>AI Smart Fill</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.textArea}
            placeholder="Type your observations here or use AI Smart Fill..."
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
          <Text style={styles.draftButtonText}>Draft</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Validate & Mark Complete</Text>
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
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTextWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  attributesContainer: {
    paddingHorizontal: 20,
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
  attributeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  attributeLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: 1,
  },
  inputWithSelect: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    height: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownTrigger: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    minWidth: 80,
  },
  dropdownText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  cameraButtonSuccess: {
    padding: 0,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 32,
    marginHorizontal: 20,
  },
  commentContainer: {
    paddingHorizontal: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aiButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    minHeight: 140,
    lineHeight: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  draftButton: {
    width: 100,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  draftButtonText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '800',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
