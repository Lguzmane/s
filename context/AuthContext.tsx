// contexts/AuthContext.tsx - CORREGIDO FINAL
import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { tokenStore } from "../utils/tokenStore";

type User = any;

type Ctx = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
};

export const AuthContext = createContext<Ctx>({} as Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStoredSession();
  }, []);

  // 🔥 FUNCIÓN PARA NORMALIZAR USUARIO
  const normalizeUser = (userData: any) => ({
    ...userData,
    emailConfirmado: userData?.emailConfirmado ?? false,
  });

  const checkStoredSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        return;
      }

      tokenStore.setToken(token);

      const userData = await authService.checkAuth();

      setUser(normalizeUser(userData)); // 🔥 CAMBIO
    } catch (err) {
      console.error("Error checking session:", err);

      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      tokenStore.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({ email, password });

      setUser(normalizeUser(response.user)); // 🔥 CAMBIO
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(userData);

      setUser(normalizeUser(response.user)); // 🔥 CAMBIO
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrarse";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Error during logout:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await userService.updateProfile(data);

      setUser(normalizeUser(updatedUser)); // 🔥 CAMBIO
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar perfil";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);

      const userData = await authService.checkAuth();

      setUser(normalizeUser(userData)); // 🔥 CAMBIO
    } catch (err) {
      console.error("Error refreshing user:", err);
      throw err;
    }
  };

  const value = useMemo<Ctx>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      error
    }),
    [user, isLoading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}