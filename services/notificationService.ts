//smarket/services/notificationService.ts
import api from './api';
import { AxiosError } from 'axios';

export interface Notification {
  id: number;
  usuarioId: number;
  titulo: string;
  mensaje: string;
  tipo: string | null;
  metadata: any;
  leida: boolean;
  createdAt: string;
  fechaLeida: string | null;
}

export interface NotificationsResponse {
  notificaciones: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationService = {
  // OBTENER MIS NOTIFICACIONES
  getMyNotifications: async (page: number = 1, limit: number = 20): Promise<NotificationsResponse> => {
    try {
      const response = await api.get('/api/notifications', {
        params: { page, limit }
      });
      return {
        notificaciones: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener notificaciones');
      }
      throw error;
    }
  },

  // OBTENER CONTADOR DE NO LEÍDAS
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener contador');
      }
      throw error;
    }
  },

  // MARCAR COMO LEÍDA
  markAsRead: async (id: number): Promise<Notification> => {
    try {
      const response = await api.put(`/api/notifications/${id}/read`);
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al marcar notificación');
      }
      throw error;
    }
  },

  // MARCAR TODAS COMO LEÍDAS
  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      const response = await api.put('/api/notifications/read-all');
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al marcar notificaciones');
      }
      throw error;
    }
  },

  // ELIMINAR NOTIFICACIÓN
  deleteNotification: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/api/notifications/${id}`);
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al eliminar notificación');
      }
      throw error;
    }
  }
};