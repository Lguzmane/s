import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CalendarGrid from "../../../../components/profile/CalendarGrid";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../services/api";

export default function ScheduleScreen() {
  const { user } = useContext(AuthContext) as any;

  const [selectedBlocks, setSelectedBlocks] = useState<
    { id: string; day: string; time: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBlockSelect = (day: string, time: string) => {
    const blockId = `${day}-${time}`;
    setSelectedBlocks((prev) =>
      prev.some((b) => b.id === blockId)
        ? prev.filter((b) => b.id !== blockId)
        : [...prev, { id: blockId, day, time }]
    );
  };

  // 🔥 convertir bloque → rango
  const buildPayload = (block: { day: string; time: string }) => {
    const horaInicio = new Date(`${block.day}T${block.time}:00`);
    const horaFin = new Date(horaInicio.getTime() + 30 * 60000);

    return {
      fecha: block.day,
      horaInicio: horaInicio.toISOString(),
      horaFin: horaFin.toISOString(),
    };
  };

  // 🔵 BLOQUEAR
  const handleReservar = async () => {
    if (selectedBlocks.length === 0 || loading) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedBlocks.map((block) =>
          api.post("/api/bookings/availability", {
            ...buildPayload(block),
            tipoBloqueo: "manual",
          })
        )
      );

      Alert.alert("✅ Éxito", "Horarios bloqueados");
      setSelectedBlocks([]);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "No se pudo bloquear");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 LIBERAR
  const handleLiberar = async () => {
    if (selectedBlocks.length === 0 || loading) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedBlocks.map((block) =>
          api.delete("/api/bookings/availability", {
            data: buildPayload(block),
          })
        )
      );

      Alert.alert("✅ Éxito", "Horarios liberados");
      setSelectedBlocks([]);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "No se pudo liberar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.screen}>
      <Text style={styles.title}>Gestión de Agenda Profesional</Text>
      <Text style={styles.subtitle}>
        Selecciona bloques para bloquear o liberar
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleReservar}
          disabled={loading || selectedBlocks.length === 0}
          style={[
            styles.actionBtn,
            styles.blockBtn,
            (loading || selectedBlocks.length === 0) && styles.actionBtnDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.actionBtnLabel}>Bloquear</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleLiberar}
          disabled={loading || selectedBlocks.length === 0}
          style={[
            styles.actionBtn,
            styles.freeBtn,
            (loading || selectedBlocks.length === 0) && styles.actionBtnDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.actionBtnLabel}>Liberar</Text>
          )}
        </Pressable>
      </View>

      <CalendarGrid
        key={refreshKey}
        profesionalId={user?.id}
        onBlockSelect={handleBlockSelect}
        selectedBlocks={selectedBlocks}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1240",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginBottom: 16,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  blockBtn: {
    backgroundColor: "#1E1240",
    borderColor: "#1E1240",
  },
  freeBtn: {
    backgroundColor: "#65F7F7",
    borderColor: "#65F7F7",
  },
  actionBtnDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#F9FAFB",
  },
  actionBtnLabel: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#FFFFFF",
  },
});