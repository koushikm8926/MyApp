import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Wrench, Package, Shield, Check } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useInspectionStore } from '../../store/useInspectionStore';

export default function CleaningEquipmentScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currentInspection, saveInspectionData } = useInspectionStore();
  
  const [formData, setFormData] = useState({
    highPressureMachines: '',
    chemicalsQuantity: '',
    brushesBrooms: '',
    scrapers: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentInspection) {
      const data = JSON.parse(currentInspection.data || '{}');
      if (data.cleaningEquipment) {
        setFormData({ ...formData, ...data.cleaningEquipment });
      }
    }
  }, [currentInspection]);

  const handleSave = async () => {
    if (!currentInspection) return;
    setIsSaving(true);
    try {
      await saveInspectionData(currentInspection.id, { cleaningEquipment: formData });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#F59E0B', '#D97706']} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cleaning Equipment</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {showSuccess && (
        <View style={[styles.successToast, { top: insets.top + 80 }]}>
          <LinearGradient colors={['#F59E0B', '#B45309']} style={styles.toastGradient}>
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.successText}>Inventory Saved Successfully!</Text>
          </LinearGradient>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wrench size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Mechanical Equipment</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>High Pressure Machines</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Number of units"
                value={formData.highPressureMachines}
                onChangeText={(val) => setFormData({ ...formData, highPressureMachines: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scrapers / Chipping Hammers</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Number of units"
                value={formData.scrapers}
                onChangeText={(val) => setFormData({ ...formData, scrapers: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Consumables & Tools</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chemicals Quantity (Liters)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Liters of cleaning chemical"
                value={formData.chemicalsQuantity}
                onChangeText={(val) => setFormData({ ...formData, chemicalsQuantity: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brushes & Brooms</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Total count"
                value={formData.brushesBrooms}
                onChangeText={(val) => setFormData({ ...formData, brushesBrooms: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.8 }]} 
          onPress={handleSave}
          disabled={isSaving || showSuccess}
        >
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.saveButtonGradient}>
            {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{showSuccess ? 'Saved!' : 'Save Inventory'}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  section: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginLeft: 10 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', height: 56, justifyContent: 'center', paddingHorizontal: 16 },
  input: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  saveButton: { marginTop: 10, borderRadius: 20, overflow: 'hidden', elevation: 4 },
  saveButtonGradient: { flexDirection: 'row', height: 64, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  successToast: { position: 'absolute', left: 20, right: 20, zIndex: 100, alignItems: 'center' },
  toastGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  successText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 10, fontSize: 15 },
});
