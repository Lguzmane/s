/// <reference types="jest" />
import React from 'react';

// ============================================
// MOCKS - ANTES DE CUALQUIER IMPORT
// ============================================

// Mock de expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock de servicios
jest.mock('../services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

jest.mock('../services/paymentService', () => ({
  createPayment: jest.fn(),
  getMyPayments: jest.fn(),
  formatCLP: jest.fn((amount) => `$${amount.toLocaleString('es-CL')}`),
}));

// Mock de Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// ============================================
// IMPORTS REALES
// ============================================
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthContext } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import CartScreen from '../app/(tabs)/cart/index';
import CheckoutScreen from '../app/(tabs)/cart/checkout/index';

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
const mockUser = {
  id: 1,
  nombre: 'Test User',
  email: 'test@test.com',
  ubicacion: 'Santiago',
};

const mockCartItems = [
  {
    id: 1,
    nombre: 'Corte de cabello',
    precio: 15000,
    profesionalId: 101,
    profesionalNombre: 'Profesional Test',
    duracion: 45,
  },
  {
    id: 2,
    nombre: 'Tinte',
    precio: 35000,
    profesionalId: 101,
    profesionalNombre: 'Profesional Test',
    duracion: 90,
  },
];

const mockProfesionalInfo = {
  id: 101,
  nombre: 'Profesional Test',
};

// ============================================
// MOCK DE USECART PARA TESTS CON ITEMS
// ============================================
const mockUseCartWithItems = {
  cartItems: mockCartItems,
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  getProfesionalInfo: jest.fn(() => mockProfesionalInfo),
};

const mockUseCartEmpty = {
  cartItems: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  getProfesionalInfo: jest.fn(() => ({ id: null, nombre: null })),
};

// ============================================
// WRAPPERS PERSONALIZADOS
// ============================================

const renderWithProviders = (
  component: React.ReactNode, 
  user: any = null,
  cartMock: any = mockUseCartEmpty
) => {
  // Mock de useCart para este render específico
  jest.spyOn(require('../context/CartContext'), 'useCart').mockReturnValue(cartMock);

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
      <CartProvider>
        {component}
      </CartProvider>
    </AuthContext.Provider>
  );
};

// ============================================
// TESTS DE CART SCREEN
// ============================================
describe('Cart Module - CartScreen', () => {

  test('muestra mensaje de carrito vacío', () => {
    const { getByText } = renderWithProviders(<CartScreen />, null, mockUseCartEmpty);

    expect(getByText('Tu carrito está vacío 🛒')).toBeTruthy();
  });

  test('muestra items del carrito cuando existen', () => {
    const { getByText } = renderWithProviders(<CartScreen />, mockUser, mockUseCartWithItems);

    expect(getByText('Corte de cabello')).toBeTruthy();
    expect(getByText('Tinte')).toBeTruthy();
    expect(getByText('$15.000')).toBeTruthy();
    expect(getByText('$35.000')).toBeTruthy();
  });

  test('navega a login al pagar sin usuario', () => {
    const { getByText } = renderWithProviders(<CartScreen />, null, mockUseCartWithItems);

    fireEvent.press(getByText('Pagar ahora'));

    const { router } = require('expo-router');
    expect(router.push).toHaveBeenCalledWith('/auth/login');
  });

  test('aplica cupón válido', async () => {
    const mockApi = require('../services/api');
    mockApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { descuento: 5000 }
      }
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CartScreen />, 
      mockUser,
      mockUseCartWithItems
    );

    fireEvent.changeText(getByPlaceholderText('Ingresa tu cupón'), 'DESCUENTO10');
    fireEvent.press(getByText('Aplicar'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/coupons/validate', {
        codigo: 'DESCUENTO10',
        monto: 50000, // 15000 + 35000
        usuarioId: 1
      });
    });
  });

  test('muestra error con cupón inválido', async () => {
    const mockApi = require('../services/api');
    mockApi.post.mockRejectedValueOnce({
      response: { data: { message: 'Cupón inválido' } }
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CartScreen />, 
      mockUser,
      mockUseCartWithItems
    );

    fireEvent.changeText(getByPlaceholderText('Ingresa tu cupón'), 'INVALIDO');
    fireEvent.press(getByText('Aplicar'));

    // No podemos verificar Alert fácilmente, pero podemos ver que se llamó a la API
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  test('navega a checkout al pagar con usuario', () => {
    const { getByText } = renderWithProviders(<CartScreen />, mockUser, mockUseCartWithItems);

    fireEvent.press(getByText('Pagar ahora'));

    const { router } = require('expo-router');
    expect(router.push).toHaveBeenCalledWith('/checkout');
  });

  test('elimina item del carrito', () => {
    const { getByText, getAllByText } = renderWithProviders(
      <CartScreen />, 
      mockUser, 
      mockUseCartWithItems
    );

    const removeButtons = getAllByText('Eliminar');
    fireEvent.press(removeButtons[0]);

    expect(mockUseCartWithItems.removeFromCart).toHaveBeenCalledWith(1);
  });
});

// ============================================
// TESTS DE CHECKOUT SCREEN
// ============================================
describe('Cart Module - CheckoutScreen', () => {

  test('redirige a home si carrito vacío', () => {
    const { getByText } = renderWithProviders(<CheckoutScreen />, mockUser, mockUseCartEmpty);

    fireEvent.press(getByText('Ir al inicio'));

    const { router } = require('expo-router');
    expect(router.push).toHaveBeenCalledWith('/(tabs)/home');
  });

  test('muestra resumen de compra', () => {
    const { getByText } = renderWithProviders(<CheckoutScreen />, mockUser, mockUseCartWithItems);

    expect(getByText('Profesional Test')).toBeTruthy();
    expect(getByText('Corte de cabello')).toBeTruthy();
    expect(getByText('Tinte')).toBeTruthy();
    expect(getByText('$15.000')).toBeTruthy();
    expect(getByText('$35.000')).toBeTruthy();
    expect(getByText('Total')).toBeTruthy();
  });

  test('permite seleccionar método de pago', () => {
    const { getByText } = renderWithProviders(<CheckoutScreen />, mockUser, mockUseCartWithItems);

    fireEvent.press(getByText('Efectivo'));
    fireEvent.press(getByText('SMarket Cash'));
    fireEvent.press(getByText('Tarjeta'));
  });

  test('muestra formulario de tarjeta al seleccionar tarjeta', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CheckoutScreen />, 
      mockUser,
      mockUseCartWithItems
    );

    fireEvent.press(getByText('Tarjeta'));

    expect(getByPlaceholderText('Número de tarjeta')).toBeTruthy();
    expect(getByPlaceholderText('Titular de la tarjeta')).toBeTruthy();
    expect(getByPlaceholderText('MM/YY')).toBeTruthy();
    expect(getByPlaceholderText('CVC')).toBeTruthy();
  });

  test('valida datos de tarjeta antes de pagar', async () => {
    const mockApi = require('../services/api');
    mockApi.post.mockResolvedValue({ data: { id: 123 } });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CheckoutScreen />, 
      mockUser,
      mockUseCartWithItems
    );

    fireEvent.press(getByText('Tarjeta'));

    // Dejar campos vacíos y pagar
    // ✅ CORREGIDO: usar el formato con punto
    fireEvent.press(getByText('Pagar $50.000'));

    // Verificar que no se llamó a la API
    await waitFor(() => {
      expect(mockApi.post).not.toHaveBeenCalled();
    });
  });

  test('procesa pago exitoso con efectivo', async () => {
    const mockApi = require('../services/api');
    mockApi.post
      .mockResolvedValueOnce({ data: { id: 123 } }) // POST /api/bookings
      .mockResolvedValueOnce({ data: { id: 456 } }); // POST /api/payments

    const { getByText } = renderWithProviders(<CheckoutScreen />, mockUser, mockUseCartWithItems);

    // ✅ CORREGIDO: usar el formato con punto
    fireEvent.press(getByText('Pagar $50.000'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/api/bookings', expect.any(Object));
    expect(mockApi.post).toHaveBeenCalledWith('/api/payments', expect.any(Object));
    expect(mockUseCartWithItems.clearCart).toHaveBeenCalled();
  });

  test('procesa pago exitoso con tarjeta', async () => {
    const mockApi = require('../services/api');
    mockApi.post
      .mockResolvedValueOnce({ data: { id: 123 } })
      .mockResolvedValueOnce({ data: { id: 456 } });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CheckoutScreen />, 
      mockUser,
      mockUseCartWithItems
    );

    fireEvent.press(getByText('Tarjeta'));

    // Llenar datos de tarjeta
    fireEvent.changeText(getByPlaceholderText('Número de tarjeta'), '4111111111111111');
    fireEvent.changeText(getByPlaceholderText('Titular de la tarjeta'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('MM/YY'), '12/25');
    fireEvent.changeText(getByPlaceholderText('CVC'), '123');

    // ✅ CORREGIDO: usar el formato con punto
    fireEvent.press(getByText('Pagar $50.000'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });
  });

  test('muestra error si falla el pago', async () => {
    const mockApi = require('../services/api');
    mockApi.post.mockRejectedValueOnce({
      response: { data: { message: 'Error de pago' } }
    });

    const { getByText } = renderWithProviders(<CheckoutScreen />, mockUser, mockUseCartWithItems);

    // ✅ CORREGIDO: usar el formato con punto
    fireEvent.press(getByText('Pagar $50.000'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledTimes(1); // Solo bookings, payments no se llama
    });
  });
});

// ============================================
// TESTS DE CART CONTEXT (sin cambios)
// ============================================
describe('Cart Module - CartContext', () => {
  // Estos tests necesitan implementación con el Provider real
  // Por ahora los dejamos como placeholders
  test('agrega item al carrito', () => {});
  test('elimina item del carrito', () => {});
  test('previene carrito mixto', () => {});
  test('limpia carrito', () => {});
  test('obtiene info del profesional', () => {});
});