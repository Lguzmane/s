//services/messageService.ts
import api from './api';

export interface Message {
  id: number;
  remitenteId: number;
  destinatarioId: number;
  contenido: string;
  leido: boolean;
  createdAt: string;
  remitente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    fotoPerfil?: string;
  };
  destinatario?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    fotoPerfil?: string;
  };
}

export interface Conversation {
  contacto: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    fotoPerfil?: string;
    rol: string;
  };
  ultimoMensaje?: {
    id: number;
    contenido: string;
    createdAt: string;
    leido: boolean;
    remitente: {
      id: number;
      nombre: string;
      apellidoPaterno: string;
    };
  };
  mensajesNoLeidos: number;
  ultimaInteraccion: string | null;
}

export const messageService = {
  // Obtener todas las conversaciones del usuario
  getConversations: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/messages/conversations', {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  // Obtener mensajes con un contacto específico
  getMessagesWithContact: async (contactoId: number, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/api/messages/contact/${contactoId}`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Enviar un mensaje
  sendMessage: async (destinatarioId: number, contenido: string, tipo = 'texto') => {
    try {
      const response = await api.post('/api/messages', {
        destinatarioId,
        contenido,
        tipo
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Marcar mensajes como leídos (todos con un contacto)
  markMessagesAsRead: async (contactoId: number) => {
    try {
      const response = await api.put(`/api/messages/contact/${contactoId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Obtener contador de mensajes no leídos
  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/messages/unread/count');
      return response.data.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Eliminar un mensaje
  deleteMessage: async (messageId: number) => {
    try {
      const response = await api.delete(`/api/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Buscar mensajes
  searchMessages: async (query: string, contactoId?: number) => {
    try {
      const response = await api.get('/api/messages/search', {
        params: { query, contactoId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }
};