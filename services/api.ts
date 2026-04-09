//services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { tokenStore } from '../utils/tokenStore';

const LOCAL_API_PORT = 3000;

/**
 * URL por defecto para desarrollo local sin .env:
 * - iOS simulador / web: localhost
 * - Android emulador: 10.0.2.2 (equivalente al host de tu máquina)
 * En dispositivo físico, define EXPO_PUBLIC_API_URL (ej. http://192.168.x.x:3000).
 */
function defaultDevBaseUrl(): string {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${LOCAL_API_PORT}`;
  }
  return `http://localhost:${LOCAL_API_PORT}`;
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  return defaultDevBaseUrl();
}

const API_URL = resolveApiBaseUrl();

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================
// REQUEST INTERCEPTOR
// ========================
api.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    let token = tokenStore.getToken();

    if (!token) {
      token = await AsyncStorage.getItem('accessToken');
    }

    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`[API] Token usado: ${token ? 'SI' : 'NO'}`);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========================
// RESPONSE INTERCEPTOR
// ========================
// CORRECCIÓN:
// Tu backend actual NO tiene /api/auth/refresh-token.
// Por eso NO debemos intentar refrescar automáticamente.
// Solo limpiamos sesión cuando el backend responde 401.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    console.error('[API] Error response:', {
      url: requestUrl,
      status,
      data: error.response?.data,
    });

    // Si el token es inválido o expiró, el backend responde 401.
    // Como no existe refresh-token en backend, limpiamos sesión.
    if (status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      tokenStore.clear();
    }

    // 403 NO debe limpiar sesión automáticamente,
    // porque en tu backend puede significar "Cuenta no verificada".
    // Eso debe mostrarse como error real al frontend.
    return Promise.reject(error);
  }
);

export default api;
