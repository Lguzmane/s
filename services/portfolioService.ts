// services/portfolioService.ts
import api from './api';

export interface PortfolioItem {
  id: number;
  imagenUrl: string;
  descripcion: string | null;
  orden: number;
  createdAt: string;
}

export interface PortfolioResponse {
  success: boolean;
  data: PortfolioItem[];
}

export interface SingleItemResponse {
  success: boolean;
  message?: string;
  data: PortfolioItem;
}

export const portfolioService = {
  // ========================
  // OBTENER PORTAFOLIO DE UN PROFESIONAL (PÚBLICO)
  // ========================
  getPortfolio: async (profesionalId: number): Promise<PortfolioItem[]> => {
    try {
      const response = await api.get<PortfolioResponse>(`/api/portfolio/${profesionalId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo portafolio:', error);
      throw error;
    }
  },

  // ========================
  // SUBIR NUEVA FOTO (PROFESIONAL)
  // ========================
  addPhoto: async (imagenUrl: string, descripcion?: string): Promise<PortfolioItem> => {
    try {
      const response = await api.post<SingleItemResponse>('/api/portfolio', {
        imagenUrl,
        descripcion
      });
      return response.data.data;
    } catch (error) {
      console.error('Error subiendo foto:', error);
      throw error;
    }
  },

  // ========================
  // ACTUALIZAR DESCRIPCIÓN
  // ========================
  updateDescription: async (id: number, descripcion: string): Promise<PortfolioItem> => {
    try {
      const response = await api.patch<SingleItemResponse>(`/api/portfolio/${id}`, {
        descripcion
      });
      return response.data.data;
    } catch (error) {
      console.error('Error actualizando descripción:', error);
      throw error;
    }
  },

  // ========================
  // REORDENAR PORTAFOLIO
  // ========================
  reorder: async (orden: number[]): Promise<void> => {
    try {
      await api.put('/api/portfolio/reorder', { orden });
    } catch (error) {
      console.error('Error reordenando portafolio:', error);
      throw error;
    }
  },

  // ========================
  // ELIMINAR FOTO
  // ========================
  deletePhoto: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/portfolio/${id}`);
    } catch (error) {
      console.error('Error eliminando foto:', error);
      throw error;
    }
  },

  // ========================
  // SUBIR IMAGEN A CLOUD (OPCIONAL - si usas upload)
  // ========================
  uploadImage: async (uri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: `portfolio_${Date.now()}.jpg`
    } as any);

    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }
};

export default portfolioService;