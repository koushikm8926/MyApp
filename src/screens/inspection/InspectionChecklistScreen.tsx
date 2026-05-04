import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, Circle, ChevronRight, Camera, ArrowLeft, Info, Trophy } from 'lucide-react-native';
import { INSPECTION_STEPS, InspectionStep } from '../../constants/inspectionSteps';
import { databaseService, PhotoRecord } from '../../services/databaseService';
import { useInspectionStore } from '../../store/useInspectionStore';
import { LinearGradient } from 'react-native-linear-gradient';

export default function InspectionChecklist() {
  const route = useRoute<any>();
  const { id } = route.params || {};
  const navigation = useNavigation<any>();
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { saveInspectionData } = useInspectionStore();
  const insets = useSafeAreaInsets();

  const loadPhotos = async () => {
    try {
      const capturedPhotos = await databaseService.getPhotos(id as string);
      setPhotos(capturedPhotos);
    } catch (error) {
      console.error('Failed to load photos', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
    }, [id])
  );

  const getStepPhoto = (stepId: string) => {
    return photos.find(p => p.type === stepId);
  };

  const isStepCompleted = (stepId: string) => {
    return !!getStepPhoto(stepId);
  };

  const handleStepPress = (step: InspectionStep) => {
    router.push({
      pathname: `/inspection/${id}`,
      params: { stepId: step.id, label: step.label }
    });
  };

  const handleFinish = async () => {
    const requiredSteps = INSPECTION_STEPS.filter(s => s.required);
    const completedRequired = requiredSteps.every(s => isStepCompleted(s.id));

    if (!completedRequired) {
      Alert.alert('Incomplete Inspection', 'Please complete all required steps before finishing.');
      return;
    }

    await saveInspectionData(id as string, {});
    router.replace('/(tabs)/history');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0787e2" />
      </View>
    );
  }

  const completedCount = photos.length;
  const totalCount = INSPECTION_STEPS.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const isFinished = progress === 1;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeText}>IN PROGRESS</Text>
          </View>
        </View>
        
        <Text style={styles.title}>Inspection Checklist</Text>
        
        <View style={styles.progressCard}>
          <LinearGradient
            colors={['#0787e2', '#0787e2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          >
            <View style={styles.progressHeader}>
              <View style={styles.progressTextGroup}>
                <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.progressLabel}>Completed</Text>
              </View>
              {isFinished ? (
                <Trophy size={32} color="#fff" />
              ) : (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{completedCount}/{totalCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </LinearGradient>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.stepsList} contentContainerStyle={styles.stepsContent}>
        {INSPECTION_STEPS.map((step, index) => {
          const completed = isStepCompleted(step.id);
          return (
            <View 
              key={step.id}
            >
              <TouchableOpacity 
                style={[styles.stepItem, completed && styles.stepItemCompleted]}
                onPress={() => handleStepPress(step)}
              >
                <View style={styles.stepInfo}>
                  <View style={[styles.iconBox, completed && styles.iconBoxCompleted]}>
                    {completed ? (
                      <Image source={{ uri: getStepPhoto(step.id)?.uri }} style={styles.stepThumbnail} />
                    ) : (
                      <Camera size={24} color="#94A3B8" />
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.stepLabel, completed && styles.stepLabelCompleted]}>
                      {step.label} {step.required && <Text style={styles.requiredMark}>*</Text>}
                    </Text>
                    <Text style={styles.stepDescription} numberOfLines={1}>{step.description}</Text>
                  </View>
                </View>
                {completed ? (
                  <View style={styles.completedBadge}>
                    <CheckCircle2 size={16} color="#10B981" />
                  </View>
                ) : (
                  <ChevronRight size={20} color="#CBD5E1" />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.helperTextRow}>
          <Info size={14} color="#64748B" />
          <Text style={styles.helperText}>Complete all required steps to finish</Text>
        </View>
        <TouchableOpacity 
          style={[styles.finishButton, !isFinished && styles.finishButtonDisabled]} 
          onPress={handleFinish}
          disabled={!isFinished}
        >
          <LinearGradient
            colors={isFinished ? ['#1E293B', '#334155'] : ['#E2E8F0', '#E2E8F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishGradient}
          >
            <Text style={[styles.finishButtonText, !isFinished && styles.finishButtonTextDisabled]}>
              Complete Inspection
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0787e2',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 24,
  },
  progressCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0787e2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  progressGradient: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTextGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  stepsList: {
    flex: 1,
  },
  stepsContent: {
    padding: 24,
    paddingBottom: 40,
  },
  stepItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepItemCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  stepThumbnail: {
    width: '100%',
    height: '100%',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxCompleted: {
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepLabelCompleted: {
    color: '#065F46',
  },
  stepDescription: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  requiredMark: {
    color: '#EF4444',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  helperTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  finishButton: {
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  finishButtonTextDisabled: {
    color: '#94A3B8',
  },
});
