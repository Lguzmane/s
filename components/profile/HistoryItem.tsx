import React from "react";
import { Image, Text, View, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

type Props = {
  item: {
    bookingId: number | string;  // 🔥 CORRECCIÓN: id → bookingId
    nombreServicio?: string;
    contraparte?: string;
    rol?: "cliente" | "proveedor" | "profesional";
    fecha?: string;
    hora?: string;
    estado?: string;
    foto?: string;
    monto?: number | null;
    reviewDetalle?: any;
  };
};

const profileDefault = require("../../assets/images/profiledefaultphoto.png");

function formatearFechaYHora(fechaStr?: string, hora?: string) {
  if (!fechaStr && !hora) return "Fecha no disponible";

  try {
    const fecha = fechaStr ? new Date(fechaStr) : new Date();
    const base = fecha.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (hora) {
      return `${base} · ${hora}`;
    }

    const horaAuto = fecha.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${base} · ${horaAuto}`;
  } catch {
    return `${fechaStr ?? ""} ${hora ?? ""}`.trim() || "Fecha no disponible";
  }
}

export default function HistoryItem({ item }: Props) {
  const {
    bookingId,  // 🔥 CORRECCIÓN: id → bookingId
    nombreServicio = "Servicio desconocido",
    contraparte = "Sin nombre",
    rol = "cliente",
    fecha,
    hora,
    estado = "completada",
    foto,
    monto = null,
    reviewDetalle,
  } = item || {};

  const puedeDejarReview =
    estado === "completada" && !reviewDetalle;

  const avatarSource = foto ? { uri: foto } : profileDefault;

  return (
    <View style={styles.card}>
      <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />

      <View style={styles.body}>
        <Text style={styles.title}>{nombreServicio}</Text>

        <Text style={styles.text}>
          {rol === "cliente"
            ? `Con: ${contraparte}`
            : `Cliente: ${contraparte}`}
        </Text>

        <Text style={styles.sub}>{formatearFechaYHora(fecha, hora)}</Text>

        <Text style={styles.text}>Estado: {estado}</Text>

        {monto !== null && (
          <Text style={styles.amount}>
            Monto: ${monto.toLocaleString("es-CL")}
          </Text>
        )}

        {reviewDetalle ? (
          <>
            <Text style={styles.text}>
              ⭐ {reviewDetalle.calificacion} / 5
            </Text>
            {reviewDetalle.comentario && (
              <Text style={styles.sub}>
                "{reviewDetalle.comentario}"
              </Text>
            )}
          </>
        ) : puedeDejarReview && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/reviews/create" as any,
                params: { bookingId: bookingId },  // 🔥 CORRECCIÓN: id → bookingId
              })
            }
          >
            <Text style={styles.reviewLink}>Dejar reseña</Text>
          </Pressable>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#65F7F7",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },

  body: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  text: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFF",
  },

  sub: {
    fontSize: 12,
    fontWeight: "400",
    color: "#65F7F7",
  },

  amount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F59E0B",
  },

  reviewLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#65F7F7",
  },
});