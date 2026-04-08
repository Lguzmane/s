/// <reference types="jest" />

// Mocks ANTES de cualquier import - SIN USAR REACT
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-router', () => {
  // No usar React aquí, solo funciones puras
  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    Link: ({ children, href, asChild, ...props }: any) => {
      // Versión simplificada - siempre devolvemos un Pressable
      const { Pressable, Text } = require('react-native');
      return (
        <Pressable
          onPress={() => {
            const { router } = require('expo-router');
            router.push(href);
          }}
          {...props}
        >
          <Text>{children}</Text>
        </Pressable>
      );
    },
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock('../utils/storage', () => ({
  storage: {
    getTokens: jest.fn(() => Promise.resolve({ accessToken: null })),
    setTokens: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
    checkAuth: jest.fn(() => Promise.resolve(null)),
    logout: jest.fn(),
  },
}));

// Ahora sí, los imports reales
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../context/AuthContext';
import LoginScreen from '../app/auth/login';
import ForgotPasswordScreen from '../app/auth/forgot-password';
import RegisterScreen from '../app/auth/register';

// Silenciar console.error durante tests
global.console.error = jest.fn();

// Limpiar todos los mocks antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Auth Module', () => {
  
  test('los tests funcionan', () => {
    expect(true).toBe(true);
  });

  describe('LoginScreen', () => {
    test('renderiza correctamente', async () => {
      const { getByText, getByPlaceholderText, queryByText } = render(
        <LoginScreen />, 
        { wrapper }
      );

      // Esperar a que el loader desaparezca y aparezca el botón
      await waitFor(() => {
        expect(queryByText('Iniciar Sesión')).toBeTruthy();
      });

      expect(getByText('SMarket')).toBeTruthy();
      expect(getByPlaceholderText('Correo electrónico')).toBeTruthy();
      expect(getByPlaceholderText('Contraseña')).toBeTruthy();
      expect(getByText('Iniciar Sesión')).toBeTruthy();
      expect(getByText('¿Olvidaste tu contraseña?')).toBeTruthy();
      expect(getByText('¿Aún no tienes cuenta?')).toBeTruthy();
      expect(getByText('Regístrate')).toBeTruthy();
    });

    test('navega a registro cuando toca "Regístrate"', async () => {
      const { getByText, queryByText } = render(<LoginScreen />, { wrapper });

      await waitFor(() => {
        expect(queryByText('Iniciar Sesión')).toBeTruthy();
      });

      fireEvent.press(getByText('Regístrate'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/auth/register');
    });

    test('navega a forgot-password cuando toca "¿Olvidaste tu contraseña?"', async () => {
      const { getByText, queryByText } = render(<LoginScreen />, { wrapper });

      await waitFor(() => {
        expect(queryByText('Iniciar Sesión')).toBeTruthy();
      });

      fireEvent.press(getByText('¿Olvidaste tu contraseña?'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/auth/forgot-password');
    });
  });

  describe('ForgotPasswordScreen', () => {
    test('renderiza correctamente', () => {
      const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);

      expect(getByText('Recuperar Contraseña')).toBeTruthy();
      expect(getByPlaceholderText('Correo electrónico')).toBeTruthy();
      expect(getByText('Enviar enlace')).toBeTruthy();
      expect(getByText('Volver')).toBeTruthy();
    });

    test('navega a login cuando toca "Volver"', () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      
      fireEvent.press(getByText('Volver'));
      
      const { router } = require('expo-router');
      expect(router.replace).toHaveBeenCalledWith('/auth/login');
    });

    test('muestra error si email vacío', async () => {
      const { getByText, findByText } = render(<ForgotPasswordScreen />);
      
      fireEvent.press(getByText('Enviar enlace'));

      const errorMessage = await findByText('Ingresa un correo válido.');
      expect(errorMessage).toBeTruthy();
    });

    test('envía email exitosamente', async () => {
      const { authService } = require('../services/authService');
      authService.forgotPassword.mockResolvedValueOnce({});

      const { getByText, getByPlaceholderText, findByText } = render(
        <ForgotPasswordScreen />
      );

      const emailInput = getByPlaceholderText('Correo electrónico');
      const submitButton = getByText('Enviar enlace');

      fireEvent.changeText(emailInput, 'test@test.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@test.com');
      });

      const successMessage = await findByText(/Te enviamos un correo/i);
      expect(successMessage).toBeTruthy();
    });

    test('muestra error si forgotPassword falla', async () => {
      const { authService } = require('../services/authService');
      authService.forgotPassword.mockRejectedValueOnce(
        new Error('Email no registrado')
      );

      const { getByText, getByPlaceholderText, findByText } = render(
        <ForgotPasswordScreen />
      );

      const emailInput = getByPlaceholderText('Correo electrónico');
      const submitButton = getByText('Enviar enlace');

      fireEvent.changeText(emailInput, 'test@test.com');
      fireEvent.press(submitButton);

      const errorMessage = await findByText('Email no registrado');
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('RegisterScreen', () => {
    test('renderiza correctamente', () => {
      const { getByText } = render(<RegisterScreen />, { wrapper });

      expect(getByText('Registrarse')).toBeTruthy();
      expect(getByText('Crea tu cuenta para comenzar')).toBeTruthy();
      expect(getByText('¿Ya tienes cuenta?')).toBeTruthy();
      expect(getByText('Inicia sesión aquí')).toBeTruthy();
    });

    test('navega a login cuando toca "Inicia sesión aquí"', () => {
      const { getByText } = render(<RegisterScreen />, { wrapper });
      
      fireEvent.press(getByText('Inicia sesión aquí'));
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/auth/login');
    });
  });
});