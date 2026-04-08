// app/auth/reset-password.tsx
import { router, useLocalSearchParams } from "expo-router";
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

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setError("Completa ambos campos.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.resetPassword(token, password, confirm);
      setDone(true);
      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña.");
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
        <Text style={styles.title}>Restablecer Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu nueva contraseña para continuar.
        </Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {done ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✔ ¡Tu contraseña ha sido actualizada!</Text>
          </View>
        ) : (
          <>
            <TextInput
              placeholder="Nueva contraseña"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              placeholder="Confirmar contraseña"
              placeholderTextColor={theme.colors.muted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
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
                <Text style={styles.buttonText}>Restablecer</Text>
              )}
            </Pressable>
          </>
        )}
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
});