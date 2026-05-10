import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Layers,
  ChevronLeft,
  Info,
  Ship,
} from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

const HOLDS = [
  { id: 'hold-1', title: 'Hold No. 1', description: 'Forward cargo hold' },
  { id: 'hold-2', title: 'Hold No. 2', description: 'Mid-forward cargo hold' },
  { id: 'hold-3', title: 'Hold No. 3', description: 'Center cargo hold' },
  { id: 'hold-4', title: 'Hold No. 4', description: 'Mid-aft cargo hold' },
  { id: 'hold-5', title: 'Hold No. 5', description: 'Aft cargo hold' },
];

const MANDATORY_SHOT_SLOTS = [
  { id: 's1', label: 'Forward bulkhead', sublabel: 'Full View', position: 'top' },
  { id: 's2', label: 'Aft bulkhead', sublabel: 'Full View', position: 'bottom' },
  { id: 's3', label: 'Port side', sublabel: 'Full View', position: 'topLeft' },
  { id: 's4', label: 'Starboard side', sublabel: 'Full View', position: 'topRight' },
  { id: 's5', label: 'Tank top', sublabel: 'Full View', position: 'bottomRight' },
  { id: 's6', label: 'Hold interior', sublabel: 'Upward Profile', position: 'bottomLeft', badge: 'NEW' },
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

function HoldContent({ hold, onTakeShot }: { hold: typeof HOLDS[0], onTakeShot: (holdId: string, shotId: string) => void }) {
  const navigation = useNavigation<any>();
  const shotUriById = useMandatoryShotsUriMap(hold.id);
  const completedByZone = useZoneProgressStore((s) => s.completedByZone);

  const shots = useMemo(
    () =>
      MANDATORY_SHOT_SLOTS.map((s) => ({
        ...s,
        uri: shotUriById[s.id] ?? null,
        completed: !!shotUriById[s.id],
      })),
    [shotUriById]
  );

  const completedShots = shots.filter((s) => s.completed).length;

  return (
    <View style={styles.holdPage}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Removed Hold Info Card per user request */}

        {/* Mandatory Shots Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>Mandatory Shots</Text>
                <View style={[styles.shotCounter, completedShots === 5 && styles.shotCounterCompleted]}>
                  <Text style={[styles.shotCounterText, completedShots === 5 && styles.shotCounterTextCompleted]}>
                    {completedShots}/5
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitle}>Capture required angles for compliance</Text>
              <View style={styles.shotsProgressBarOuter}>
                <View style={[styles.shotsProgressBarInner, { width: `${(completedShots / 6) * 100}%` }, completedShots === 6 && { backgroundColor: '#10B981' }]} />
              </View>
            </View>
          </View>

          <View style={styles.hexagonWrapper}>
            <View style={styles.hexagonContainer}>
              {/* CENTER CARD */}
              <View style={[styles.hexCard, styles.centerCard]}>
                <Ship size={24} color="#000" style={styles.hexIconRotate} />
                <Text style={styles.centerText}>{hold.title.toUpperCase()}</Text>
              </View>

              {shots.map((shot) => {
                const positionStyle = styles[`${shot.position}Card` as keyof typeof styles];
                return (
                  <TouchableOpacity 
                    key={shot.id}
                    style={[
                      styles.hexCard,
                      positionStyle,
                      shot.completed && styles.hexCardCompleted
                    ]}
                    onPress={() => onTakeShot(hold.id, shot.id)}
                    activeOpacity={0.9}
                  >
                    {shot.completed && shot.uri ? (
                      <View style={styles.hexImageContainer}>
                        <Image source={{ uri: shot.uri }} style={styles.hexImage} />
                        <View style={styles.hexImageOverlay}>
                           <CheckCircle2 size={14} color="#10B981" style={styles.hexIconRotate} />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.hexEmptyState}>
                         <Camera size={20} color="#94A3B8" style={styles.hexIconRotate} />
                         <Text style={styles.hexLabel}>{shot.label.split(' ')[0]}</Text>
                         {shot.badge && (
                            <View style={styles.hexBadge}>
                              <Text style={styles.hexBadgeText}>{shot.badge}</Text>
                            </View>
                         )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Zones Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Detailed Zones</Text>
              <Text style={styles.sectionSubtitle}>Specific areas to inspect within {hold.title}</Text>
            </View>
          </View>
          
          <View style={styles.zonesList}>
            {ZONES.map((zone) => {
              const { completed, total, pct } = zoneProgressCounts(
                completedByZone,
                zone.id,
                SUBLOCATIONS_PER_ZONE
              );
              return (
                <TouchableOpacity
                  key={zone.id}
                  style={styles.zoneCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ZoneDetails' as never, {
                      holdId: hold.id,
                      zoneId: zone.id,
                      zoneTitle: zone.title,
                    } as never)
                  }
                >
                  <View style={[styles.zoneIconContainer, pct === 100 && styles.zoneIconCompleted]}>
                    {pct === 100 ? (
                      <CheckCircle2 size={20} color="#10B981" />
                    ) : (
                      <Layers size={20} color="#8B5CF6" />
                    )}
                  </View>

                  <View style={styles.zoneContent}>
                    <View style={styles.zoneTitleRow}>
                      <Text style={styles.zoneTitle}>{zone.title}</Text>
                      <Text style={styles.zonePercent}>{pct}%</Text>
                    </View>
                    <View style={styles.zoneProgressBarOuter}>
                      <View style={[styles.zoneProgressBarInner, { width: `${pct}%` }, pct === 100 && { backgroundColor: '#10B981' }]} />
                    </View>
                  </View>

                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function HoldDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const initialHoldId = route.params?.holdId || 'hold-1';
  const initialIndex = HOLDS.findIndex(h => h.id === initialHoldId);
  
  const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [activeShotInfo, setActiveShotInfo] = useState<{holdId: string, shotId: string} | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const setMandatoryShotUri = useHoldInspectionDraftStore((s) => s.setMandatoryShotUri);

  const handleTakeShot = (holdId: string, shotId: string) => {
    setActiveShotInfo({ holdId, shotId });
    setCameraVisible(true);
  };

  const onPictureTaken = (uri: string) => {
    if (activeShotInfo) {
      setMandatoryShotUri(activeShotInfo.holdId, activeShotInfo.shotId, uri);
    }
  };

  const handleHoldPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const onMomentumScrollEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#312E81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Hold Inspection</Text>
            <Text style={styles.headerSubtitle}>Vessel Walkthrough</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Hold Selector Tabs */}
        <View style={styles.holdSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.holdSelectorScroll}>
            {HOLDS.map((hold, index) => (
              <TouchableOpacity 
                key={hold.id} 
                onPress={() => handleHoldPress(index)}
                style={[
                  styles.holdTab, 
                  activeIndex === index && styles.holdTabActive
                ]}
                activeOpacity={0.9}
              >
                <Text style={[
                  styles.holdTabText, 
                  activeIndex === index && styles.holdTabTextActive
                ]}>
                  HOLD {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={HOLDS}
        renderItem={({ item }) => <HoldContent hold={item} onTakeShot={handleTakeShot} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <CustomCameraModal 
        visible={isCameraVisible} 
        onClose={() => setCameraVisible(false)} 
        onPictureTaken={onPictureTaken} 
        guideText={MANDATORY_SHOT_SLOTS.find(s => s.id === activeShotInfo?.shotId)?.label || "CAPTURE PHOTO"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    elevation: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  holdSelector: {
    paddingBottom: 20,
  },
  holdSelectorScroll: {
    paddingHorizontal: 20,
  },
  holdTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  holdTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  holdTabText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  holdTabTextActive: {
    color: '#4F46E5',
  },
  activeTabIndicator: {
    display: 'none',
  },
  holdPage: {
    width: width,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  holdInfoCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 4,
  },
  holdInfoText: {
    flex: 1,
  },
  holdSubtitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
  },
  holdTitleDisplay: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  holdDescriptionDisplay: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  holdProgressBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdProgressText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3B82F6',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
  shotCounter: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shotCounterCompleted: {
    backgroundColor: '#ECFDF5',
  },
  shotCounterText: {
    color: '#4F46E5',
    fontWeight: '900',
    fontSize: 14,
  },
  shotCounterTextCompleted: {
    color: '#10B981',
  },
  shotsProgressBarOuter: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  shotsProgressBarInner: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  // Hexagon Layout Styles
  hexagonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hexagonContainer: {
    width: 320,
    height: 320,
    position: 'relative',
  },
  hexCard: {
    width: 100,
    height: 100,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ rotate: '45deg' }],
    overflow: 'hidden',
  },
  hexCardCompleted: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  centerCard: {
    left: 110,
    top: 110,
    backgroundColor: '#22D3EE',
    zIndex: 20,
    borderWidth: 0,
  },
  topCard: {
    left: 110,
    top: 0,
  },
  topLeftCard: {
    left: 20,
    top: 60,
  },
  topRightCard: {
    right: 20,
    top: 60,
  },
  bottomCard: {
    left: 110,
    bottom: 0,
  },
  bottomLeftCard: {
    left: 20,
    bottom: 60,
  },
  bottomRightCard: {
    right: 20,
    bottom: 60,
  },
  hexIconRotate: {
    transform: [{ rotate: '-45deg' }],
  },
  hexLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  centerText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
    transform: [{ rotate: '-45deg' }],
    textAlign: 'center',
  },
  hexEmptyState: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexImageContainer: {
    width: '142%', // Compensate for 45deg rotation to fill the card
    height: '142%',
    transform: [{ rotate: '-45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hexImageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 2,
  },
  hexBadge: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    transform: [{ rotate: '-45deg' }],
  },
  hexBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
  },
  zonesList: {
    paddingHorizontal: 24,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  zoneIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneIconCompleted: {
    backgroundColor: '#ECFDF5',
  },
  zoneContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  zoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  zoneTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  zonePercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3B82F6',
  },
  zoneProgressBarOuter: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  zoneProgressBarInner: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
});
