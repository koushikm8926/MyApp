import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Play, Sparkles, Lightbulb, Zap, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

export default function StartInspection() {
  const [vehicleName, setVehicleName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  
  const { startInspection } = useInspectionStore();
  const { user } = useAuthStore();

  const handleStart = async () => {
    if (!vehicleName || !user) return;

    setLoading(true);
    try {
      const id = await startInspection(user.id, vehicleName);
      console.log('Inspection started with ID:', id);
      navigation.navigate('InspectionChecklist', { id: id });
    } catch (error) {
      console.error('Failed to start inspection', error);
    } finally {
      setLoading(false);
    }
  };

  const TipItem = ({ icon: Icon, text, color }: any) => (
    <View style={styles.tipItem}>
      <View style={[styles.tipIcon, { backgroundColor: color + '15' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView 
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Sparkles size={32} color="#0787e2" />
          </View>
          <Text style={styles.title}>New Inspection</Text>
          <Text style={styles.subtitle}>Ready to evaluate another vehicle? Let's get the basic details first.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Vehicle Information</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2024 Tesla Model 3"
            value={vehicleName}
            onChangeText={setVehicleName}
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity 
            style={[styles.button, !vehicleName && styles.buttonDisabled]} 
            onPress={handleStart}
            disabled={!vehicleName || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={vehicleName ? ['#0787e2', '#0787e2'] : ['#E2E8F0', '#E2E8F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Begin Inspection</Text>
                <Play size={20} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Lightbulb size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Inspection Pro-Tips</Text>
          </View>
          
          <TipItem 
            icon={Zap} 
            text="Ensure the vehicle is in a well-lit area for clear photos." 
            color="#F59E0B"
          />
          <TipItem 
            icon={ShieldCheck} 
            text="Keep the camera steady to pass automatic quality checks." 
            color="#10B981"
          />
          <TipItem 
            icon={Sparkles} 
            text="Follow the on-screen guides for the best perspectives." 
            color="#0787e2"
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F1F5F9',
    height: 64,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 24,
  },
  button: {
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tipsSection: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 20,
  },
});
