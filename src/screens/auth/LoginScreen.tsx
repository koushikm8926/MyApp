import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mail, LogIn, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('koushik@gmail.com');
  const [otp, setOtp] = useState('8670');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  
  const navigation = useNavigation<any>();
  const setUser = useAuthStore((state) => state.setUser);


  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please enter a valid @gmail.com address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.sendOtp(email);
      setShowOtp(true);
      setError('OTP sent! Use 8670 for your account.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authService.verifyOtp(email, otp);
      setUser(response.user, response.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.solidBackground} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.innerContainer}>
              
              <View style={styles.header}>
                  <View style={styles.logoCircle}>
                    <ShieldCheck size={40} color={COLORS.primary} />
                  </View>
                <Text style={styles.subtitle}>Precision Vessel Inspections</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{showOtp ? 'Verify Identity' : 'Secure Sign In'}</Text>
                <Text style={styles.cardSubtitle}>
                  {showOtp 
                    ? 'Enter the 4-digit code sent to your email' 
                    : 'Enter your credentials to access the inspection portal'}
                </Text>

                {error ? (
                  <View style={[styles.errorContainer, error.includes('sent') && styles.successContainer]}>
                    <Text style={[styles.errorText, error.includes('sent') && styles.successText]}>
                      {error}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. koushik@gmail.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#94A3B8"
                      editable={!loading && !showOtp}
                    />
                  </View>
                </View>

                {showOtp && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
                    <View style={styles.inputWrapper}>
                      <KeyRound size={20} color="#94A3B8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="0 0 0 0"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        placeholderTextColor="#94A3B8"
                        editable={!loading}
                        maxLength={6}
                        letterSpacing={8}
                      />
                    </View>
                    <TouchableOpacity style={styles.resendBtn} onPress={() => setShowOtp(false)}>
                      <Text style={styles.resendText}>Change Email?</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.mainButton} 
                  onPress={showOtp ? handleVerifyOtp : handleSendOtp}
                  disabled={loading}
                >
                  <View style={styles.buttonInner}>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>
                          {showOtp ? 'Complete Login' : 'Send Access Code'}
                        </Text>
                        <ArrowRight size={20} color="#fff" style={{ marginLeft: 10 }} />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Authorized Personnel Only</Text>
                <View style={styles.dot} />
                <Text style={styles.footerText}>v2.4.0</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  solidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    paddingBottom: 40,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 20,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successText: {
    color: '#6EE7B7',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  resendBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  resendText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
  },
  mainButton: {
    marginTop: 12,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    marginHorizontal: 10,
  },
});

