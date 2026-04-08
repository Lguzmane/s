// context/CartContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export type CartItem = { 
  id: string | number;
  bookingId: string | number;
  servicioId: string | number;
  nombre?: string; 
  precio?: number;
  profesionalId: number;
  profesionalNombre?: string;
  duracion?: number;
  fecha?: string;
  imagen?: string;
};

type CartCtx = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  getProfesionalInfo: () => { id: number | null; nombre: string | null };
};

const CartContext = createContext<CartCtx>({} as CartCtx);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Cargar carrito guardado
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("cart");
        if (stored) setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error("Error cargando carrito:", e);
      }
    })();
  }, []);

  // Guardar cada cambio
  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cartItems)).catch(() => {});
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    // Validar que todos los items sean del mismo profesional
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      if (firstItem.profesionalId !== item.profesionalId) {
        Alert.alert(
          "Carrito mixto no permitido",
          `Solo puedes agregar servicios de un mismo profesional. Actualmente tienes servicios de ${firstItem.profesionalNombre || "otro profesional"}. ¿Deseas vaciar el carrito y agregar este nuevo servicio?`,
          [
            { text: "Cancelar", style: "cancel" },
            { 
              text: "Vaciar y agregar", 
              onPress: () => setCartItems([item]),
              style: "destructive"
            }
          ]
        );
        return;
      }
    }
    
    setCartItems((prev) => [...prev, item]);
  };

  const removeFromCart = (id: string | number) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  const clearCart = () => setCartItems([]);

  const getProfesionalInfo = () => {
    if (cartItems.length === 0) return { id: null, nombre: null };
    return {
      id: cartItems[0].profesionalId,
      nombre: cartItems[0].profesionalNombre || "Profesional"
    };
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart,
      getProfesionalInfo 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);