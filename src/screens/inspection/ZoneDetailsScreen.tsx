import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, MapPin, Camera, Plus, Wand2 } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import CustomCameraModal from '../../components/CustomCameraModal';
import {
  EMPTY_COMPLETED_SUBLOCATION_IDS,
  SUBLOCATIONS_PER_ZONE,
  useZoneProgressStore,
  zoneProgressCounts,
} from '../../store/useZoneProgressStore';
import {
  type DraftAttribute,
  defaultSublocationAttributes,
  getSublocationDraftKey,
  useHoldInspectionDraftStore,
} from '../../store/useHoldInspectionDraftStore';

const { width } = Dimensions.get('window');

function SublocationPanel({ 
  holdId, 
  zoneId, 
  sublocationId, 
  title,
  onComplete 
}: { 
  holdId: string, 
  zoneId: string, 
  sublocationId: string, 
  title: string,
  onComplete: () => void 
}) {
  const draftKey = getSublocationDraftKey(holdId, zoneId, sublocationId);
  const upsertSublocationDraft = useHoldInspectionDraftStore((s) => s.upsertSublocationDraft);
  const markSublocationComplete = useZoneProgressStore((s) => s.markSublocationComplete);

  const [attributes, setAttributes] = useState<DraftAttribute[]>(() => {
    const stored = useHoldInspectionDraftStore.getState().sublocationDraftByKey[draftKey];
    if (stored) {
      return stored.attributes.map(a => ({...a}));
    }
    return defaultSublocationAttributes();
  });
  const [comment, setComment] = useState(() => {
    const stored = useHoldInspectionDraftStore.getState().sublocationDraftByKey[draftKey];
    return stored ? stored.comment : '';
  });

  const commentRef = useRef(comment);
  commentRef.current = comment;

  useEffect(() => {
    upsertSublocationDraft(draftKey, { attributes, comment });
  }, [attributes, comment, draftKey, upsertSublocationDraft]);

  const persistDraftAttributes = useCallback(
    (nextAttrs: DraftAttribute[]) => {
      useHoldInspectionDraftStore.getState().upsertSublocationDraft(draftKey, {
        attributes: nextAttrs,
        comment: commentRef.current,
      });
    },
    [draftKey]
  );

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
    markSublocationComplete(zoneId, sublocationId);
    onComplete();
  };

  return (
    <View style={styles.panelContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelScroll}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{title}</Text>
          <Text style={styles.panelSubtitle}>Attribute Evidence</Text>
        </View>

        <View style={styles.attributesContainer}>
          {attributes.map((attr, index) => (
            <View key={attr.id} style={styles.attributeRow}>
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
                      <CheckCircle2 size={12} color="#10B981" fill="#FFF" />
                    </View>
                  </View>
                ) : (
                  <Camera size={20} color="#6366F1" />
                )}
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddAttribute} activeOpacity={0.7}>
            <Plus size={16} color="#4F46E5" />
            <Text style={styles.addButtonText}>ADD PROPERTY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentTitle}>Observations</Text>
            <TouchableOpacity style={styles.aiButton} onPress={handleGenerateAI} activeOpacity={0.8}>
              <Wand2 size={12} color="#4F46E5" />
              <Text style={styles.aiButtonText}>Smart Fill</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.textArea}
            placeholder="Type observations..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.panelFooter}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
          <CheckCircle2 size={18} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Validate & Next</Text>
        </TouchableOpacity>
      </View>

      <CustomCameraModal 
        visible={isCameraVisible} 
        onClose={() => setCameraVisible(false)} 
        onPictureTaken={onPictureTaken} 
        guideText={attributes.find(a => a.id === activeAttrId)?.type ? `${attributes.find(a => a.id === activeAttrId)?.type} PHOTO`.toUpperCase() : "CAPTURE PHOTO"}
      />
    </View>
  );
}

export default function ZoneDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const holdId = route.params?.holdId || 'unknown-hold';
  const zoneId = route.params?.zoneId || '';
  const zoneTitle = route.params?.zoneTitle || 'Zone Details';

  const completedByZone = useZoneProgressStore((s) => s.completedByZone);
  const completedIdsForZone =
    useZoneProgressStore((s) => s.completedByZone[zoneId]) ?? EMPTY_COMPLETED_SUBLOCATION_IDS;

  const sublocations = useMemo(
    () =>
      Array.from({ length: SUBLOCATIONS_PER_ZONE }, (_, i) => {
        const id = `sub-${i + 1}`;
        const completed = completedIdsForZone.includes(id);
        return {
          id,
          title: `Sublocation ${i + 1}`,
          shortTitle: `Sub ${i + 1}`,
          status: completed ? ('completed' as const) : ('pending' as const),
        };
      }),
    [completedIdsForZone]
  );

  const [activeSublocationId, setActiveSublocationId] = useState(sublocations[0].id);

  const activeSublocation = sublocations.find(s => s.id === activeSublocationId) || sublocations[0];

  const handleNextSublocation = () => {
    const currentIndex = sublocations.findIndex(s => s.id === activeSublocationId);
    if (currentIndex < sublocations.length - 1) {
      setActiveSublocationId(sublocations[currentIndex + 1].id);
    }
  };

  const { completed: completedCount, total: totalCount } =
    zoneProgressCounts(completedByZone, zoneId, SUBLOCATIONS_PER_ZONE);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{zoneTitle}</Text>
          <Text style={styles.headerSubtitle}>{completedCount}/{totalCount} Completed</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.splitContent}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
            {sublocations.map(item => {
              const isActive = item.id === activeSublocationId;
              const isCompleted = item.status === 'completed';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sidebarItem,
                    isActive && styles.sidebarItemActive,
                    isCompleted && !isActive && styles.sidebarItemCompleted
                  ]}
                  onPress={() => setActiveSublocationId(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.sidebarIconWrap, 
                    isActive && styles.sidebarIconWrapActive,
                    isCompleted && !isActive && styles.sidebarIconWrapCompleted
                  ]}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} color={isActive ? "#4F46E5" : "#10B981"} />
                    ) : (
                      <MapPin size={20} color={isActive ? "#4F46E5" : "#94A3B8"} />
                    )}
                  </View>
                  <Text style={[
                    styles.sidebarItemText,
                    isActive && styles.sidebarItemTextActive,
                    isCompleted && !isActive && styles.sidebarItemTextCompleted
                  ]} numberOfLines={1}>
                    {item.shortTitle}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Right Content */}
        <View style={styles.mainArea}>
          <SublocationPanel 
            key={activeSublocationId} 
            holdId={holdId} 
            zoneId={zoneId} 
            sublocationId={activeSublocationId} 
            title={activeSublocation.title}
            onComplete={handleNextSublocation}
          />
        </View>
      </View>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  splitContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 85,
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sidebarScroll: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sidebarItem: {
    width: 64,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  sidebarItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sidebarItemCompleted: {
    opacity: 0.8,
  },
  sidebarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sidebarIconWrapActive: {
    backgroundColor: '#EEF2FF',
  },
  sidebarIconWrapCompleted: {
    backgroundColor: '#ECFDF5',
  },
  sidebarItemText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  sidebarItemTextActive: {
    color: '#4F46E5',
    fontWeight: '900',
  },
  sidebarItemTextCompleted: {
    color: '#10B981',
  },
  mainArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  panelContainer: {
    flex: 1,
  },
  panelScroll: {
    padding: 20,
    paddingBottom: 100,
  },
  panelHeader: {
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  attributesContainer: {
    marginBottom: 20,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  attributeInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  attributeLabelRow: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  attributeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: 1,
  },
  inputWithSelect: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 52,
    overflow: 'hidden',
  },
  dropdownTrigger: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    minWidth: 70,
  },
  dropdownText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  cameraButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
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
    borderRadius: 12,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
  },
  commentContainer: {},
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  aiButtonText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    minHeight: 120,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  panelFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  completeButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  completeButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
