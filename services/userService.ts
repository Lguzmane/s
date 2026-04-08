//services/userService.ts
import api from './api';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mantener camelCase según backend real:
// apellidoPaterno, apellidoMaterno, fotoPerfil
export interface UpdateProfileData {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  region?: string;
  comuna?: string;
  fotoPerfil?: string;
}

export interface GetProfessionalsFilters {
  page?: number;
  limit?: number;
  categoria?: string;
  region?: string;
  comuna?: string;
  minRating?: number;
  destacado?: boolean;
  search?: string;
  lugarAtencion?: string;
  lat?: number;
  lng?: number;
  fecha?: string;
}

export const userService = {

  // ========================
  // OBTENER MI PERFIL
  // ========================
  getMyProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data.user || response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener perfil');
      }
      throw error;
    }
  },

  // ========================
  // ACTUALIZAR MI PERFIL
  // ========================
  updateProfile: async (data: UpdateProfileData) => {
    try {
      // 🔥 CORRECCIÓN: obtener user desde storage
      const userString = await AsyncStorage.getItem('user');

      if (!userString) {
        throw new Error('Usuario no encontrado en sesión');
      }

      const user = JSON.parse(userString);

      if (!user?.id) {
        throw new Error('ID de usuario no disponible');
      }

      // 🔥 CORRECCIÓN: usar ruta correcta
      const response = await api.put(`/api/users/${user.id}`, data);

      // 🔥 CORRECCIÓN: devolver SOLO el user
      return response.data.user || response.data;

    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Error al actualizar perfil'
        );
      }
      throw error;
    }
  },

  // ========================
  // OBTENER TODOS LOS PROFESIONALES
  // ========================
  getProfessionals: async (filters?: GetProfessionalsFilters) => {
    try {
      const response = await api.get('/api/users/professionals/all', {
        params: filters
      });

      return {
        success: response.data?.success ?? true,
        data: Array.isArray(response.data?.data) ? response.data.data : [],
        pagination: response.data?.pagination ?? null,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener profesionales');
      }
      throw error;
    }
  },

  // ========================
  // OBTENER USUARIO POR ID
  // ========================
  getUserById: async (id: string) => {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener usuario');
      }
      throw error;
    }
  },

  // ========================
  // AGREGAR INTERÉS
  // ========================
  addInterest: async (categoryId: string) => {
    try {
      const response = await api.post('/api/users/interests', { categoryId });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al agregar interés');
      }
      throw error;
    }
  },

  // ========================
  // MIS ESTADÍSTICAS
  // ========================
  getMyStats: async () => {
    try {
      const response = await api.get('/api/users/stats/me');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
      }
      throw error;
    }
  },

  // ========================
  // PORTFOLIO
  // ========================
  getPortfolio: async (userId: string) => {
    try {
      const response = await api.get(`/api/portfolio/${userId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener portafolio');
      }
      throw error;
    }
  },

  addPortfolioItem: async (formData: FormData) => {
    try {
      const response = await api.post('/api/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al agregar item');
      }
      throw error;
    }
  },

  updatePortfolioItem: async (id: string, data: { titulo: string }) => {
    try {
      const response = await api.put(`/api/portfolio/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al actualizar item');
      }
      throw error;
    }
  },

  deletePortfolioItem: async (id: string) => {
    try {
      const response = await api.delete(`/api/portfolio/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al eliminar item');
      }
      throw error;
    }
  },

  reorderPortfolio: async (items: { id: string; order: number }[]) => {
    try {
      const response = await api.post('/api/portfolio/reorder', { items });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al reordenar');
      }
      throw error;
    }
  }
};