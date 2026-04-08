//app/auth/register.tsx 
import { Link } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RegisterForm from "../../components/forms/RegisterForm";

export default function RegisterScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Registrarse</Text>
        <Text style={styles.subtitle}>Crea tu cuenta para comenzar</Text>
      </View>

      <RegisterForm />

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>¿Ya tienes cuenta? </Text>
        <Link href="/auth/login" asChild>
          <Pressable>
            <Text style={styles.registerLink}>Inicia sesión aquí</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
  },

  header: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -20,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.82)",
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
    color: "#6B7280",
  },

  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14B8A6",
  },
});