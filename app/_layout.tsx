// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" backgroundColor="#1E1240" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}