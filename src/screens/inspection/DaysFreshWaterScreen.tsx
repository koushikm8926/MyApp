import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Droplets, Calendar, Waves, Info, Check } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useInspectionStore } from '../../store/useInspectionStore';

export default function DaysFreshWaterScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { currentInspection, saveInspectionData } = useInspectionStore();
  
  const [formData, setFormData] = useState({
    waterQuantity: '',
    cleaningDays: '',
    remainingDays: '',
    source: 'Barge',
    quality: 'Satisfactory',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sources = ['Barge', 'Shore', 'Distilled', 'Other'];
  const qualities = ['Satisfactory', 'Needs Treatment', 'Poor'];

  useEffect(() => {
    if (currentInspection) {
      const data = JSON.parse(currentInspection.data || '{}');
      if (data.daysFreshWater) {
        setFormData({ ...formData, ...data.daysFreshWater });
      }
    }
  }, [currentInspection]);

  const handleSave = async () => {
    if (!currentInspection) return;
    
    setIsSaving(true);
    try {
      await saveInspectionData(currentInspection.id, {
        daysFreshWater: formData
      });
      
      setIsSaving(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setIsSaving(false);
      console.error('Save failed', err);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Days & Fresh Water</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {showSuccess && (
        <View style={[styles.successToast, { top: insets.top + 80 }]}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.toastGradient}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.successText}>Water Data Saved Successfully!</Text>
          </LinearGradient>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Waves size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Water Inventory</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Fresh Water Quantity (MT)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity in Metric Tons"
                value={formData.waterQuantity}
                onChangeText={(val) => setFormData({ ...formData, waterQuantity: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Source of Fresh Water</Text>
            <View style={styles.pickerContainer}>
              {sources.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.pickerItem, formData.source === item && styles.pickerItemActive]}
                  onPress={() => setFormData({ ...formData, source: item })}
                >
                  <Text style={[styles.pickerText, formData.source === item && styles.pickerTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Timeline Tracking</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Days Since Last Cleaning</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter number of days"
                value={formData.cleaningDays}
                onChangeText={(val) => setFormData({ ...formData, cleaningDays: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Remaining Days</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Based on current consumption"
                value={formData.remainingDays}
                onChangeText={(val) => setFormData({ ...formData, remainingDays: val })}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Quality Status</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Water Quality Check</Text>
            <View style={styles.qualityContainer}>
              {qualities.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.qualityItem, formData.quality === item && styles.qualityItemActive]}
                  onPress={() => setFormData({ ...formData, quality: item })}
                >
                  <Text style={[styles.qualityText, formData.quality === item && styles.qualityTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.8 }]} 
          onPress={handleSave}
          disabled={isSaving || showSuccess}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : showSuccess ? (
              <>
                <Check size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.saveButtonText}>Saved!</Text>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.saveButtonText}>Save Details</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerItemActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  pickerTextActive: {
    color: '#FFF',
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  qualityItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qualityItemActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  qualityTextActive: {
    color: '#FFF',
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
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
    shadowColor: '#3B82F6',
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
