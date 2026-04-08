// app/profile/requests.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../../../../context/AuthContext";
import { bookingService } from "../../../../services/bookingService";
import api from "../../../../services/api";

type PendingRequest = {
  id: number | string;
  cliente_nombre?: string;
  servicio_nombre?: string;
  fecha?: string;
  hora?: string;
  precio?: number;
};

export default function RequestsScreen() {
  const { user } = useContext(AuthContext) as any;
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/bookings/my-bookings", {
        params: { tipo: "profesional" },
      });

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        setRequests([]);
        return;
      }

      const pendientes = response.data.data.filter((item: any) => {
        return item.estado === "pendiente";
      });

      const transformedRequests = pendientes.map((item: any) => ({
        id: item.id,
        cliente_nombre: item.cliente
          ? `${item.cliente.nombre || ""} ${item.cliente.apellidoPaterno || ""}`.trim()
          : "Cliente",
        servicio_nombre: item.servicio?.nombre || "Servicio",
        fecha: item.fechaHora,
        hora: item.fechaHora
          ? new Date(item.fechaHora).toTimeString().slice(0, 5)
          : "",
        precio: item.monto || item.precio,
      }));

      setRequests(transformedRequests);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      Alert.alert("Error", "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const confirmRequest = async (requestId: string | number) => {
    Alert.alert(
      "Confirmar solicitud",
      "¿Estás seguro de confirmar esta reserva?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              // Endpoint correcto: PUT /api/bookings/:id/status { estado: "confirmada" }
              await bookingService.updateStatus(requestId.toString(), "confirmada");
              Alert.alert("Éxito", "Solicitud confirmada");
              await cargarSolicitudes();
            } catch (error) {
              Alert.alert("Error", "No se pudo confirmar la solicitud");
            }
          },
        },
      ]
    );
  };

  const rejectRequest = async (requestId: string | number) => {
    Alert.alert(
      "Rechazar solicitud",
      "¿Estás seguro de rechazar esta reserva?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            try {
              // Endpoint correcto: PUT /api/bookings/:id/status { estado: "cancelada" }
              await bookingService.updateStatus(requestId.toString(), "cancelada");
              Alert.alert("Éxito", "Solicitud rechazada");
              await cargarSolicitudes();
            } catch (error) {
              Alert.alert("Error", "No se pudo rechazar la solicitud");
            }
          },
        },
      ]
    );
  };

  const fmtFecha = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E1240" />
          </Pressable>
          <Text style={styles.title}>Solicitudes pendientes</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Cargando solicitudes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E1240" />
        </Pressable>
        <Text style={styles.title}>Solicitudes pendientes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No hay solicitudes pendientes</Text>
            <Text style={styles.emptyText}>
              Cuando los clientes reserven tus servicios, aparecerán aquí para que puedas confirmarlas.
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestContent}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.clientName}>
                      {request.cliente_nombre || "Cliente"}
                    </Text>
                    <Text style={styles.serviceName}>
                      {request.servicio_nombre || "Servicio"}
                    </Text>
                  </View>

                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {fmtFecha(request.fecha)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {request.hora || "Horario no especificado"}
                      </Text>
                    </View>

                    {request.precio && (
                      <View style={styles.detailRow}>
                        <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          ${request.precio.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.buttonsContainer}>
                  <Pressable
                    onPress={() => rejectRequest(request.id)}
                    style={[styles.button, styles.rejectButton]}
                  >
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => confirmRequest(request.id)}
                    style={[styles.button, styles.confirmButton]}
                  >
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#65F7F7",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1240",
    marginLeft: 16,
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  requestsList: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#65F7F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 100,
  },
  requestContent: {
    flex: 1,
    marginRight: 12,
  },
  requestHeader: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
    color: "#6B7280",
  },
  requestDetails: {
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 6,
  },
  buttonsContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  rejectButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  confirmButton: {
    backgroundColor: "#1E1240",
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F59E0B",
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});