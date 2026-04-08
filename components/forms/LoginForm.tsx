import { router } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function LoginForm() {
  const { login, isLoading, error: authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setLocalError("Por favor completa todos los campos.");
      return;
    }
    if (!email.includes("@")) {
      setLocalError("El correo electrónico no es válido.");
      return;
    }

    setLocalError("");

    try {
      await login(email, password);
      router.replace("/(tabs)/home");
    } catch (err) {
      console.error("Error en login:", err);
    }
  };

  return (
    <View style={styles.card}>
      {(localError || authError) && (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{localError || authError}</Text>
        </View>
      )}

      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        style={styles.input}
        returnKeyType="next"
        editable={!isLoading}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#6B7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        style={[styles.input, styles.inputSpacing]}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!isLoading}
      />

      <Pressable
        onPress={handleSubmit}
        disabled={isLoading}
        style={[
          styles.button,
          isLoading ? styles.buttonDisabled : styles.buttonPrimary,
        ]}
        accessibilityRole="button"
      >
        {isLoading ? (
          <ActivityIndicator color="#1E1240" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push("/auth/forgot-password")}
        style={styles.forgotButton}
      >
        <Text style={styles.forgotLabel}>¿Olvidaste tu contraseña?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  errorBox: {
    width: "100%",
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  inputSpacing: {
    marginTop: 8,
    marginBottom: 16,
  },

  button: {
    width: "100%",
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#65F7F7",
  },
  buttonDisabled: {
    backgroundColor: "#65F7F7",
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
    textAlign: "center",
  },

  forgotButton: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  forgotLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#65F7F7",
  },
});