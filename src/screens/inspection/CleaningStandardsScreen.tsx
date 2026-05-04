import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, PaintBucket, CheckCircle2, Circle } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const STANDARDS = [
  { id: 'hospital', label: 'Hospital Clean', desc: 'Highest standard, odorless, completely clear of residues.' },
  { id: 'grain', label: 'Grain Clean', desc: 'Swept, washed, free of loose rust and previous cargo.' },
  { id: 'normal', label: 'Normal Clean', desc: 'Swept clean, suitable for similar subsequent cargoes.' },
];

export default function CleaningStandardsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    standard: 'grain',
    chemicalWash: false,
    surveyorRequired: true,
    remarks: '',
  });

  const handleSave = () => {
    // Save logic would go here
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#F59E0B', '#F59E0B', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cleaning Standards</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <PaintBucket size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Required Standards</Text>
          <Text style={styles.subtitle}>Specify the level of cleaning required before loading.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Cleanliness Level</Text>
          
          <View style={styles.standardsList}>
            {STANDARDS.map((std) => {
              const isSelected = formData.standard === std.id;
              return (
                <TouchableOpacity
                  key={std.id}
                  style={[styles.standardCard, isSelected && styles.standardCardSelected]}
                  onPress={() => setFormData({ ...formData, standard: std.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioContainer}>
                    {isSelected ? (
                      <CheckCircle2 size={24} color="#F59E0B" />
                    ) : (
                      <Circle size={24} color="#CBD5E1" />
                    )}
                  </View>
                  <View style={styles.standardInfo}>
                    <Text style={[styles.standardLabel, isSelected && styles.standardLabelSelected]}>
                      {std.label}
                    </Text>
                    <Text style={styles.standardDesc}>{std.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Requirements</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Chemical Wash Required</Text>
              <Text style={styles.switchDesc}>Detergent or chemical cleaning needed</Text>
            </View>
            <Switch
              value={formData.chemicalWash}
              onValueChange={(val) => setFormData({ ...formData, chemicalWash: val })}
              trackColor={{ false: '#E2E8F0', true: '#FCD34D' }}
              thumbColor={formData.chemicalWash ? '#F59E0B' : '#F8FAFC'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Independent Surveyor</Text>
              <Text style={styles.switchDesc}>Requires third-party sign-off</Text>
            </View>
            <Switch
              value={formData.surveyorRequired}
              onValueChange={(val) => setFormData({ ...formData, surveyorRequired: val })}
              trackColor={{ false: '#E2E8F0', true: '#FCD34D' }}
              thumbColor={formData.surveyorRequired ? '#F59E0B' : '#F8FAFC'}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Additional Remarks</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter any specific cleaning instructions..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.remarks}
            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
          />
        </View>

      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Save Standards</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FEF3C7',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  standardsList: {
    marginBottom: 16,
  },
  standardCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  standardCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  radioContainer: {
    marginRight: 16,
  },
  standardInfo: {
    flex: 1,
  },
  standardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  standardLabelSelected: {
    color: '#D97706',
  },
  standardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
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
});
