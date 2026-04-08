/// <reference types="jest" />
import React from 'react';

// ============================================
// MOCKS - ANTES DE CUALQUIER IMPORT
// ============================================

// Mock de expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Link: ({ children, href }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={() => require('expo-router').router.push(href)}>
        <Text>{children}</Text>
      </Pressable>
    );
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock de servicios
jest.mock('../services/serviceService', () => ({
  serviceService: {
    getAllServices: jest.fn(),
  },
}));

jest.mock('../services/favoriteService', () => ({
  favoriteService: {
    checkIsFavorite: jest.fn(() => Promise.resolve(false)),
    toggleFavorite: jest.fn(() => Promise.resolve({ isFavorite: true })),
  },
}));

jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

// Mock de useSafeAreaInsets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock de Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock de RatingStars
jest.mock('../components/ui/RatingStars', () => 'RatingStars');

// ============================================
// IMPORTS REALES
// ============================================
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../app/(tabs)/home/index';
import { serviceService } from '../services/serviceService';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// ============================================
// CONFIGURACIÓN
// ============================================
global.console.error = jest.fn();
global.console.warn = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================
// MOCK DATA
// ============================================
const mockServices = {
  success: true,
  data: [
    { id: 1, nombre: 'Servicio 1', descripcion: 'Desc 1', precio: 10000, rating: 5 },
    { id: 2, nombre: 'Servicio 2', descripcion: 'Desc 2', precio: 20000, rating: 4.5 },
    { id: 3, nombre: 'Servicio 3', descripcion: 'Desc 3', precio: 15000, rating: 4 },
  ],
};

const mockUser = {
  id: 1,
  nombre: 'Test User',
  rol: 'Cliente',
  email: 'test@test.com'
};

const mockProfessional = {
  id: 2,
  nombre: 'Test Pro',
  rol: 'Profesional',
  email: 'pro@test.com'
};

// ============================================
// WRAPPERS PERSONALIZADOS CON CONTEXTO MOCKEADO
// ============================================

const renderWithAuth = (component: React.ReactNode, user: any = null) => {
  return render(
    <AuthContext.Provider value={{
      user,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      refreshUser: jest.fn(),
      error: null,
    }}>
      {component}
    </AuthContext.Provider>
  );
};

// ============================================
// TESTS
// ============================================
describe('Home Module', () => {

  describe('Renderizado básico', () => {
    test('renderiza correctamente para usuario no logueado', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);

      const { getByText } = renderWithAuth(<Home />, null);

      expect(getByText('Hola, invitado')).toBeTruthy();
      expect(getByText('¿Qué servicio estás buscando?')).toBeTruthy();
      expect(getByText('Experiencia cliente')).toBeTruthy();
      expect(getByText('Recomendados para ti')).toBeTruthy();
      expect(getByText('Tips para clientes')).toBeTruthy();
      expect(getByText('¿Ofreces servicios?')).toBeTruthy();

      await waitFor(() => {
        expect(serviceService.getAllServices).toHaveBeenCalledWith(1, 5);
      });
    });

    test('renderiza correctamente para cliente logueado', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: { 
                totalFavoritos: 3,
                reservasPendientes: 2
              } 
            } 
          });
        }
        if (url === '/reservas/cliente/proxima') {
          return Promise.reject(new Error('No hay reservas'));
        }
        return Promise.resolve({ data: {} });
      });

      const { getByText, queryByText, findByText } = renderWithAuth(<Home />, mockUser);

      await findByText('Hola, Test User');
      await findByText('Tienes 3 favoritos');
      
      expect(queryByText('Experiencia pro')).toBeNull();
      // ✅ CORREGIDO: Cliente SÍ debe ver el CTA
      expect(queryByText('¿Ofreces servicios?')).toBeTruthy();
    });

    test('renderiza correctamente para profesional logueado', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { success: true, data: { totalServicios: 5 } } 
          });
        }
        if (url === '/reservas/profesional/pendientes') {
          return Promise.resolve({ data: { reservas: [] } });
        }
        return Promise.resolve({ data: {} });
      });

      const { getByText, findByText } = renderWithAuth(<Home />, mockProfessional);

      await findByText('Hola, Test Pro');
      expect(getByText('Experiencia pro')).toBeTruthy();
      expect(getByText('Mis servicios (5)')).toBeTruthy();
    });
  });

  describe('Navegación', () => {
    test('navega a búsqueda al tocar la barra de búsqueda', () => {
      const { getByText } = renderWithAuth(<Home />, null);
      
      fireEvent.press(getByText('¿Qué servicio estás buscando?'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalled();
    });

    test('navega a login si no hay usuario y toca Favoritos', () => {
      const { getByText } = renderWithAuth(<Home />, null);
      
      fireEvent.press(getByText('Favoritos'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/auth/login');
    });

    test('navega a favoritos si hay usuario', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      (api.get as jest.Mock).mockResolvedValue({ data: { success: true, data: {} } });

      const { getByText, findByText } = renderWithAuth(<Home />, mockUser);

      await findByText('Hola, Test User');
      fireEvent.press(getByText('Favoritos'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/profile/favorites');
    });

    test('navega a historial de cliente', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      (api.get as jest.Mock).mockResolvedValue({ data: { success: true, data: {} } });

      const { getByText, findByText } = renderWithAuth(<Home />, mockUser);

      await findByText('Hola, Test User');
      fireEvent.press(getByText('Historial'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('../history');
    });
  });

  describe('Experiencia Pro', () => {
    test('profesional ve y navega a solicitudes pendientes', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { success: true, data: { totalServicios: 5 } } 
          });
        }
        if (url === '/reservas/profesional/pendientes') {
          return Promise.resolve({ 
            data: { reservas: [{ id: 1, estado: 'pendiente' }] } 
          });
        }
        return Promise.resolve({ data: {} });
      });

      const { getByText, findByText } = renderWithAuth(<Home />, mockProfessional);

      await findByText('Hola, Test Pro');
      
      const solicitudes = await findByText('Solicitudes pendientes');
      expect(solicitudes).toBeTruthy();
    });

    test('profesional navega a Mis servicios', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { success: true, data: { totalServicios: 5 } } 
          });
        }
        if (url === '/reservas/profesional/pendientes') {
          return Promise.resolve({ data: { reservas: [] } });
        }
        return Promise.resolve({ data: {} });
      });

      const { getByText, findByText } = renderWithAuth(<Home />, mockProfessional);

      await findByText('Hola, Test Pro');
      await findByText('Mis servicios (5)');

      fireEvent.press(getByText('Mis servicios (5)'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/profile/myservices');
    });

    test('profesional navega a Agenda', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { success: true, data: { totalServicios: 5 } } 
          });
        }
        if (url === '/reservas/profesional/pendientes') {
          return Promise.resolve({ data: { reservas: [] } });
        }
        return Promise.resolve({ data: {} });
      });

      const { getByText, findByText } = renderWithAuth(<Home />, mockProfessional);

      await findByText('Hola, Test Pro');
      await findByText('Agenda');

      fireEvent.press(getByText('Agenda'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/profile/schedule');
    });
  });

  describe('Manejo de errores', () => {
    test('muestra servicios mock si falla la API', async () => {
      (serviceService.getAllServices as jest.Mock).mockRejectedValue(new Error('Error de red'));

      const { getByText } = renderWithAuth(<Home />, null);

      await waitFor(() => {
        expect(getByText('Servicio destacado 1')).toBeTruthy();
        expect(getByText('Servicio destacado 2')).toBeTruthy();
        expect(getByText('Servicio destacado 3')).toBeTruthy();
      });
    });

    test('no muestra próxima cita si no hay', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { success: true, data: { totalFavoritos: 3 } } 
          });
        }
        if (url === '/reservas/cliente/proxima') {
          return Promise.reject(new Error('No hay reservas'));
        }
        return Promise.resolve({ data: {} });
      });

      const { getByText, findByText } = renderWithAuth(<Home />, mockUser);

      await findByText('Hola, Test User');
      
      const mensaje = await findByText('No tienes próximas citas');
      expect(mensaje).toBeTruthy();
    });
  });

  describe('CTA para unirse', () => {
    test('no muestra CTA si es profesional', async () => {
      (serviceService.getAllServices as jest.Mock).mockResolvedValue(mockServices);
      
      (api.get as jest.Mock).mockImplementation((url) => {
        if (url === '/users/stats/me') {
          return Promise.resolve({ 
            data: { success: true, data: { totalServicios: 5 } } 
          });
        }
        if (url === '/reservas/profesional/pendientes') {
          return Promise.resolve({ data: { reservas: [] } });
        }
        return Promise.resolve({ data: {} });
      });

      const { queryByText, findByText } = renderWithAuth(<Home />, mockProfessional);

      await findByText('Hola, Test Pro');
      
      expect(queryByText('¿Ofreces servicios?')).toBeNull();
    });

    test('navega a registro al tocar "Comenzar ahora"', () => {
      const { getByText } = renderWithAuth(<Home />, null);

      fireEvent.press(getByText('Comenzar ahora'));

      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/auth/register');
    });
  });
});