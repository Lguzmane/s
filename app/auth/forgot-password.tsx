// app/auth/forgot-password.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authService } from "../../services/authService";
import { theme } from "../../styles/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✔ Te enviamos un correo con instrucciones para recuperar tu contraseña.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.button, loading ? styles.buttonDisabled : styles.buttonPrimary]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Enviar enlace</Text>
              )}
            </Pressable>
          </>
        )}
      </View>

      {/* BACK LINK */}
      <View style={styles.backRow}>
        <Text style={styles.backText}>¿Ya recordaste tu contraseña?</Text>
        <Text
          style={styles.backLink}
          onPress={() => router.replace("/auth/login")}
        >
          Volver
        </Text>
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
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  errorBox: {
    backgroundColor: "rgba(211, 47, 47, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(211, 47, 47, 0.18)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  successBox: {
    backgroundColor: "rgba(20, 184, 166, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.18)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  successText: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },

  input: {
    backgroundColor: "#FFFFFF",
    color: "#1E1240",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.10)",
    marginBottom: 14,
  },

  button: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },

  buttonPrimary: {
    backgroundColor: "#14B8A6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },

  buttonDisabled: {
    backgroundColor: "rgba(20, 184, 166, 0.55)",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 6,
    flexWrap: "wrap",
  },

  backText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },

  backLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14B8A6",
    marginLeft: 4,
  },
});