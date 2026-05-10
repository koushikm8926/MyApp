import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Platform, 
  Image, 
  Modal, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, Plus, X, Search, Filter, Hash, ChevronRight, CheckCircle2, Clock, MapPin, Navigation, Edit, Trash2, Calendar, Droplets, ArrowRight, Shield, Map as MapIcon, Activity, Play, Image as ImageIcon, ClipboardCheck, Tag, Info, ChevronDown, Edit2, Camera, Sparkles, Layers, Ship, TrendingUp, AlertCircle, MoreVertical, FileText, PaintBucket } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { databaseService } from '../../services/databaseService';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => (CURRENT_YEAR - i).toString());

const INSPECTION_OPTIONS = [
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
    screen: 'WalkTheHold',
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

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const { inspections, currentInspection, isLoading, loadInspections, startInspection } = useInspectionStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [vessels, setVessels] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const [isAddVesselVisible, setAddVesselVisible] = useState(false);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMakeDropdownOpen, setIsMakeDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadInspections(user.id);
      loadVessels(user.id);
    }
  }, [user]);

  const loadVessels = async (userId: string) => {
    try {
      const data = await databaseService.getVessels(userId);
      setVessels(data);
    } catch (err) {
      console.error('Failed to load vessels', err);
    }
  };

  const handleAddVessel = async () => {
    const finalMake = selectedMake === 'Other / Custom' ? customMake : selectedMake;
    const finalModel = selectedModel === 'Other / Custom' ? customModel : selectedModel;

    if (!user || !finalMake || !finalModel) return;
    
    setIsSubmitting(true);
    try {
      await databaseService.addVessel({
        id: Math.random().toString(36).substring(7),
        userId: user.id,
        make: finalMake,
        model: finalModel,
        year,
        plate
      });
      setAddVesselVisible(false);
      setSelectedMake('');
      setSelectedModel('');
      setCustomMake('');
      setCustomModel('');
      setYear('');
      setPlate('');
      if (user) loadVessels(user.id);
    } catch (err) {
      console.error('Failed to add vessel', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const finalMake = selectedMake === 'Other / Custom' ? customMake : selectedMake;
    const finalModel = selectedModel === 'Other / Custom' ? customModel : selectedModel;
    return finalMake.trim().length > 0 && finalModel.trim().length > 0;
  };

  const filteredVessels = vessels.filter(v => 
    `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.plate && v.plate.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'makeAsc') {
      return a.make.localeCompare(b.make);
    } else if (sortBy === 'yearDesc') {
      return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    } else if (sortBy === 'yearAsc') {
      return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
    }
    return 0;
  });

  const handleActionPress = (screen: string | null, locked: boolean) => {
    if (!screen || locked) return;
    navigation.navigate(screen);
  };

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

  const handleSelectVessel = async (vessel: any) => {
    setModalVisible(false);
    if (selectedScreen && user) {
      try {
        const inspectionId = await startInspection(
          user.id, 
          vessel.id, 
          `${vessel.make} ${vessel.model}`, 
          vessel.plate || 'N/A'
        );
        
        // Use navigate with the root navigator if possible, or bubbling
        navigation.navigate(selectedScreen, { 
          vesselId: vessel.id, 
          vesselName: `${vessel.make} ${vessel.model}`,
          inspectionId: inspectionId
        });
      } catch (err) {
        console.error('Failed to start inspection', err);
      }
    }
  };

  const renderSpiderCard = (item: any, isCenter = false) => {
    const Icon = item.icon;
    const completed = isStepCompleted(item.id, item.dataKey);
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={[
          styles.spiderCard, 
          isCenter && styles.spiderCardCenter,
          completed && styles.completedCard
        ]} 
        onPress={() => navigation.navigate(item.screen)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={completed ? ['#10B981', '#059669'] : item.colors as [string, string]}
          style={[styles.spiderIconBg, isCenter && styles.spiderIconBgCenter]}
        >
          {completed ? <CheckCircle2 size={isCenter ? 28 : 22} color="#FFF" /> : <Icon size={isCenter ? 28 : 22} color={item.iconColor} />}
        </LinearGradient>
        <Text style={[styles.spiderCardTitle, completed && styles.completedTitle]} numberOfLines={2}>
          {item.title}
        </Text>
        {completed && (
          <View style={styles.spiderCompletedBadge}>
            <CheckCircle2 size={10} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Good morning,</Text>
              <Text style={styles.userNameText}>{user?.name || 'Surveyor'}</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256' }} 
                style={styles.profileAvatar} 
                accessibilityLabel="Profile Picture"
              />
              <View style={styles.onlineBadge} />
            </TouchableOpacity>
          </View>

          {/* Moved Title & Subtitle here */}
          <View style={styles.headerTextSection}>
            <Text style={styles.sectionTitle}>Inspection Sequence</Text>
            <Text style={styles.sectionSubtitle}>Complete the steps below for hold cleaning</Text>
          </View>
        </View>

        {/* Center the Inspection Section in remaining space */}
        <View style={styles.mainContent}>
          {/* Inspection Sequence Section */}
          <View style={styles.section}>

          <View style={styles.spiderContainer}>
            {/* Connection Lines (Plus Shape) */}
            <View style={styles.spiderLinesContainer}>
              <View style={styles.plusLineVertical} />
              <View style={styles.plusLineHorizontal} />
            </View>

            <View style={styles.plusGrid}>
              {/* Top Row */}
              <View style={styles.plusRowTop}>
                <View style={styles.plusSideCard}>
                  {renderSpiderCard(INSPECTION_OPTIONS[0])}
                </View>
              </View>

              {/* Middle Row: Left, Center, Right */}
              <View style={styles.plusRowMiddle}>
                <View style={styles.plusSideCard}>
                  {renderSpiderCard(INSPECTION_OPTIONS[3])}
                </View>
                <View style={styles.plusSideCard}>
                  {renderSpiderCard(INSPECTION_OPTIONS[2])}
                </View>
                <View style={styles.plusSideCard}>
                  {renderSpiderCard(INSPECTION_OPTIONS[1])}
                </View>
              </View>

              {/* Bottom Row */}
              <View style={styles.plusRowBottom}>
                <View style={styles.plusSideCard}>
                  {renderSpiderCard(INSPECTION_OPTIONS[4])}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      </ScrollView>

      {/* Vessel Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || 24 }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Vessel</Text>
                <Text style={styles.modalSubtitle}>Identify the target for inspection</Text>
              </View>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity 
                  style={styles.headerAddBtn} 
                  onPress={() => setAddVesselVisible(true)}
                >
                  <Plus size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {vessels.length > 0 && (
              <View style={styles.modalSearchContainer}>
                <View style={styles.modalSearchBar}>
                  <Search size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search vessels..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <TouchableOpacity style={styles.modalFilterBtn} onPress={() => setFilterVisible(true)}>
                  <Filter size={18} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}

            {vessels.length > 0 ? (
              <FlatList
                data={filteredVessels}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.vesselList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.vesselItem}
                    onPress={() => handleSelectVessel(item)}
                  >
                    <View style={styles.vesselIconBg}>
                      <Car size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.vesselInfo}>
                      <Text style={styles.vesselMakeModel}>{item.make} {item.model}</Text>
                      <Text style={styles.vesselPlate}>{item.plate || 'No Plate'} • {item.year || 'N/A'}</Text>
                    </View>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyVessels}>
                <Car size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyVesselsText}>No vessels registered yet</Text>
                <TouchableOpacity 
                  style={styles.addVesselBtn}
                  onPress={() => setAddVesselVisible(true)}
                >
                  <Text style={styles.addVesselBtnText}>Register Your First Vessel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Vessel Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddVesselVisible}
        onRequestClose={() => setAddVesselVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Vessel</Text>
                <Text style={styles.modalSubtitle}>Enter details for the permanent record</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setAddVesselVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
              <View style={styles.form}>
                
                {/* BRAND DROPDOWN */}
                <Text style={styles.inputLabel}>MANUFACTURER</Text>
                <TouchableOpacity 
                  style={[styles.inputGroup, isMakeDropdownOpen && styles.inputGroupOpen]} 
                  onPress={() => {
                    setIsMakeDropdownOpen(!isMakeDropdownOpen);
                    setIsModelDropdownOpen(false);
                    setIsYearDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Tag size={18} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={[styles.input, !selectedMake && { color: '#94A3B8' }]}>
                    {selectedMake || 'Select Brand'}
                  </Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity>

                {isMakeDropdownOpen && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                      {CAR_BRANDS.map(b => (
                        <TouchableOpacity 
                          key={b.brand} 
                          style={[styles.dropdownItem, selectedMake === b.brand && styles.dropdownItemActive]}
                          onPress={() => {
                            setSelectedMake(b.brand);
                            setSelectedModel('');
                            setIsMakeDropdownOpen(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, selectedMake === b.brand && styles.dropdownItemTextActive]}>{b.brand}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedMake === 'Other / Custom' && (
                  <View style={styles.inputGroup}>
                    <Edit2 size={18} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Custom Brand Name"
                      value={customMake}
                      onChangeText={setCustomMake}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                )}

                {/* MODEL DROPDOWN */}
                <Text style={styles.inputLabel}>MODEL</Text>
                <TouchableOpacity 
                  style={[
                    styles.inputGroup, 
                    isModelDropdownOpen && styles.inputGroupOpen,
                    !selectedMake && styles.inputGroupDisabled
                  ]} 
                  onPress={() => {
                    if (!selectedMake) return;
                    setIsModelDropdownOpen(!isModelDropdownOpen);
                    setIsMakeDropdownOpen(false);
                    setIsYearDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                  disabled={!selectedMake}
                >
                  <Car size={18} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={[styles.input, !selectedModel && { color: '#94A3B8' }]}>
                    {selectedModel || 'Select Model'}
                  </Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity>

                {isModelDropdownOpen && selectedMake && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                      {(CAR_BRANDS.find(b => b.brand === selectedMake)?.models || []).concat(['Other / Custom']).map(m => (
                        <TouchableOpacity 
                          key={m} 
                          style={[styles.dropdownItem, selectedModel === m && styles.dropdownItemActive]}
                          onPress={() => {
                            setSelectedModel(m);
                            setIsModelDropdownOpen(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, selectedModel === m && styles.dropdownItemTextActive]}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedModel === 'Other / Custom' && (
                  <View style={styles.inputGroup}>
                    <Edit2 size={18} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Custom Model Name"
                      value={customModel}
                      onChangeText={setCustomModel}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                )}

                {/* YEAR DROPDOWN */}
                <Text style={styles.inputLabel}>MANUFACTURE YEAR</Text>
                <TouchableOpacity 
                  style={[styles.inputGroup, isYearDropdownOpen && styles.inputGroupOpen]} 
                  onPress={() => {
                    setIsYearDropdownOpen(!isYearDropdownOpen);
                    setIsMakeDropdownOpen(false);
                    setIsModelDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Calendar size={18} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={[styles.input, !year && { color: '#94A3B8' }]}>
                    {year || 'Select Year'}
                  </Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity>

                {isYearDropdownOpen && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                      {YEARS.map(y => (
                        <TouchableOpacity 
                          key={y} 
                          style={[styles.dropdownItem, year === y && styles.dropdownItemActive]}
                          onPress={() => {
                            setYear(y);
                            setIsYearDropdownOpen(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, year === y && styles.dropdownItemTextActive]}>{y}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.inputLabel}>IDENTIFICATION</Text>
                <View style={styles.inputGroup}>
                  <Hash size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Plate Number"
                    value={plate}
                    onChangeText={setPlate}
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.infoBox}>
                  <Info size={16} color="#3B82F6" />
                  <Text style={styles.infoText}>Accurate details ensure compliance with international maritime inspection standards.</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, !isFormValid() && styles.submitButtonDisabled]}
                  onPress={handleAddVessel}
                  disabled={!isFormValid() || isSubmitting}
                >
                  <LinearGradient
                    colors={!isFormValid() ? ['#E2E8F0', '#E2E8F0'] : COLORS.primaryGradient}
                    style={styles.submitGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Confirm Registration</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    marginTop: -10, // Lift the section up
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextSection: {
    marginTop: 20,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userNameText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.secondary,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  timelineContainer: {
    paddingTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 16,
    width: 48,
    zIndex: 10,
  },
  timelineIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 48,
    bottom: -20,
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
    borderRadius: 1,
  },
  timelineCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  statusPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Plus Layout Styles
  spiderContainer: {
    width: '100%',
    height: (width * 0.3) * 3 + 40, // 3 boxes + 2 gaps of 20
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  spiderLinesContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  plusLineVertical: {
    position: 'absolute',
    width: 2,
    height: '75%',
    backgroundColor: '#F1F5F9',
    borderRadius: 1,
  },
  plusLineHorizontal: {
    position: 'absolute',
    width: '85%',
    height: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 1,
  },
  plusGrid: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 0,
    zIndex: 1,
  },
  plusRowTop: {
    alignItems: 'center',
  },
  plusRowMiddle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusRowBottom: {
    alignItems: 'center',
  },
  plusSideCard: {
    width: width * 0.3,
    height: width * 0.3,
    marginHorizontal: 10, // horizontal gap / 2
  },
  spiderCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 4,
  },
  spiderCardCenter: {
    // Kept for function signature compatibility but empty as all cards are now uniform
  },
  spiderIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  spiderIconBgCenter: {
    // Kept for function signature compatibility but same as spiderIconBg
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  spiderCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  spiderCompletedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Modal Styles remain essentially the same but polished
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSearchBar: {
    flex: 1,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalFilterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vesselList: {
    maxHeight: height * 0.5,
  },
  vesselItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vesselIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselMakeModel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  vesselPlate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyVessels: {
    padding: 40,
    alignItems: 'center',
  },
  emptyVesselsText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  addVesselBtn: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addVesselBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  formScroll: {
    marginTop: 8,
  },
  form: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 1,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputGroupDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputGroupOpen: {
    borderColor: '#3B82F6',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  dropdownContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    height: 150,
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownItemTextActive: {
    color: '#3B82F6',
    fontWeight: '800',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 32,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
