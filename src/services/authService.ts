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
    
    // Accept "1234" as a mock valid OTP for testing
    if (otp !== '1234') {
      throw new Error('Invalid OTP. Use 1234 for testing.');
    }

    const mockUser = {
      id: '12345',
      email: email,
      name: 'Robert C. Smith', // Professional name
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
