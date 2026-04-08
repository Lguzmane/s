//smarket/services/adminService.ts
import api from './api';

export const adminService = {
  // ========== DASHBOARD ==========
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // ========== USUARIOS ==========
  async getUsers(params?: { 
    page?: number; 
    limit?: number; 
    rol?: string; 
    search?: string; 
    categoria?: string;
    verificado?: string; 
    destacado?: string 
  }) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getUserById(id: number) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateUserRole(id: number, rol: string) {
    const response = await api.patch(`/admin/users/${id}/role`, { rol });
    return response.data;
  },

  async verifyUser(id: number) {
    const response = await api.patch(`/admin/users/${id}/verify`);
    return response.data;
  },

  async toggleUserFeatured(id: number) {
    const response = await api.patch(`/admin/users/${id}/feature`);
    return response.data;
  },

  async suspendUser(id: number, motivo: string) {
    const response = await api.post(`/admin/users/${id}/suspend`, { motivo });
    return response.data;
  },

  // ========== SERVICIOS ==========
  async getServices(params?: { 
    page?: number; 
    limit?: number; 
    categoria?: number; 
    activo?: boolean; 
    destacado?: boolean; 
    reportado?: boolean;
    search?: string 
  }) {
    const response = await api.get('/admin/services', { params });
    return response.data;
  },

  async getServiceById(id: number) {
    const response = await api.get(`/admin/services/${id}`);
    return response.data;
  },

  async updateServiceStatus(id: number, data: { activo?: boolean; destacado?: boolean; motivo?: string }) {
    const response = await api.patch(`/admin/services/${id}/status`, data);
    return response.data;
  },

  // ========== RESEÑAS ==========
  async getReportedReviews() {
    const response = await api.get('/admin/reviews/reported');
    return response.data;
  },

  async getReviewById(id: number) {
    const response = await api.get(`/admin/reviews/${id}`);
    return response.data;
  },

  async deleteReview(id: number, motivo: string) {
    const response = await api.delete(`/admin/reviews/${id}`, {
      data: { motivo }
    });
    return response.data;
  },

  // ========== CATEGORÍAS ==========
  async getCategories() {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  async createCategory(data: { nombre: string; icono?: string; descripcion?: string; orden?: number }) {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: { nombre?: string; icono?: string; descripcion?: string; orden?: number; activa?: boolean }) {
    const response = await api.patch(`/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number, moverServiciosA?: number) {
    const response = await api.delete(`/admin/categories/${id}`, {
      data: { moverServiciosA }
    });
    return response.data;
  },

  // ========== CUPONES ==========
  async getCoupons(params?: {
    page?: number;
    limit?: number;
    activo?: boolean;
    tipo?: string;
    search?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const response = await api.get('/admin/coupons', { params });
    return response.data;
  },

  async getCouponById(id: number) {
    const response = await api.get(`/admin/coupons/${id}`);
    return response.data;
  },

  async createCoupon(data: {
    codigo: string;
    tipo: 'porcentaje' | 'fijo';
    valor: number;
    fechaInicio: string;
    fechaFin: string;
    usosMaximos: number;
    usosPorUsuario?: number;
    montoMinimo?: number;
    categorias?: number[];
    activo?: boolean;
  }) {
    const response = await api.post('/admin/coupons', data);
    return response.data;
  },

  async updateCoupon(id: number, data: Partial<{
    codigo: string;
    tipo: 'porcentaje' | 'fijo';
    valor: number;
    fechaInicio: string;
    fechaFin: string;
    usosMaximos: number;
    usosPorUsuario: number;
    montoMinimo: number;
    categorias: number[];
    activo: boolean;
  }>) {
    const response = await api.put(`/admin/coupons/${id}`, data);
    return response.data;
  },

  async deleteCoupon(id: number) {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
  },

  async getCouponUsage(id: number, params?: { page?: number; limit?: number }) {
    const response = await api.get(`/admin/coupons/${id}/usage`, { params });
    return response.data;
  },

  async validateCoupon(data: { codigo: string; monto: number; categoriaId?: number; usuarioId?: number }) {
    const response = await api.post('/coupons/validate', data);
    return response.data;
  },

  // ========== REPORTES ==========
  async getReports(params?: {
    page?: number;
    limit?: number;
    estado?: string;
    tipo?: string;
    search?: string;
  }) {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  async getReportById(id: number) {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },

  async updateReportStatus(id: number, data: { estado: string; resolucion?: string }) {
    const response = await api.patch(`/admin/reports/${id}/status`, data);
    return response.data;
  },

  async deleteReport(id: number) {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data;
  },

  // 👇 MODIFICADO: AHORA ACEPTA PARÁMETROS
  async getReportStats(params?: { timeRange?: string; comuna?: string }) {
    const response = await api.get('/admin/reports/stats', { params });
    return response.data;
  },

  async createReport(data: {
    tipo: 'SERVICE' | 'REVIEW';
    motivo: string;
    descripcion?: string;
    servicioId?: number;
    reviewId?: number;
    usuarioReportadoId: number;
  }) {
    const response = await api.post('/reports', data);
    return response.data;
  },

  // ========== CONFIGURACIÓN ==========
  async getSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async getSettingByKey(clave: string) {
    const response = await api.get(`/admin/settings/${clave}`);
    return response.data;
  },

  async upsertSetting(clave: string, data: {
    valor: any;
    descripcion?: string;
    tipo?: string;
    editable?: boolean;
  }) {
    const response = await api.put(`/admin/settings/${clave}`, data);
    return response.data;
  },

  async updateSettings(settings: Record<string, any>) {
    const response = await api.patch('/admin/settings/bulk', { settings });
    return response.data;
  },

  async deleteSetting(clave: string) {
    const response = await api.delete(`/admin/settings/${clave}`);
    return response.data;
  },

  async initializeDefaultSettings() {
    const response = await api.post('/admin/settings/initialize');
    return response.data;
  },

  async getPublicSettings() {
    const response = await api.get('/settings/public');
    return response.data;
  }
};