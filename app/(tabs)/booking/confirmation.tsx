// app/booking/confirmation.tsx
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from "react-native";

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams();
  const {
    servicioNombre,
    fecha,
    hora,
    profesionalNombre,
    precio,
    duracion
  } = params;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>¡Reserva confirmada!</Text>
          <Text style={styles.subtitle}>Tu servicio ha sido agendado exitosamente</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles de la reserva</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Servicio:</Text>
            <Text style={styles.detailValue}>{servicioNombre}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Profesional:</Text>
            <Text style={styles.detailValue}>{profesionalNombre}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>{formatDate(fecha as string)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hora:</Text>
            <Text style={styles.detailValue}>{hora}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duración:</Text>
            <Text style={styles.detailValue}>{duracion} minutos</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Precio:</Text>
            <Text style={styles.detailValue}>${precio}</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={() => router.push("/(tabs)/account/history")}
            style={[styles.button, styles.buttonPrimary]}
          >
            <Text style={styles.buttonPrimaryText}>Ver mis reservas</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)")}
            style={[styles.button, styles.buttonSecondary]}
          >
            <Text style={styles.buttonSecondaryText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#1E1240",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 22,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1240",
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  detailValue: {
    flex: 1.2,
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "right",
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: "#14B8A6",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonSecondaryText: {
    color: "#1E1240",
    fontSize: 16,
    fontWeight: "700",
  },
});