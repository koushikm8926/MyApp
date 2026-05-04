import * as Keychain from 'react-native-keychain';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const secureStorage = {
  async saveToken(token: string) {
    await Keychain.setGenericPassword(TOKEN_KEY, token, { service: TOKEN_KEY });
  },

  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: TOKEN_KEY });
    if (credentials) {
      return credentials.password;
    }
    return null;
  },

  async removeToken() {
    await Keychain.resetGenericPassword({ service: TOKEN_KEY });
  },

  async saveUser(user: any) {
    await Keychain.setGenericPassword(USER_KEY, JSON.stringify(user), { service: USER_KEY });
  },

  async getUser(): Promise<any | null> {
    const credentials = await Keychain.getGenericPassword({ service: USER_KEY });
    if (credentials) {
      return JSON.parse(credentials.password);
    }
    return null;
  },

  async clearAll() {
    await Keychain.resetGenericPassword({ service: TOKEN_KEY });
    await Keychain.resetGenericPassword({ service: USER_KEY });
  },
};
