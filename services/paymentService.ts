//src/services/paymentService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Payment {
  id: number;
  bookingId: number;
  monto: number;
  moneda: string;
  estado: 'retenido' | 'liberado' | 'cancelado';
  metodoPago?: string;
  proveedorPago?: string;
  transaccionId?: string;
  metadata?: any;
  fechaPago?: string;
  createdAt: string;
  booking?: any;
}

export interface CreatePaymentData {
  bookingId: number;
  monto: number;
  metodoPago: string;
  proveedorPago?: string;
  transaccionId?: string;
  metadata?: any;
}

export interface PaymentStats {
  total: number;
  montoTotal: number;
  porEstado: {
    retenido: number;
    liberado: number;
    cancelado: number;
  };
  montoPorEstado: {
    retenido: number;
    liberado: number;
    cancelado: number;
  };
}

// Crear un nuevo pago (casos excepcionales - NO usar en checkout normal)
export const createPayment = async (data: CreatePaymentData): Promise<Payment> => {
  try {
    const response = await api.post('/api/payments', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating payment:', error);
    throw error.response?.data || error;
  }
};

// Obtener un pago por ID
export const getPayment = async (id: number): Promise<Payment> => {
  try {
    const response = await api.get(`/api/payments/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting payment:', error);
    throw error.response?.data || error;
  }
};

// Obtener pagos de un usuario
export const getUserPayments = async (
  userId: number,
  rol?: 'cliente' | 'profesional'
): Promise<Payment[]> => {
  try {
    const params = rol ? { rol } : {};
    const response = await api.get(`/api/payments/user/${userId}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting user payments:', error);
    throw error.response?.data || error;
  }
};

// Obtener mis pagos (usuario actual)
export const getMyPayments = async (rol?: 'cliente' | 'profesional'): Promise<Payment[]> => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      throw new Error('Usuario no autenticado');
    }
    
    const user = JSON.parse(userStr);
    const params = rol ? { rol } : {};
    const response = await api.get(`/api/payments/user/${user.id}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting my payments:', error);
    throw error.response?.data || error;
  }
};

// Actualizar estado de un pago
export const updatePaymentStatus = async (
  id: number,
  estado: Payment['estado'],
  transaccionId?: string,
  metadata?: any
): Promise<Payment> => {
  try {
    const response = await api.put(`/api/payments/${id}/status`, {
      estado,
      transaccionId,
      metadata
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    throw error.response?.data || error;
  }
};

// Procesar reembolso
export const processRefund = async (
  id: number,
  motivo: string,
  metadata?: any
): Promise<Payment> => {
  try {
    const response = await api.post(`/api/payments/${id}/refund`, {
      motivo,
      metadata
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error processing refund:', error);
    throw error.response?.data || error;
  }
};

// Obtener estadísticas de pagos (admin)
export const getPaymentStats = async (periodo?: 'dia' | 'semana' | 'mes' | 'año'): Promise<PaymentStats> => {
  try {
    const params = periodo ? { periodo } : {};
    const response = await api.get('/api/payments/stats', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting payment stats:', error);
    throw error.response?.data || error;
  }
};

// Formatear monto a CLP
export const formatCLP = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Obtener color según estado
export const getPaymentStatusColor = (estado: Payment['estado']): string => {
  const colors = {
    retenido: '#FFA000',
    liberado: '#4CAF50',
    cancelado: '#757575'
  };
  return colors[estado] || '#757575';
};

// Obtener texto legible del estado
export const getPaymentStatusText = (estado: Payment['estado']): string => {
  const texts = {
    retenido: 'Retenido',
    liberado: 'Liberado',
    cancelado: 'Cancelado'
  };
  return texts[estado] || estado;
};