import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mail, LogIn, KeyRound } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';

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
      // Navigation is automatically handled by App.tsx conditionally rendering MainNavigator
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your inspections</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={[styles.errorText, error.includes('sent') && { color: '#0787e2', backgroundColor: '#e0f2fe' }]}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Mail size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {showOtp && (
            <View style={styles.inputContainer}>
              <KeyRound size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter OTP (e.g. 1234)"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholderTextColor="#999"
                editable={!loading}
                maxLength={6}
              />
            </View>
          )}

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={showOtp ? handleVerifyOtp : handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>{showOtp ? 'Verify OTP' : 'Send OTP'}</Text>
                <LogIn size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>


        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#0787e2',
    fontWeight: '700',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#1A1A1A',
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  footerLink: {
    color: '#0787e2',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
