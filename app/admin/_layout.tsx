//app/admin/_layout.tsx
import { FontAwesome } from "@expo/vector-icons";
import { Tabs, useRouter, Stack } from "expo-router";
import { useContext, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  // Verificar si es admin o superadmin
  useEffect(() => {
    if (!isLoading) {
      // CORRECCIÓN: permitir Admin y SuperAdmin
      const allowedRoles = ["Admin", "SuperAdmin"];
      if (!user || !allowedRoles.includes(user.rol)) {
        router.replace("/(tabs)/account");
      }
    }
  }, [user, isLoading]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Verificando acceso...</Text>
      </View>
    );
  }

  // CORRECCIÓN: permitir Admin y SuperAdmin
  const allowedRoles = ["Admin", "SuperAdmin"];
  if (!user || !allowedRoles.includes(user.rol)) {
    return null;
  }

  // Si es admin, mostrar el panel
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a1a1a",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Panel Admin",
          headerLeft: () => (
            <FontAwesome
              name="arrow-left"
              size={20}
              color="#fff"
              style={{ marginLeft: 15 }}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="users/index"
        options={{
          title: "Usuarios",
        }}
      />
      <Stack.Screen
        name="users/[id]"
        options={{
          title: "Detalle Usuario",
        }}
      />
      <Stack.Screen
        name="reviews/index"
        options={{
          title: "Moderar Reseñas",
        }}
      />
      <Stack.Screen
        name="reviews/[id]"
        options={{
          title: "Detalle Reseña",
        }}
      />
      <Stack.Screen
        name="services/index"
        options={{
          title: "Servicios",
        }}
      />
      <Stack.Screen
        name="services/[id]"
        options={{
          title: "Detalle Servicio",
        }}
      />
      <Stack.Screen
        name="categories/index"
        options={{
          title: "Categorías",
        }}
      />
      <Stack.Screen
        name="coupons/index"
        options={{
          title: "Cupones",
        }}
      />
      <Stack.Screen
        name="reports/index"
        options={{
          title: "Reportes",
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          title: "Configuración",
        }}
      />
    </Stack>
  );
}