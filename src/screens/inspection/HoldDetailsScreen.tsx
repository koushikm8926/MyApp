import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Camera, CheckCircle2, ChevronRight, Layers } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import CustomCameraModal from '../../components/CustomCameraModal';
import {
  SUBLOCATIONS_PER_ZONE,
  useZoneProgressStore,
  zoneProgressCounts,
} from '../../store/useZoneProgressStore';
import {
  useHoldInspectionDraftStore,
  useMandatoryShotsUriMap,
} from '../../store/useHoldInspectionDraftStore';

const MANDATORY_SHOT_SLOTS = [
  { id: 's1', label: 'Shot 1' },
  { id: 's2', label: 'Shot 2' },
  { id: 's3', label: 'Shot 3' },
  { id: 's4', label: 'Shot 4' },
  { id: 's5', label: 'Shot 5' },
] as const;

const ZONES = [
  { id: 'z1', title: 'Hatch Cover' },
  { id: 'z2', title: 'Under Deck Area' },
  { id: 'z3', title: 'Forward Bulk Head & Stools' },
  { id: 'z4', title: 'Aft Bulkhead & Stools' },
  { id: 'z5', title: 'Starboard' },
  { id: 'z6', title: 'Portside' },
  { id: 'z7', title: 'Hatch Coaming' },
  { id: 'z8', title: 'Tank Top' },
  { id: 'z9', title: 'Ladders' },
];

export default function HoldDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const holdTitle = route.params?.title || 'Hold Details';
  const holdId = route.params?.holdId || 'unknown-hold';

  const shotUriById = useMandatoryShotsUriMap(holdId);
  const setMandatoryShotUri = useHoldInspectionDraftStore((s) => s.setMandatoryShotUri);

  const shots = useMemo(
    () =>
      MANDATORY_SHOT_SLOTS.map((s) => ({
        ...s,
        uri: shotUriById[s.id] ?? null,
        completed: !!shotUriById[s.id],
      })),
    [shotUriById]
  );

  const [isCameraVisible, setCameraVisible] = useState(false);
  const [activeShotId, setActiveShotId] = useState<string | null>(null);

  const handleTakeShot = (id: string) => {
    setActiveShotId(id);
    setCameraVisible(true);
  };

  const onPictureTaken = (uri: string) => {
    if (activeShotId) {
      setMandatoryShotUri(holdId, activeShotId, uri);
    }
  };

  const completedShots = shots.filter((s) => s.completed).length;

  const completedByZone = useZoneProgressStore((s) => s.completedByZone);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#8B5CF6', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{holdTitle}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Mandatory Shots Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mandatory Shots</Text>
            <Text style={styles.progressText}>{completedShots}/5 Completed</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shotsScroll}
          >
            {shots.map((shot, index) => (
              <View 
                key={shot.id}
              >
                <TouchableOpacity 
                  style={[styles.shotCard, shot.completed && styles.shotCardCompleted]}
                  onPress={() => handleTakeShot(shot.id)}
                  activeOpacity={0.8}
                >
                  {shot.completed && shot.uri ? (
                    <View style={styles.shotImageContainer}>
                      <Image source={{ uri: shot.uri }} style={styles.shotImage} />
                      <View style={styles.shotOverlay}>
                        <CheckCircle2 size={28} color="#10B981" fill="#FFFFFF" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.shotEmptyState}>
                      <Camera size={32} color="#A78BFA" />
                      <Text style={styles.shotLabel}>{shot.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Zones Section */}
        <View style={styles.section}>
          <View style={styles.zonesList}>
            {ZONES.map((zone) => {
              const { completed, total, pct } = zoneProgressCounts(
                completedByZone,
                zone.id,
                SUBLOCATIONS_PER_ZONE
              );
              return (
                <View key={zone.id}>
                  <TouchableOpacity
                    style={styles.zoneCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('ZoneDetails' as never, {
                        holdId,
                        zoneId: zone.id,
                        zoneTitle: zone.title,
                      } as never)
                    }
                  >
                    <View style={styles.zoneIconContainer}>
                      <Layers size={20} color="#8B5CF6" />
                    </View>

                    <View style={styles.zoneContent}>
                      <View style={styles.zoneTitleRow}>
                        <Text style={styles.zoneTitle}>{zone.title}</Text>
                        <Text style={styles.zonePercent}>{pct}%</Text>
                      </View>
                      <Text style={styles.zoneProgress}>
                        {completed}/{total} Sublocations completed
                      </Text>
                      <View style={styles.zoneProgressBarOuter}>
                        <View style={[styles.zoneProgressBarInner, { width: `${pct}%` }]} />
                      </View>
                    </View>

                    <ChevronRight size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      <CustomCameraModal 
        visible={isCameraVisible} 
        onClose={() => setCameraVisible(false)} 
        onPictureTaken={onPictureTaken} 
        guideText={shots.find(s => s.id === activeShotId)?.label || "CAPTURE PHOTO"}
      />
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  shotsScroll: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  shotCard: {
    width: 120,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  shotCardCompleted: {
    borderStyle: 'solid',
    borderColor: '#10B981',
    borderWidth: 3,
  },
  shotEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shotLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  shotImageContainer: {
    flex: 1,
    position: 'relative',
  },
  shotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shotOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
  },
  zonesList: {
    paddingHorizontal: 24,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  zoneIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  zoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  zoneTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  zonePercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  zoneProgress: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  zoneProgressBarOuter: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  zoneProgressBarInner: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
});
