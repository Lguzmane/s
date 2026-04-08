//services/authService.ts
import api from './api';
import { storage } from '../utils/storage';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore } from '../utils/tokenStore';

export interface RegisterData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  password: string;
  confirmPassword: string;
  region: string;
  comuna: string;
  tipoUsuario: 'Cliente' | 'Profesional';
  telefono?: string;
  rut?: string;
  categoria?: string;
  experiencia?: string;
  certificaciones?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: any;
}

export const authService = {
  // ========================
  // REGISTRO
  // ========================
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(userData)
          .map(([key, value]) => [
            key,
            typeof value === 'string' ? value.trim() : value
          ])
          .filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await api.post('/api/auth/register', cleanData);

      console.log('[Auth][REGISTER] 🔍 response.data:', response.data);

      const token = response.data.token || response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      const user = response.data.user;

      if (token) {
        await storage.setTokens(token, refreshToken ?? null);
        tokenStore.setToken(token);

        const testRead = await AsyncStorage.getItem('accessToken');
        console.log('[Auth] Register - Token guardado:', testRead ? 'OK' : 'FALLO');
      } else {
        console.log('[Auth][REGISTER] ❌ token faltante');
      }

      if (user) {
        await storage.setUser(user);
      }

      return { token, refreshToken, user };
    } catch (error) {
      console.error('🔥 Error en register:', error);

      if (error instanceof AxiosError) {
        const serverError =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Error en el registro';

        throw new Error(serverError);
      }

      throw new Error('Error de conexión con el servidor');
    }
  },

  // ========================
  // LOGIN
  // ========================
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      console.log('[Auth] 🔐 Login para:', credentials.email);

      const cleanCredentials = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password.trim()
      };

      const response = await api.post('/api/auth/login', cleanCredentials);

      console.log('[Auth][LOGIN] 🔍 response.data COMPLETO:', response.data);

      const token = response.data.token || response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      const user = response.data.user;

      console.log('[Auth] token existe:', !!token);

      if (token) {
        await storage.setTokens(token, refreshToken ?? null);
        tokenStore.setToken(token);

        console.log('[Auth] ✅ Token guardado en memoria y storage');
      } else {
        console.log('[Auth] ❌ ERROR: token faltante');
      }

      if (user) {
        await storage.setUser(user);
      }

      return { token, refreshToken, user };
    } catch (error) {
      console.error('🔥 Error en login:', error);

      if (error instanceof AxiosError) {
        const serverError =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Error en el login';

        throw new Error(serverError);
      }

      throw new Error('Error de conexión con el servidor');
    }
  },

  // ========================
  // LOGOUT
  // ========================
  // CORRECCIÓN:
  // Tu backend actual NO tiene POST /api/auth/logout.
  // Por eso el cierre de sesión debe ser local.
  logout: async (): Promise<void> => {
    try {
      await storage.clear();
      tokenStore.clear();
      console.log('[Auth] Sesión cerrada completamente');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  // ========================
  // CHECK AUTH
  // ========================
  checkAuth: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data.user || response.data;
    } catch (error) {
      console.error('[Auth] Error checking auth:', error);
      throw error;
    }
  },

  // ========================
  // FORGOT PASSWORD
  // ========================
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error al enviar email');
      }
      throw new Error('Error de conexión');
    }
  },

  // ========================
  // RESET PASSWORD
  // ========================
  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token: token.trim(),
        password: password.trim(),
        confirmPassword: confirmPassword.trim()
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error al resetear contraseña');
      }
      throw new Error('Error de conexión');
    }
  }
};