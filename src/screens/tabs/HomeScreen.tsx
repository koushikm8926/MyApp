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
import { Car, Plus, X, Search, Filter, Hash, ChevronRight, CheckCircle2, Clock, MapPin, Navigation, Edit, Trash2, Calendar, Droplets, ArrowRight, Shield, Map as MapIcon, Activity, Play, Image as ImageIcon, ClipboardCheck, Tag, Info, ChevronDown, Edit2, Camera, Sparkles, Layers, Ship, Lock, TrendingUp, AlertCircle, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { databaseService } from '../../services/databaseService';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => (CURRENT_YEAR - i).toString());

const CAR_BRANDS = [
  { brand: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Hilux', 'Land Cruiser'] },
  { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit', 'HR-V'] },
  { brand: 'Ford', models: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Bronco', 'Ranger', 'Focus'] },
  { brand: 'Chevrolet', models: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Suburban', 'Camaro', 'Colorado'] },
  { brand: 'Nissan', models: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Frontier', 'Navara'] },
  { brand: 'BMW', models: ['3 Series', '5 Series', 'X3', 'X5', 'M3', 'M5', '7 Series'] },
  { brand: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'G-Class'] },
  { brand: 'Audi', models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q8'] },
  { brand: 'Tesla', models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'] },
  { brand: 'Volkswagen', models: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Polo'] },
  { brand: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona'] },
  { brand: 'Kia', models: ['Sportage', 'Sorento', 'Telluride', 'Optima', 'Forte', 'Soul'] },
  { brand: 'Other / Custom', models: [] }
];

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const { inspections, isLoading, loadInspections, startInspection } = useInspectionStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const [isAddVehicleVisible, setAddVehicleVisible] = useState(false);
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
      loadVehicles(user.id);
    }
  }, [user]);

  const loadVehicles = async (userId: string) => {
    try {
      const data = await databaseService.getVehicles(userId);
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    }
  };

  const handleAddVehicle = async () => {
    const finalMake = selectedMake === 'Other / Custom' ? customMake : selectedMake;
    const finalModel = selectedModel === 'Other / Custom' ? customModel : selectedModel;

    if (!user || !finalMake || !finalModel) return;
    
    setIsSubmitting(true);
    try {
      await databaseService.addVehicle({
        id: Math.random().toString(36).substring(7),
        userId: user.id,
        make: finalMake,
        model: finalModel,
        year,
        plate
      });
      setAddVehicleVisible(false);
      setSelectedMake('');
      setSelectedModel('');
      setCustomMake('');
      setCustomModel('');
      setYear('');
      setPlate('');
      if (user) loadVehicles(user.id);
    } catch (err) {
      console.error('Failed to add vehicle', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const finalMake = selectedMake === 'Other / Custom' ? customMake : selectedMake;
    const finalModel = selectedModel === 'Other / Custom' ? customModel : selectedModel;
    return finalMake.trim().length > 0 && finalModel.trim().length > 0;
  };

  const filteredVehicles = vehicles.filter(v => 
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
    setSelectedScreen(screen);
    setModalVisible(true);
  };

  const handleSelectVehicle = async (vehicle: any) => {
    setModalVisible(false);
    if (selectedScreen && user) {
      const inspectionId = await startInspection(
        user.id, 
        vehicle.id, 
        `${vehicle.make} ${vehicle.model}`, 
        vehicle.plate || 'N/A'
      );
      navigation.navigate(selectedScreen, { 
        vehicleId: vehicle.id, 
        vehicleName: `${vehicle.make} ${vehicle.model}`,
        inspectionId: inspectionId
      });
    }
  };

  const uniqueInspections = Array.from(new Map(inspections.map(item => [item.vehicleId, item])).values());
  const recentInspections = uniqueInspections.slice(0, 3);
  const totalCount = uniqueInspections.length;
  const pendingCount = uniqueInspections.filter(i => i.status === 'pending' || i.status === 'draft').length;
  const completedCount = uniqueInspections.filter(i => i.status === 'completed').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
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
              />
              <View style={styles.onlineBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Action Card (Modern Style) */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.heroCardWrapper}
            onPress={() => navigation.navigate('StartInspection')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#1E293B', '#0F172A']}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroCardBgCircle} />
              <View style={styles.heroCardContent}>
                <View>
                  <View style={styles.heroBadge}>
                    <Sparkles size={12} color="#3B82F6" />
                    <Text style={styles.heroBadgeText}>AI POWERED</Text>
                  </View>
                  <Text style={styles.heroTitle}>Start New Inspection</Text>
                  <Text style={styles.heroDesc}>Begin a guided evaluation session</Text>
                </View>
                <View style={styles.heroIconBtn}>
                  <Plus size={28} color="#0F172A" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Overview (Minimalist) */}
        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#EFF6FF' }]}>
                <Layers size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total Audits</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FFFBEB' }]}>
                <Activity size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle2 size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Modules Section (Horizontal Scroll) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Modules</Text>
            <TouchableOpacity>
              <MoreVertical size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modulesGrid}>
            {[
              { screen: "PreHoldCleaning",  icon: ClipboardCheck, label: "Hold Cleaning", desc: "Pre-load prep", color: "#10B981", bg: "#ECFDF5", locked: false },
              { screen: null,               icon: Lock,           label: "Bunker Survey", desc: "Fuel checking", color: "#64748B", bg: "#F1F5F9", locked: true },
              { screen: null,               icon: Ship,           label: "Draft Survey", desc: "Weight calc", color: "#64748B", bg: "#F1F5F9", locked: true },
            ].map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.moduleHCard, item.locked && styles.lockedModule]}
                onPress={() => {
                  if (item.screen === 'Camera') {
                    navigation.navigate('Tabs', { screen: 'Camera' });
                  } else {
                    handleActionPress(item.screen, item.locked);
                  }
                }}
                activeOpacity={item.locked ? 1 : 0.7}
              >
                <View style={[styles.moduleHIcon, { backgroundColor: item.bg }]}>
                  <item.icon size={22} color={item.color} />
                </View>
                <Text style={styles.moduleHLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.moduleHDesc} numberOfLines={1}>{item.desc}</Text>
                {item.locked && (
                  <View style={styles.lockHBadge}>
                    <Lock size={12} color="#94A3B8" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentInspections.length > 0 ? (
            <View style={styles.activityList}>
              {recentInspections.map((item, index) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.timelineItem}
                  onPress={() => navigation.navigate('Inspection', { id: item.id })}
                >
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: item.status === 'completed' ? '#10B981' : '#F59E0B' }]} />
                    {index !== recentInspections.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineTitle}>{item.vehicleName}</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.timelineFooter}>
                      <View style={styles.timelineBadge}>
                        <Hash size={12} color="#64748B" />
                        <Text style={styles.timelineBadgeText}>{item.vehiclePlate}</Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: item.status === 'completed' ? '#ECFDF5' : '#FFFBEB' }]}>
                        <Text style={[styles.statusPillText, { color: item.status === 'completed' ? '#10B981' : '#F59E0B' }]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateModern}>
              <View style={styles.emptyStateIconBg}>
                <ClipboardCheck size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyStateModernText}>No recent activity</Text>
              <Text style={styles.emptyStateModernSub}>Your inspections will appear here</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Vehicle Selection Modal */}
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
                <Text style={styles.modalTitle}>Select Vehicle</Text>
                <Text style={styles.modalSubtitle}>Identify the target for inspection</Text>
              </View>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity 
                  style={styles.headerAddBtn} 
                  onPress={() => setAddVehicleVisible(true)}
                >
                  <Plus size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {vehicles.length > 0 && (
              <View style={styles.modalSearchContainer}>
                <View style={styles.modalSearchBar}>
                  <Search size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search vehicles..."
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

            {vehicles.length > 0 ? (
              <FlatList
                data={filteredVehicles}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.vehicleList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.vehicleItem}
                    onPress={() => handleSelectVehicle(item)}
                  >
                    <View style={styles.vehicleIconBg}>
                      <Car size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleMakeModel}>{item.make} {item.model}</Text>
                      <Text style={styles.vehiclePlate}>{item.plate || 'No Plate'} • {item.year || 'N/A'}</Text>
                    </View>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyVehicles}>
                <Car size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyVehiclesText}>No vehicles registered yet</Text>
                <TouchableOpacity 
                  style={styles.addVehicleBtn}
                  onPress={() => setAddVehicleVisible(true)}
                >
                  <Text style={styles.addVehicleBtnText}>Register Your First Vehicle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddVehicleVisible}
        onRequestClose={() => setAddVehicleVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Vehicle</Text>
                <Text style={styles.modalSubtitle}>Enter details for the permanent record</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setAddVehicleVisible(false)}>
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
                  onPress={handleAddVehicle}
                  disabled={!isFormValid() || isSubmitting}
                >
                  <LinearGradient
                    colors={!isFormValid() ? ['#E2E8F0', '#E2E8F0'] : ['#3B82F6', '#2563EB']}
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#0F172A',
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
  heroCardWrapper: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroCard: {
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCardBgCircle: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  heroIconBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 4,
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
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '700',
  },
  modulesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleHCard: {
    width: '31%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  lockedModule: {
    opacity: 0.7,
    backgroundColor: '#F8FAFC',
  },
  moduleHIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleHLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  moduleHDesc: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  lockHBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  activityList: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginTop: -4,
    marginBottom: -24,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timelineBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginLeft: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  emptyStateModern: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyStateIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateModernText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyStateModernSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
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
  vehicleList: {
    maxHeight: height * 0.5,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vehicleIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleMakeModel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehiclePlate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyVehicles: {
    padding: 40,
    alignItems: 'center',
  },
  emptyVehiclesText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  addVehicleBtn: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addVehicleBtnText: {
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
