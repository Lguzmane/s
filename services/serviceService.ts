//services/serviceService.ts
import api from './api';

export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion?: number;
  imagen?: string;
  rating?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 🔥 NORMALIZADOR (CLAVE)
const normalizeService = (service: any): Service => {
  return {
    id: service.id,
    nombre: service.nombre,
    descripcion: service.descripcion,
    precio: service.precio,

    // 🔥 FIX BACK → FRONT
    duracion: service.duracionMin,

    // 🔥 FIX FOTOS → IMAGEN
    imagen: service.fotos?.[0]?.imagenUrl || "",

    rating: service.rating || 0,
  };
};

export const serviceService = {
  getAllServices: async (page = 1, limit = 20) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/api/services', {
        params: { page, limit }
      });

      return {
        ...response.data,
        data: response.data.data.map(normalizeService)
      };

    } catch (error) {
      console.error('Error en getAllServices:', error);
      throw error;
    }
  },

  getServiceById: async (id: string) => {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`/api/services/${id}`);

      return {
        ...response.data,
        data: normalizeService(response.data.data)
      };

    } catch (error) {
      console.error('Error en getServiceById:', error);
      throw error;
    }
  },

  getFeaturedServices: async (limit = 5) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/api/services', {
        params: { limit, destacado: true }
      });

      return {
        ...response.data,
        data: response.data.data.map(normalizeService)
      };

    } catch (error) {
      console.error('Error en getFeaturedServices:', error);
      throw error;
    }
  },

  createService: async (serviceData: any) => {
    try {
      const response = await api.post('/api/services', serviceData);
      return response.data;
    } catch (error) {
      console.error('Error en createService:', error);
      throw error;
    }
  },

  getMyServices: async (profesionalId: string) => {
    try {
      const response = await api.get(`/api/services/professional/${profesionalId}`);

      return {
        ...response.data,
        data: response.data.data.map(normalizeService)
      };

    } catch (error) {
      console.error('Error en getMyServices:', error);
      throw error;
    }
  },
};

export default serviceService;