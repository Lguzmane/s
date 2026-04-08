//app/(tabs)/account/index.tsx
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../../../context/AuthContext";

type Option = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
  route: string;
};

// Opciones públicas (siempre visibles)
const publicOptions: Option[] = [
  { icon: "question-circle", label: "Ayuda", route: "/help" },
  { icon: "file-text", label: "Legal", route: "/legal" },
  { icon: "cog", label: "Configuración", route: "/(tabs)/account/settings" },
];

// Opciones privadas (solo si está logueado)
const privateOptions: Option[] = [
  { icon: "user", label: "Perfil", route: "/(tabs)/account/profile" },
  { icon: "credit-card", label: "Pagos", route: "/(tabs)/account/payments" },
  { icon: "bell", label: "Notificaciones", route: "/(tabs)/account/notifications" },
  { icon: "inbox", label: "Bandeja de entrada", route: "/(tabs)/account/inbox" },
];

export default function AccountScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cuenta</Text>

      {user &&
        privateOptions.map((opt) => (
          <Pressable
            key={opt.label}
            style={styles.optionRow}
            onPress={() => router.push(opt.route as any)}
          >
            <View style={styles.optionLeft}>
              <FontAwesome name={opt.icon} size={20} color="#1E1240" />
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#14B8A6" />
          </Pressable>
        ))}

      {publicOptions.map((opt) => (
        <Pressable
          key={opt.label}
          style={styles.optionRow}
          onPress={() => router.push(opt.route as any)}
        >
          <View style={styles.optionLeft}>
            <FontAwesome name={opt.icon} size={20} color="#1E1240" />
            <Text style={styles.optionLabel}>{opt.label}</Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#14B8A6" />
        </Pressable>
      ))}

      {user && (
        <Pressable style={styles.optionRow} onPress={handleLogout}>
          <View style={styles.optionLeft}>
            <FontAwesome name="sign-out" size={20} color="#d32f2f" />
            <Text style={[styles.optionLabel, { color: "#d32f2f" }]}>
              Cerrar sesión
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#d32f2f" />
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 22,
    letterSpacing: -0.3,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  optionRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 17,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  optionLabel: {
    color: "#1E1240",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});