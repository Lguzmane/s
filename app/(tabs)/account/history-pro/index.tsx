// app/(tabs)/history-pro/index.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import HistoryItem from "../../../../components/profile/HistoryItem";
import api from "../../../../services/api";
import { bookingService } from "../../../../services/bookingService";

interface BookingItem {
  id: string | number;
  servicio?: {
    nombre: string;
  };
  cliente?: {
    nombre: string;
    apellidoPaterno?: string;
  };
  fechaHora: string;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  monto?: number;
  reviewDetalle?: any;
}

export default function HistoryProScreen() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionalBookings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/bookings/my-bookings", {
        params: { tipo: "profesional" },
      });

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        setBookings([]);
        return;
      }

      setBookings(response.data.data);
    } catch (err: any) {
      console.error("Error fetching professional bookings:", err);
      setError(err.message || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionalBookings();
  }, []);

  const handleComplete = async (bookingId: string) => {
    Alert.alert(
      "Completar servicio",
      "¿Confirmas que este servicio fue realizado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, completar",
          onPress: async () => {
            try {
              setUpdatingId(bookingId);
              await bookingService.updateStatus(bookingId, "completada");
              await fetchProfessionalBookings();
              Alert.alert("Éxito", "Servicio marcado como completado");
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.message || "No se pudo completar el servicio"
              );
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const formatBookingsForHistory = (bookings: BookingItem[]) => {
    return bookings.map((booking) => ({
      bookingId: booking.id,
      nombreServicio: booking.servicio?.nombre || "Servicio",
      contraparte: booking.cliente
        ? `${booking.cliente.nombre} ${
            booking.cliente.apellidoPaterno || ""
          }`.trim()
        : "Cliente",
      rol: "proveedor" as const,
      fecha: booking.fechaHora,
      estado: booking.estado,
      monto: booking.monto || 0,
      reviewDetalle: booking.reviewDetalle,
    }));
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>Historial como profesional</Text>
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="#14B8A6" />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>Historial como profesional</Text>
          <View style={styles.stateBox}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        </View>
      </View>
    );
  }

  const historial = formatBookingsForHistory(bookings);
  const hasItems = historial.length > 0;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Historial como profesional</Text>

        {hasItems ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {historial.map((item) => (
              <View key={item.bookingId} style={styles.itemWrapper}>
                <HistoryItem item={item} />

                {item.estado === "confirmada" && (
                  <Pressable
                    onPress={() => handleComplete(item.bookingId.toString())}
                    disabled={updatingId === item.bookingId.toString()}
                    style={[
                      styles.completeButton,
                      updatingId === item.bookingId.toString() &&
                        styles.completeButtonDisabled,
                    ]}
                  >
                    {updatingId === item.bookingId.toString() ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.completeButtonText}>
                        Marcar como completado
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.stateBox}>
            <Text style={styles.emptyText}>
              Aún no has realizado servicios como profesional.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 22,
  },

  listContent: {
    paddingBottom: 28,
    gap: 12,
  },

  itemWrapper: {
    marginBottom: 4,
  },

  stateBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    minHeight: 180,
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1E1240",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  completeButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },

  completeButtonDisabled: {
    opacity: 0.6,
  },

  completeButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: -0.1,
  },
});