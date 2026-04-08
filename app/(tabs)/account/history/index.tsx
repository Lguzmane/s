//app/(tabs)/account/history/index.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import HistoryItem from "../../../../components/profile/HistoryItem";
import api from "../../../../services/api";

interface BookingItem {
  id: string | number;
  servicio?: {
    nombre: string;
  };
  profesional?: {
    nombre: string;
    apellidoPaterno?: string;
  };
  fechaHora: string;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  monto?: number;
  reviewDetalle?: any;
}

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/bookings/my-bookings", {
        params: { tipo: "cliente" },
      });

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        setBookings([]);
        return;
      }

      setBookings(response.data.data);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatBookingsForHistory = (bookings: BookingItem[]) => {
    return bookings.map((booking) => ({
      bookingId: booking.id,
      nombreServicio: booking.servicio?.nombre || "Servicio",
      contraparte: booking.profesional
        ? `${booking.profesional.nombre} ${
            booking.profesional.apellidoPaterno || ""
          }`.trim()
        : "Profesional",
      rol: "cliente" as const,
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
          <Text style={styles.title}>Historial</Text>
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
          <Text style={styles.title}>Historial</Text>
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
        <Text style={styles.title}>Historial</Text>

        {hasItems ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {historial.map((item) => (
              <HistoryItem key={item.bookingId} item={item} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.stateBox}>
            <Text style={styles.emptyText}>
              Aún no tienes reservas registradas.
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
});