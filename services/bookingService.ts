//bookingService.ts

import api from './api';

// ========================
// TIPOS CORRECTOS SEGÚN BASE
// ========================

export interface CreateBookingData {
  servicioId: number;
  fecha: string;
  hora: string;
  direccion?: string;
  notas?: string;
}

// 🔥 RESPONSE REAL DEL BACKEND
export interface Booking {
  id: number;
  fechaHora: string;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada' | 'rechazada';
  monto: number;
  duracionMin: number;

  servicio: {
    id: number;
    nombre: string;
    precio: number;
    duracionMin: number;
  };

  cliente: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
  };

  profesional: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
  };
}

export interface AvailabilitySlot {
  id?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ========================
// SERVICE
// ========================

export const bookingService = {
  // ========================
  // 1. CREAR RESERVA
  // ========================
  create: async (data: CreateBookingData) => {
    try {
      const fechaHora = `${data.fecha}T${data.hora}:00`;

      const payload = {
        servicioId: data.servicioId,
        fechaHora,
        comentariosCliente: data.notas || null,
        direccionServicio: data.direccion || null
      };

      const response = await api.post<ApiResponse<Booking>>(
        '/api/bookings',
        payload
      );

      return response.data;
    } catch (error) {
      console.error('Error en create booking:', error);
      throw error;
    }
  },

  // ========================
  // 2. MIS RESERVAS (CLIENTE)
  // ========================
  getMyBookings: async () => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(
        '/api/bookings/my-bookings',
        { params: { tipo: 'cliente' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error en getMyBookings:', error);
      throw error;
    }
  },

  // ========================
  // 3. RESERVAS PROFESIONAL
  // ========================
  getMyProfessionalBookings: async () => {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(
        '/api/bookings/my-bookings',
        { params: { tipo: 'profesional' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error en getMyProfessionalBookings:', error);
      throw error;
    }
  },

  // ========================
  // 4. OBTENER POR ID
  // ========================
  getById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Booking>>(
        `/api/bookings/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error en getBookingById:', error);
      throw error;
    }
  },

  // ========================
  // 5. CAMBIAR ESTADO
  // ========================
  updateStatus: async (id: string, estado: Booking['estado']) => {
    try {
      const response = await api.put<ApiResponse<Booking>>(
        `/api/bookings/${id}/status`,
        { estado }
      );
      return response.data;
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw error;
    }
  },

  // ========================
  // 6. DISPONIBILIDAD
  // ========================
  getAvailability: async (profesionalId: string, fecha?: string) => {
    try {
      const response = await api.get<ApiResponse<{
        disponibilidad: AvailabilitySlot[];
        reservas: {
          fechaHora: string;
          duracionMin: number;
        }[];
      }>>(
        `/api/bookings/availability/${profesionalId}`,
        fecha ? { params: { fecha } } : undefined
      );

      return response.data;
    } catch (error) {
      console.error('Error en getAvailability:', error);
      throw error;
    }
  },

  // ========================
  // 7. CANCELAR
  // ========================
  cancel: async (id: string) => {
    try {
      const response = await api.put<ApiResponse<Booking>>(
        `/api/bookings/${id}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error('Error en cancel booking:', error);
      throw error;
    }
  }
};

export default bookingService;