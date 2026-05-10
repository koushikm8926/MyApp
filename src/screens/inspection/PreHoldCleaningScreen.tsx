import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, StatusBar, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, FileText, Ship, PaintBucket, Navigation, Droplets, CheckCircle2, Search, X, Plus } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useInspectionStore } from '../../store/useInspectionStore';

const { width } = Dimensions.get('window');

const OPTIONS = [
  {
    id: 'pre-inspection',
    title: 'Pre-Inspection Doc',
    description: 'Review and verify pre-inspection documents',
    icon: FileText,
    colors: ['#3B82F6', '#2563EB'],
    iconColor: '#FFF',
    screen: 'PreInspectionDoc',
    dataKey: 'preInspectionDoc',
  },
  {
    id: 'vessel-particular',
    title: 'Vessel Particular',
    description: 'Detailed specifications and details of the vessel',
    icon: Ship,
    colors: ['#0EA5E9', '#0284C7'],
    iconColor: '#FFF',
    screen: 'VesselParticular',
    dataKey: 'vesselParticulars',
  },
  {
    id: 'cleaning-standards',
    title: 'Cleaning Standards',
    description: 'Checklist and protocols for hold cleaning',
    icon: PaintBucket,
    colors: ['#8B5CF6', '#7C3AED'],
    iconColor: '#FFF',
    screen: 'CleaningStandards',
    dataKey: 'cleaningStandards',
  },
  {
    id: 'walk-hold',
    title: 'Walk the Hold',
    description: 'Physical inspection and walk-through of the hold',
    icon: Navigation,
    colors: ['#F59E0B', '#D97706'],
    iconColor: '#FFF',
    screen: 'HoldDetails',
    dataKey: 'walkTheHold',
  },
  {
    id: 'days-fresh-water',
    title: 'Days & Fresh Water',
    description: 'Track fresh water usage and remaining days',
    icon: Droplets,
    colors: ['#10B981', '#059669'],
    iconColor: '#FFF',
    screen: 'DaysFreshWater',
    dataKey: 'daysFreshWater',
  },
];

export default function PreHoldCleaningScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { currentInspection } = useInspectionStore();

  const inspectionData = currentInspection ? JSON.parse(currentInspection.data || '{}') : {};

  const isStepCompleted = (id: string, dataKey: string) => {
    if (id === 'pre-inspection') {
      const subKeys = ['vesselParticulars', 'crewList', 'cleaningEquipment', 'lastCargoHistory'];
      return subKeys.every(key => {
        const section = inspectionData[key];
        return section && Object.keys(section).length > 0 && Object.values(section).some(v => v !== '' && v !== null && v !== undefined);
      });
    }
    return !!inspectionData[dataKey];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Seamless Modern Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hold Cleaning</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.subtitle}>Inspection Sequence</Text>
          <Text style={styles.description}>
            Follow this step-by-step guide to thoroughly complete the pre-hold cleaning process.
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {OPTIONS.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === OPTIONS.length - 1;
            const completed = isStepCompleted(item.id, item.dataKey);

            return (
              <View 
                key={item.id}
                style={styles.timelineRow}
              >
                <View style={styles.timelineConnector}>
                  <LinearGradient
                    colors={completed ? ['#10B981', '#059669'] : item.colors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.timelineIconBg}
                  >
                    {completed ? <CheckCircle2 size={24} color="#FFF" /> : <Icon size={22} color={item.iconColor} />}
                  </LinearGradient>
                  {!isLast && <View style={[styles.timelineLine, completed && { backgroundColor: '#10B981' }]} />}
                </View>
                
                <TouchableOpacity 
                  style={[styles.timelineCard, completed && styles.completedCard]} 
                  activeOpacity={item.screen ? 0.8 : 1}
                  onPress={() => item.screen ? navigation.navigate(item.screen as never) : null}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, completed && styles.completedTitle]}>{item.title}</Text>
                      {completed && (
                        <View style={styles.statusPill}>
                          <Text style={styles.statusPillText}>COMPLETED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <ChevronRight size={20} color={completed ? '#10B981' : '#CBD5E1'} />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  headerTextContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    fontWeight: '500',
  },
  timelineContainer: {
    paddingHorizontal: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 20,
    width: 56,
    zIndex: 10,
  },
  timelineIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 56,
    bottom: -24,
    width: 3,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
    borderRadius: 1.5,
  },
  timelineCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginRight: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCard: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F8FAFC',
  },
  completedTitle: {
    color: '#059669',
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusPillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // Added Styles for Vessel Selection
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFF',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 12,
    paddingHorizontal: 24,
    maxHeight: '85%',
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchContainer: {
    marginBottom: 20,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  vesselList: {
    marginTop: 8,
  },
  vesselItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vesselIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  vesselPlate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  emptyVessels: {
    padding: 40,
    alignItems: 'center',
  },
  emptyVesselsText: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
