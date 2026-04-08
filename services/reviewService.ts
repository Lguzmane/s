// services/reviewService.ts
import api from './api';

export interface Review {
  id: number;
  calificacion: number;
  comentario: string | null;
  respuestaProfesional?: string | null;
  fechaRespuesta?: string | null;
  createdAt: string;
  cliente: {
    id: number;
    nombre: string;
    apellidoPaterno: string | null;
    fotoPerfil?: string | null;
  };
  profesional?: {
    id: number;
    nombre: string;
    apellidoPaterno: string | null;
  };
  servicio: {
    id: number;
    nombre: string;
  };
}

// GET /service/:servicioId - PÚBLICA
export const getReviewsByService = async (serviceId: number | string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/api/reviews/service/${serviceId}`, {
      params: { page, limit }
    });
    
    // La estructura real: { success: true, data: { servicio, reviews, estadisticas, pagination } }
    return {
      reviews: response.data.data?.reviews || [],
      estadisticas: response.data.data?.estadisticas || null,
      pagination: response.data.data?.pagination || response.data.pagination || {}
    };
  } catch (error: any) {
    console.error('Error al obtener reseñas:', error);
    throw error.response?.data || { error: 'Error al cargar las reseñas' };
  }
};

// GET /professional/:profesionalId - PÚBLICA
export const getReviewsByProfessional = async (professionalId: number | string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/api/reviews/professional/${professionalId}`, {
      params: { page, limit }
    });
    
    return {
      reviews: response.data.data?.reviews || [],
      profesional: response.data.data?.profesional || null,
      pagination: response.data.data?.pagination || response.data.pagination || {}
    };
  } catch (error: any) {
    console.error('Error al obtener reseñas del profesional:', error);
    throw error.response?.data || { error: 'Error al cargar las reseñas' };
  }
};

// POST / - PROTEGIDA (Cliente)
// 🔥 CORRECCIÓN: reservaId → bookingId
export const createReview = async (data: { bookingId: number; calificacion: number; comentario?: string }) => {
  try {
    const response = await api.post('/api/reviews', {
      bookingId: data.bookingId,
      calificacion: data.calificacion,
      comentario: data.comentario
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error al crear reseña:', error);
    throw error.response?.data || { error: 'Error al crear la reseña' };
  }
};

// PUT /:id/respond - PROTEGIDA (Profesional)
export const respondToReview = async (reviewId: number, respuesta: string) => {
  try {
    const response = await api.put(`/api/reviews/${reviewId}/respond`, { respuesta });
    return response.data.data;
  } catch (error: any) {
    console.error('Error al responder reseña:', error);
    throw error.response?.data || { error: 'Error al enviar la respuesta' };
  }
};

// GET /user/reviews - PROTEGIDA
export const getMyReviews = async (tipo?: 'cliente' | 'profesional', page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/reviews/user/reviews', {
      params: { tipo, page, limit }
    });
    
    return {
      reviews: response.data.data || [],
      pagination: response.data.pagination || {}
    };
  } catch (error: any) {
    console.error('Error al obtener mis reseñas:', error);
    throw error.response?.data || { error: 'Error al cargar tus reseñas' };
  }
};

// GET /:id - PÚBLICA
export const getReviewById = async (reviewId: number) => {
  try {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error al obtener reseña:', error);
    throw error.response?.data || { error: 'Error al cargar la reseña' };
  }
};

// DELETE /:id - PROTEGIDA
export const deleteReview = async (reviewId: number) => {
  try {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al eliminar reseña:', error);
    throw error.response?.data || { error: 'Error al eliminar la reseña' };
  }
};