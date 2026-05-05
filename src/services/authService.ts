import { secureStorage } from './secureStore';

// Mock delay to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(() => resolve(undefined), ms));

export const authService = {
  async sendOtp(email: string) {
    await delay(1000);
    if (!email) throw new Error('Email is required');
    // Mock sending OTP
    return { success: true };
  },

  async verifyOtp(email: string, otp: string) {
    await delay(1500); // Simulate network latency

    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }
    
    // Only allow koushik@gmail.com with OTP 8670
    if (email !== 'koushik@gmail.com') {
      throw new Error('Unauthorized account.');
    }
    
    if (otp !== '8670') {
      throw new Error('Invalid OTP. Use 8670 for your account.');
    }

    const mockUser = {
      id: 'koushik_8670',
      email: 'koushik@gmail.com',
      name: 'Koushik',
    };
    const mockToken = 'mock-jwt-token-xyz';

    await secureStorage.saveToken(mockToken);
    await secureStorage.saveUser(mockUser);

    return { user: mockUser, token: mockToken };
  },



  async forgotPassword(email: string) {
    await delay(1000);
    return true;
  }
};
