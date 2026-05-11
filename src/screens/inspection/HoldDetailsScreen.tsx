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
  { id: 'z1', title: "Hatch Covers", subtitle: "11 sub-locations", total: 11, half: true },
  { id: 'z7', title: "Hatch Coamings", subtitle: "3 sub-locations", total: 3, half: true },
  { id: 'z3', title: "Forward Bulkhead and Stools", subtitle: "11 sub-locations", total: 11, full: true },
  { id: 'z6', title: "Portside", subtitle: "Ship side & hoppers · 11 sub-locations", total: 11, half: true },
  { id: 'z5', title: "Starboard", subtitle: "Ship side & hoppers · 11 sub-locations", total: 11, half: true },
  { id: 'z4', title: "AFT Bulkhead & Stools", subtitle: "11 sub-locations", total: 11, full: true },
  { id: 'z2', title: "Under Deck Areas", subtitle: "3 sub-locations", total: 3, half: true },
  { id: 'z9', title: "Ladders / Accessways", subtitle: "3 sub-locations", total: 3, half: true },
  { id: 'z8', title: "Tank Top", subtitle: "Includes Bilges · 5 sub-locations", total: 5, full: true },
];

function ZoneBox({ item, hold }: { item: typeof ZONES[0], hold: typeof HOLDS[0] }) {
  const navigation = useNavigation<any>();
  const completedByZone = useZoneProgressStore((s) => s.completedByZone);
  const compositeKey = `${hold.id}-${item.id}`;
  const { pct } = zoneProgressCounts(completedByZone, compositeKey, item.total);
  const completed = pct === 100;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ZoneDetails' as never, {
          holdId: hold.id,
          zoneId: item.id,
          zoneTitle: item.title,
          totalSublocations: item.total,
        } as never)
      }
      style={[
        styles.holdBox,
        item.full ? styles.holdFullBox : styles.holdHalfBox,
        completed && styles.holdBoxCompleted
      ]}
    >
      <View style={styles.holdBoxHeader}>
        <Text style={[styles.holdBoxTitle, completed && styles.holdBoxTitleCompleted]}>
          {item.id.replace('z', '')}. {item.title}
        </Text>
        {completed && <CheckCircle2 size={14} color="#10B981" />}
      </View>

      <Text style={styles.holdBoxSubtitle}>{item.subtitle}</Text>
      
      {/* Progress Indicator */}
      <View style={styles.holdBoxProgressTrack}>
        <View style={[
          styles.holdBoxProgressFill, 
          { width: `${pct}%` },
          completed && { backgroundColor: '#10B981' }
        ]} />
      </View>
    </TouchableOpacity>
  );
}

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

  const allZonesCompleted = useMemo(() => {
    return ZONES.every(zone => {
      const compositeKey = `${hold.id}-${zone.id}`;
      const { pct } = zoneProgressCounts(completedByZone, compositeKey, zone.total);
      return pct === 100;
    });
  }, [completedByZone, hold.id]);

  const renderShotCard = (shot: any, wide: boolean = false, extraWide: boolean = false) => {
    const isSpecial = shot.id === 's6';
    const color = isSpecial ? '#1D8F5A' : '#4A90E2';
    const bg = isSpecial ? '#EAF8F1' : '#EEF5FF';
    
    return (
      <TouchableOpacity
        style={[
          styles.shotCard,
          wide && styles.wideShotCard,
          extraWide && styles.extraWideShotCard,
          {
            borderColor: shot.completed ? '#10B981' : color,
            backgroundColor: shot.completed ? '#F0FDF4' : bg,
            borderStyle: shot.completed ? 'solid' : 'dashed',
          },
        ]}
        onPress={() => onTakeShot(hold.id, shot.id)}
        activeOpacity={0.8}
      >
        {shot.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{shot.badge}</Text>
          </View>
        )}

        {shot.completed && shot.uri ? (
          <Image source={{ uri: shot.uri }} style={styles.shotImage} />
        ) : (
          <Camera size={26} color={color} style={styles.shotIcon} />
        )}

        <Text style={[styles.shotCardTitle, { color: shot.completed ? '#065F46' : color }]}>
          {shot.label}
        </Text>

        <Text style={[styles.shotCardSubtitle, { color: shot.completed ? '#059669' : color }]}>
          shot {shot.id.replace('s', '')} {shot.id === 's5' ? '· ↓' : shot.id === 's6' ? '· upward ↑' : ''}
        </Text>

        {shot.completed && (
          <View style={styles.completedIndicator}>
            <CheckCircle2 size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
                <View style={[styles.shotCounter, completedShots === 6 && styles.shotCounterCompleted]}>
                  <Text style={[styles.shotCounterText, completedShots === 6 && styles.shotCounterTextCompleted]}>
                    {completedShots}/6
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitle}>Capture required angles for compliance</Text>
              <View style={styles.shotsProgressBarOuter}>
                <View style={[styles.shotsProgressBarInner, { width: `${(completedShots / 6) * 100}%` }, completedShots === 6 && { backgroundColor: '#10B981' }]} />
              </View>
            </View>
          </View>

          <View style={styles.gridWrapper}>
            <Text style={styles.topLabel}>↑ FWD · HOLD INTERIOR</Text>

            {/* TOP ROW: Forward bulkhead (s1) */}
            <View style={styles.centerRow}>
              {renderShotCard(shots.find(s => s.id === 's1')!, true)}
            </View>

            {/* MIDDLE ROW: Port (s3), Tank top (s5), Starboard (s4) */}
            <View style={styles.row}>
              {renderShotCard(shots.find(s => s.id === 's3')!)}
              {renderShotCard(shots.find(s => s.id === 's5')!)}
              {renderShotCard(shots.find(s => s.id === 's4')!)}
            </View>

            {/* CENTER GREEN ROW: Hold interior (s6) */}
            <View style={styles.centerRow}>
              {renderShotCard(shots.find(s => s.id === 's6')!, false, true)}
            </View>

            {/* BOTTOM ROW: Aft bulkhead (s2) */}
            <View style={styles.centerRow}>
              {renderShotCard(shots.find(s => s.id === 's2')!, true)}
            </View>

            <Text style={styles.bottomLabel}>↓ AFT</Text>
          </View>
        </View>

        {/* Zones Section - Replaced with New Design */}
        <View style={styles.holdLayoutWrapper}>
          <Text style={styles.holdLayoutDirection}>↑ FWD · {hold.title.toUpperCase()}</Text>

          <View style={styles.holdLayoutContainer}>
            <View style={styles.holdLayoutRow}>
              <ZoneBox item={ZONES[0]} hold={hold} />
              <ZoneBox item={ZONES[1]} hold={hold} />
            </View>

            <ZoneBox item={ZONES[2]} hold={hold} />

            <View style={styles.holdLayoutRow}>
              <ZoneBox item={ZONES[3]} hold={hold} />
              <ZoneBox item={ZONES[4]} hold={hold} />
            </View>

            <ZoneBox item={ZONES[5]} hold={hold} />

            <View style={styles.holdLayoutRow}>
              <ZoneBox item={ZONES[6]} hold={hold} />
              <ZoneBox item={ZONES[7]} hold={hold} />
            </View>

            <ZoneBox item={ZONES[8]} hold={hold} />

            <Text style={styles.holdLayoutDirection}>↓ AFT</Text>
          </View>
        </View>

        {/* Sign and Upload Button - Visible only when 100% complete */}
        {allZonesCompleted && completedShots === 6 && (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => {
              alert('Hold data signed and uploaded successfully!');
              // Here we could update status in the DB or store
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadGradient}
            >
              <CheckCircle2 size={24} color="#FFF" />
              <Text style={styles.uploadButtonText}>Sign and upload the data online</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
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
  const mandatoryShotsUriMap = useHoldInspectionDraftStore((s) => s.mandatoryShotsUriMap);
  const completedByZone = useZoneProgressStore((s) => s.completedByZone);

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
            {HOLDS.map((hold, index) => {
              // Calculate if this hold is 100% complete
              const holdShots = mandatoryShotsUriMap?.[hold.id] || {};
              const shotsCount = Object.keys(holdShots).length;
              
              const allZonesForThisHoldCompleted = ZONES.every(zone => {
                const compositeKey = `${hold.id}-${zone.id}`;
                const { pct } = zoneProgressCounts(completedByZone, compositeKey, zone.total);
                return pct === 100;
              });

              const isFullyComplete = shotsCount === 6 && allZonesForThisHoldCompleted;

              return (
                <TouchableOpacity 
                  key={hold.id} 
                  onPress={() => handleHoldPress(index)}
                  style={[
                    styles.holdTab, 
                    activeIndex === index && styles.holdTabActive,
                    isFullyComplete && styles.holdTabCompleted
                  ]}
                  activeOpacity={0.9}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[
                      styles.holdTabText, 
                      activeIndex === index && styles.holdTabTextActive,
                      isFullyComplete && styles.holdTabTextCompleted
                    ]}>
                      HOLD {index + 1}
                    </Text>
                    {isFullyComplete && (
                      <CheckCircle2 size={10} color="#059669" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  holdTabCompleted: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  holdTabTextCompleted: {
    color: '#059669',
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
  // Mandatory Shots Grid Layout
  gridWrapper: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D9D9D9',
    paddingVertical: 28,
    paddingHorizontal: 4, // Aggressively reduced padding
    marginHorizontal: 8, // Aggressively reduced outer margin
  },
  topLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 20,
    letterSpacing: 1,
  },
  bottomLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 10,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center', // Centered to control gaps precisely
    marginBottom: 16,
  },
  centerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  shotCard: {
    width: (width - 16 - 8 - 12) / 3, // Further maximized for reduced margins
    marginHorizontal: 2,
    minHeight: 110,
    borderWidth: 2,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  wideShotCard: {
    width: (width - 16 - 8) * 0.5, // Scaled for new container width
  },
  extraWideShotCard: {
    width: (width - 16 - 8) * 0.75, // Scaled for new container width
  },
  shotIcon: {
    marginBottom: 8,
  },
  shotImage: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  shotCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
  shotCardSubtitle: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#B8F5CE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#1D8F5A',
  },
  completedIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  // New Hold Layout Design Styles
  holdLayoutWrapper: {
    padding: 16,
    backgroundColor: '#F1F5F9', // Blended with app bg
  },
  holdLayoutDirection: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
    marginVertical: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  holdLayoutContainer: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 24,
    padding: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  holdLayoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  holdBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  holdBoxCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  holdHalfBox: {
    width: "48.5%",
  },
  holdFullBox: {
    width: "100%",
  },
  holdBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  holdBoxTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginRight: 6,
  },
  holdBoxTitleCompleted: {
    color: '#065F46',
  },
  holdBoxSubtitle: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 15,
    fontWeight: '500',
  },
  holdBoxProgressTrack: {
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 1.5,
    marginTop: 12,
    overflow: 'hidden',
    width: '60%',
    alignSelf: 'center',
  },
  holdBoxProgressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  uploadButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
});
