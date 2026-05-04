import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, Ship } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

export default function VesselParticularScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    vesselName: '',
    imoNumber: '',
    vesselType: '',
    grossTonnage: '',
    dwt: '',
    yearBuilt: '',
    flag: '',
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <Ship size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Vessel Details</Text>
          <Text style={styles.subtitle}>Enter the core specifications of the vessel.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vessel Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MV Pacific Ocean"
              placeholderTextColor="#94A3B8"
              value={formData.vesselName}
              onChangeText={(text) => setFormData({ ...formData, vesselName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IMO Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9123456"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={formData.imoNumber}
              onChangeText={(text) => setFormData({ ...formData, imoNumber: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Vessel Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bulk Carrier"
                placeholderTextColor="#94A3B8"
                value={formData.vesselType}
                onChangeText={(text) => setFormData({ ...formData, vesselType: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Flag</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Panama"
                placeholderTextColor="#94A3B8"
                value={formData.flag}
                onChangeText={(text) => setFormData({ ...formData, flag: text })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Gross Tonnage</Text>
              <TextInput
                style={styles.input}
                placeholder="GT"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.grossTonnage}
                onChangeText={(text) => setFormData({ ...formData, grossTonnage: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>DWT</Text>
              <TextInput
                style={styles.input}
                placeholder="MT"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.dwt}
                onChangeText={(text) => setFormData({ ...formData, dwt: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year Built</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={4}
              value={formData.yearBuilt}
              onChangeText={(text) => setFormData({ ...formData, yearBuilt: text })}
            />
          </View>
        </View>

      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Save Details</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
});
