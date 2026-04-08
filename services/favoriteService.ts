// services/favoriteService.ts
import api from './api';
import { AxiosError } from 'axios';

// Shape normalizado para frontend.
// Mantener `servicioId` como nombre estándar del servicio favorito.
export interface ServiceFavorite {
  id: string | number;
  servicioId: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion?: number;
  profesionalId?: string | number;
  profesionalNombre?: string;
  fotoPerfil?: string;
  comuna?: string;
  categoria?: string;
  imagenes?: string[];
  rating?: number;
}

export const favoriteService = {

  // ========================
  // CHECK FAVORITE
  // ========================
  checkIsFavorite: async (servicioId: string): Promise<boolean> => {
    try {
      if (!servicioId) return false;

      const response = await api.get(`/api/favorites/check/${servicioId}`);
      return response.data?.data?.esFavorito || false;

    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  },

  // ========================
  // TOGGLE FAVORITE
  // IMPORTANTE:
  // En este flujo el identificador de servicio se maneja como `servicioId`.
  // No cambiar a `serviceId` en frontend.
  // ========================
  toggleFavorite: async (servicioId: string): Promise<{ isFavorite: boolean; favoriteId?: string }> => {
    if (!servicioId) throw new Error('El ID del servicio es obligatorio');

    try {
      // Primero revisamos si ya es favorito
      const checkResponse = await api.get(`/api/favorites/check/${servicioId}`);
      const isFav = checkResponse.data?.data?.esFavorito;

      if (isFav) {
        await api.delete(`/api/favorites/service/${servicioId}`);
        return { isFavorite: false };
      } else {
        const response = await api.post('/api/favorites', { servicioId });
        const favoriteId = response.data?.data?.id;
        return { isFavorite: true, favoriteId };
      }

    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al cambiar favorito');
      }
      throw error;
    }
  },

  // ========================
  // OBTENER FAVORITOS DEL USUARIO
  // ========================
  getMyFavorites: async (): Promise<ServiceFavorite[]> => {
    try {
      const response = await api.get('/api/favorites/my-favorites');
      const data = response.data.data || [];

      // Normalizar igual que Booking
      return data.map((fav: any) => {
        const s = fav.servicio;
        return {
          id: fav.id,
          servicioId: s.id,
          nombre: s.nombre,
          descripcion: s.descripcion,
          precio: s.precio,
          duracion: s.duracionMin,
          profesionalId: s.profesional?.id,
          profesionalNombre: s.profesional
            ? `${s.profesional.nombre} ${s.profesional.apellidoPaterno || ''}`
            : '',
          fotoPerfil: s.profesional?.fotoPerfil,
          comuna: s.profesional?.comuna,
          categoria: s.categoria?.nombre || 'Servicio',
          imagenes: s.fotos?.map((f: any) => f.imagenUrl) || [],
          rating: s.profesional?.rating || 0
        };
      });

    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener favoritos');
      }
      throw error;
    }
  }

};