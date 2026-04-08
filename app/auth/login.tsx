// app/auth/login.tsx
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import LoginForm from "../../components/forms/LoginForm";

export default function LoginScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER / HERO */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>S</Text>
        </View>
        <Text style={styles.title}>SMarket</Text>
        <Text style={styles.subtitle}>
          Tu marketplace de servicios.
        </Text>
      </View>

      {/* FORMULARIO DE LOGIN EN CARD */}
      <LoginForm />

      {/* ENLACE A REGISTRO */}
      <View style={styles.registerRow}>
        <Text style={styles.registerText}>¿Aún no tienes cuenta?</Text>
        <Text
          style={styles.registerLink}
          onPress={() => router.push("/auth/register")}
        >
          Regístrate
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1E1240",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#14B8A6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },

  logoLetter: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.82)",
    marginTop: 6,
    textAlign: "center",
  },

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 6,
    flexWrap: "wrap",
  },

  registerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.72)",
  },

  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#65f7f7",
    marginLeft: 4,
  },
});