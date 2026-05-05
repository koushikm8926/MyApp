import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, Ship, ChevronDown, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useInspectionStore } from '../../store/useInspectionStore';

const VESSEL_TYPES = [
  'Bulk Carrier',
  'Container Ship',
  'Tanker',
  'LNG Carrier',
  'RO-RO',
  'General Cargo',
  'Passenger Ship',
  'Other'
];

const YEARS = Array.from({ length: 77 }, (_, i) => (2026 - i).toString());

interface PickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: string[];
  title: string;
}

const CustomPicker = ({ visible, onClose, onSelect, options, title }: PickerProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function VesselParticularScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currentInspection, saveInspectionData } = useInspectionStore();

  const [formData, setFormData] = useState({
    vesselName: '',
    imoNumber: '',
    vesselType: '',
    grossTonnage: '',
    dwt: '',
    yearBuilt: '',
    flag: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    options: string[];
    title: string;
    field: keyof typeof formData;
  }>({
    visible: false,
    options: [],
    title: '',
    field: 'vesselType'
  });

  useEffect(() => {
    if (currentInspection) {
      const data = JSON.parse(currentInspection.data || '{}');
      if (data.vesselParticulars) {
        setFormData({ ...formData, ...data.vesselParticulars });
      }
    }
  }, [currentInspection]);

  const handleSave = async () => {
    if (!currentInspection) return;
    
    setIsSaving(true);
    try {
      await saveInspectionData(currentInspection.id, {
        vesselParticulars: formData
      });
      
      setIsSaving(false);
      setShowSuccess(true);
      
      // Delay navigation back so they can see the success state
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setIsSaving(false);
      console.error('Save failed', err);
    }
  };

  const openPicker = (field: keyof typeof formData, options: string[], title: string) => {
    setPickerConfig({
      visible: true,
      options,
      title,
      field
    });
  };

  const renderInput = (label: string, field: keyof typeof formData, placeholder: string, keyboardType: any = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={formData[field]}
        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderDropdown = (label: string, field: keyof typeof formData, options: string[], title: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => openPicker(field, options, title)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !formData[field] && { color: '#94A3B8' }]}>
          {formData[field] || `Select ${label}`}
        </Text>
        <ChevronDown size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#10B981', '#10B981', '#34D399']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vessel Particulars</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {showSuccess && (
        <View style={[styles.successToast, { top: insets.top + 80 }]}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.toastGradient}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.successText}>Details Saved Successfully!</Text>
          </LinearGradient>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <Ship size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Vessel Details</Text>
          <Text style={styles.subtitle}>Enter the core specifications of the vessel.</Text>
        </View>

        <View style={styles.formContainer}>
          {renderInput('Vessel Name', 'vesselName', 'e.g. MV Pacific Ocean')}
          {renderInput('IMO Number', 'imoNumber', 'e.g. 9123456', 'numeric')}
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderDropdown('Vessel Type', 'vesselType', VESSEL_TYPES, 'Select Vessel Type')}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              {renderInput('Flag', 'flag', 'e.g. Panama')}
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderInput('Gross Tonnage', 'grossTonnage', 'GT', 'numeric')}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              {renderInput('DWT', 'dwt', 'MT', 'numeric')}
            </View>
          </View>

          {renderDropdown('Year Built', 'yearBuilt', YEARS, 'Select Year Built')}
        </View>

      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.8 }]} 
          onPress={handleSave}
          disabled={isSaving || showSuccess}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : showSuccess ? (
            <>
              <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Saved!</Text>
            </>
          ) : (
            <>
              <Save size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Details</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomPicker
        visible={pickerConfig.visible}
        onClose={() => setPickerConfig({ ...pickerConfig, visible: false })}
        options={pickerConfig.options}
        title={pickerConfig.title}
        onSelect={(val) => setFormData({ ...formData, [pickerConfig.field]: val })}
      />
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
  },
  iconHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#1E293B',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  optionItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  successToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  toastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 15,
  },
});
