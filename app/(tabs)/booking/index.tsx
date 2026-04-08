//app/booking/index.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import CalendarGrid from "../../../components/profile/CalendarGrid";
import { useCart } from "../../../context/CartContext";
import api from "../../../services/api";
import bookingService from "../../../services/bookingService";

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();

  const [servicio, setServicio] = useState<any | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<
    { id: string; day: string; time: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ========================
  // CARGAR SERVICIO
  // ========================
  useEffect(() => {
    const cargarServicio = async () => {
      try {
        const response = await api.get(`/api/services/${id}`);
        setServicio(response.data.data);
      } catch (err) {
        console.error("Error al cargar servicio:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarServicio();
  }, [id]);

  // ========================
  // OBTENER FECHA
  // ========================
  const getReservaDate = () => {
    if (selectedBlocks.length === 0) return null;

    const block = selectedBlocks[0];
    const [hour, minute] = block.time.split(":");

    const fecha = new Date(
      `${block.day}T${hour.padStart(2, "0")}:${minute}:00`
    );

    return isNaN(fecha.getTime()) ? null : fecha;
  };

  // ========================
  // CREAR RESERVA
  // ========================
  const handleConfirmarReserva = async () => {
    const fecha = getReservaDate();

    if (!fecha) {
      Alert.alert("Error", "Selecciona un horario válido");
      return;
    }

    if (!servicio?.id) {
      Alert.alert("Error", "No se encontró el servicio");
      return;
    }

    if (selectedBlocks.length === 0) {
      Alert.alert("Error", "Debes seleccionar un horario");
      return;
    }

    setLoading(true);

    try {
      const block = selectedBlocks[0];

      const result = await bookingService.create({
        servicioId: servicio.id,
        fecha: block.day,
        hora: block.time
      });

      const reserva = result.data;

      const itemCarrito = {
        id: reserva.id,
        bookingId: reserva.id,
        servicioId: reserva.servicio.id,
        nombre: reserva.servicio.nombre,
        profesionalId: reserva.profesional.id,
        profesionalNombre: `${reserva.profesional.nombre} ${reserva.profesional.apellidoPaterno}`,
        fecha: reserva.fechaHora,
        duracion: reserva.servicio.duracionMin,
        precio: reserva.servicio.precio,
        imagen: servicio.fotos?.[0]?.imagenUrl || null
      };

      addToCart(itemCarrito);

      router.push("/(tabs)/cart");
    } catch (err: any) {
      console.error("Error al crear reserva:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || err?.message || "No se pudo confirmar la reserva"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // SELECCIÓN DE BLOQUES
  // ========================
  const handleBlockSelect = (day: string, time: string) => {
    if (!servicio) return;

    const [hour, minute] = time.split(":").map(Number);
    const blocksNeeded = Math.ceil(servicio.duracionMin / 30);

    const newSelected: {
      id: string;
      day: string;
      time: string;
    }[] = [];

    for (let i = 0; i < blocksNeeded; i++) {
      const totalMinutes = minute + i * 30;
      const blockHour = hour + Math.floor(totalMinutes / 60);
      const blockMinute = totalMinutes % 60;

      const blockTime = `${blockHour}:${blockMinute
        .toString()
        .padStart(2, "0")}`;

      newSelected.push({
        id: `${day}-${blockTime}`,
        day,
        time: blockTime
      });
    }

    setSelectedBlocks(newSelected);
  };

  // ========================
  // LOADING
  // ========================
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#1E1240" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!servicio) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.emptyText}>
          No se pudo cargar el servicio.
        </Text>
      </View>
    );
  }

  const profesional = servicio.profesional
    ? `${servicio.profesional.nombre} ${servicio.profesional.apellidoPaterno}`
    : "Profesional";

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.screen}>
      <Text style={styles.title}>Agendar Hora</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryRow}>
          Profesional:{" "}
          <Text style={styles.summaryValue}>{profesional}</Text>
        </Text>

        <Text style={styles.summaryRow}>
          Servicio:{" "}
          <Text style={styles.summaryValue}>{servicio.nombre}</Text>
        </Text>

        <Text style={styles.summaryRow}>
          Duración:{" "}
          <Text style={styles.summaryValue}>
            {servicio.duracionMin} minutos
          </Text>
        </Text>

        <Text style={styles.summaryRow}>
          Precio:{" "}
          <Text style={styles.summaryValue}>${servicio.precio}</Text>
        </Text>
      </View>

      <CalendarGrid
        profesionalId={servicio.profesional.id}
        onBlockSelect={handleBlockSelect}
        selectedBlocks={selectedBlocks}
      />

      <Pressable
        onPress={handleConfirmarReserva}
        disabled={loading || selectedBlocks.length === 0}
        style={[
          styles.confirmBtn,
          (loading || selectedBlocks.length === 0) &&
            styles.confirmBtnDisabled
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.confirmBtnLabel}>
            Confirmar Reserva
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Loading / estados
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  centerScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    textAlign: "center",
    paddingHorizontal: 16,
  },

  // Título
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1240",
    marginBottom: 16,
  },

  // Resumen servicio
  summaryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#65F7F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: "400",
    color: "#6B7280",
  },

  // Botón confirmar
  confirmBtn: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  confirmBtnDisabled: {
    backgroundColor: "#6B7280",
    borderColor: "#6B7280",
  },
  confirmBtnLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});