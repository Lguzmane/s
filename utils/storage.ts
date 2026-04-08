// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const storage = {

  // ========================
  // TOKENS
  // ========================
  setTokens: async (accessToken: string, refreshToken?: string | null) => {
    try {
      console.log('[Storage] 🔑 setTokens llamado');

      if (!accessToken) {
        console.log('[Storage] ❌ ERROR: accessToken es null/undefined');
        return;
      }

      // ✅ guardar access token siempre
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      // 🔥 CLAVE: manejar bien refreshToken
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        // 👇 si NO viene, lo borramos para evitar basura
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      console.log('[Storage] accessToken guardado:', true);
      console.log('[Storage] refreshToken guardado:', !!refreshToken);

    } catch (error) {
      console.error('[Storage] ❌ Error guardando tokens:', error);
    }
  },

  getTokens: async () => {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('[Storage] ❌ Error obteniendo tokens:', error);
      return {
        accessToken: null,
        refreshToken: null
      };
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY
      ]);
      console.log('[Storage] 🧹 Storage limpiado');
    } catch (error) {
      console.error('[Storage] ❌ Error limpiando storage:', error);
    }
  },

  // ========================
  // USER
  // ========================
  setUser: async (user: any) => {
    try {
      console.log('[Storage] 👤 setUser llamado');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('[Storage] ✅ Usuario guardado');
    } catch (error) {
      console.error('[Storage] ❌ Error guardando usuario:', error);
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('[Storage] ❌ Error obteniendo usuario:', error);
      return null;
    }
  }
};