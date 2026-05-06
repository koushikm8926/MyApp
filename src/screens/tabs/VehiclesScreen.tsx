import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, Plus, X, Hash, Calendar, Tag, Shield, Info, ChevronRight, Search, Activity, MoreVertical, ChevronDown, Edit2 } from 'lucide-react-native';
import { databaseService } from '../../services/databaseService';
import { useAuthStore } from '../../store/useAuthStore';
import LinearGradient from 'react-native-linear-gradient';

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

export default function Vehicles() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  
  // Form State
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

  const loadVehicles = useCallback(async () => {
    if (!user) return;
    try {
      const data = await databaseService.getVehicles(user.id);
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

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
      setModalVisible(false);
      
      // Reset form
      setSelectedMake('');
      setSelectedModel('');
      setCustomMake('');
      setCustomModel('');
      setYear('');
      setPlate('');
      
      loadVehicles();
    } catch (err) {
      console.error('Failed to add vehicle', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = () => {
    const finalMake = selectedMake === 'Other / Custom' ? customMake : selectedMake;
    const finalModel = selectedModel === 'Other / Custom' ? customModel : selectedModel;
    return finalMake.trim().length > 0 && finalModel.trim().length > 0;
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.iconBox}>
          <Car size={26} color="#3B82F6" />
        </View>
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleName}>{item.make} {item.model}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Calendar size={12} color="#64748B" />
              <Text style={styles.metaBadgeText}>{item.year || 'N/A'}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Hash size={12} color="#64748B" />
              <Text style={styles.metaBadgeText}>{item.plate || 'No Plate'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsBtn}>
          <MoreVertical size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.statusPill}>
          <Shield size={12} color="#10B981" />
          <Text style={styles.statusPillText}>VERIFIED</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>View Details</Text>
          <ChevronRight size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Modern Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Fleet</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{vehicles.length}</Text>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search make, model, or plate..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={filteredVehicles}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Car size={48} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Garage is empty</Text>
                <Text style={styles.emptySubtitle}>No vehicles have been registered yet.</Text>
                <TouchableOpacity 
                  style={styles.emptyAddBtn}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.emptyAddBtnText}>Register First Vehicle</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modern Add Vehicle Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || 24 }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Vehicle</Text>
                <Text style={styles.modalSubtitle}>Enter details for the permanent record</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
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
  header: {
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  countBadgeText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 14,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 140, // Increased to account for FAB and floating tab bar
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  metaBadgeText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '700',
  },
  detailsBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#10B981',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 14,
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Adjusted to sit nicely above the floating tab bar
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyAddBtnText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '800',
  },
  // Modal Styles
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
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
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
