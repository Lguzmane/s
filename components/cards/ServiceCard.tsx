// components/cards/ServiceCard.tsx
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import RatingStars from "../ui/RatingStars";
import { Ionicons } from "@expo/vector-icons";

// Tipos
export type Service = {
  id?: string | number;
  imagen?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number | string;
  duracion?: number | string;
  rating?: number;
};

type Props = {
  service?: Service;
  compact?: boolean;
  variant?: "default" | "profile" | "home";
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
};

// Utils
export const isHttpUrl = (src?: string): boolean => {
  return !!src && /^https?:\/\//i.test(src);
};

export const formatCLP = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "Consultar";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);

  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString("es-CL")}`;
  }
};

export const formatDuration = (duracion?: number | string): string => {
  if (duracion === undefined || duracion === null || duracion === "") return "N/A";
  const n = Number(duracion);
  return Number.isFinite(n) ? `${n} min` : String(duracion);
};

// Imagen
const ServiceImage = ({
  imageUrl,
  name,
  compact = false
}: {
  imageUrl?: string;
  name: string;
  compact?: boolean;
}) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  let finalImageUrl = "";

  if (imageUrl) {
    if (isHttpUrl(imageUrl)) {
      finalImageUrl = imageUrl;
    } else if (imageUrl.startsWith("/")) {
      finalImageUrl = `${API_URL}${imageUrl}`;
    }
  }

  const hasImage = !!finalImageUrl;

  if (hasImage) {
    return (
      <Image
        source={{ uri: finalImageUrl }}
        style={compact ? styles.imageCompact : styles.image}
        resizeMode="cover"
      />
    );
  }

  return (
    <Image
      source={
        compact
          ? require("../../assets/images/servicedefaultcompact.png")
          : require("../../assets/images/servicedefault.png")
      }
      style={compact ? styles.imageCompact : styles.image}
      resizeMode="cover"
    />
  );
};

// Componente principal
export default function ServiceCard({
  service,
  compact = false,
  variant = "default",
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite
}: Props) {
  if (!service) return null;

  const {
    imagen,
    nombre = "Servicio sin nombre",
    descripcion = "Sin descripción",
    precio,
    duracion,
    rating = 0,
    id
  } = service;

  const precioFmt = useMemo(() => formatCLP(precio), [precio]);
  const duracionFmt = useMemo(() => formatDuration(duracion), [duracion]);
  const disabled = !id;

  const handleFavoritePress = () => {
    if (!id || !onToggleFavorite) return;
    onToggleFavorite(String(id));
  };

  // =========================
  // COMPACT (HOME)
  // =========================
  if (compact) {
    const content = (
      <View style={[styles.card, styles.cardBorder, styles.cardOverflow, styles.cardCompact]}>
        <View style={[styles.row, styles.cardPaddingCompact]}>
          <ServiceImage imageUrl={imagen} name={nombre} compact />

          <View style={styles.flex1}>
            <Text style={styles.titleCompact} numberOfLines={2}>
              {nombre}
            </Text>

            <View style={styles.ratingRowCompact}>
              <RatingStars rating={Number(rating) || 0} size={13} />
            </View>

            <Text style={styles.metaTextCompact} numberOfLines={1}>
              {precioFmt}
            </Text>

            <Text style={styles.metaSubCompact} numberOfLines={1}>
              {duracionFmt}
            </Text>
          </View>

          {showFavorite && (
            <Pressable
              onPress={handleFavoritePress}
              style={styles.favoriteCompact}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? "#EF4444" : "#6B7280"}
              />
            </Pressable>
          )}
        </View>
      </View>
    );

    if (disabled) return content;

    return (
      <Link
        asChild
        href={{ pathname: "/service/[id]", params: { id: String(id) } }}
      >
        <Pressable>{content}</Pressable>
      </Link>
    );
  }

  // =========================
  // NORMAL
  // =========================
  const renderButton = () => {
    if (variant === "profile") {
      return (
        <Link
          asChild
          href={{ pathname: "/service/[id]", params: { id: String(id) } }}
        >
          <Pressable style={styles.buttonEdit}>
            <Text style={styles.buttonEditText}>Editar servicio</Text>
          </Pressable>
        </Link>
      );
    }

    if (disabled) {
      return (
        <View style={[styles.button, styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Ver detalles</Text>
        </View>
      );
    }

    return (
      <Link
        asChild
        href={{ pathname: "/service/[id]", params: { id: String(id) } }}
      >
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Ver detalles</Text>
        </Pressable>
      </Link>
    );
  };

  return (
    <View style={[styles.card, styles.cardBorder, styles.cardOverflow]}>
      <ServiceImage imageUrl={imagen} name={nombre} />

      <View style={styles.cardPadding}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, styles.titleFlex]} numberOfLines={2}>
            {nombre}
          </Text>

          {showFavorite && (
            <Pressable onPress={handleFavoritePress} style={styles.favoriteNormal}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#EF4444" : "#6B7280"}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.ratingRow}>
          <RatingStars rating={Number(rating) || 0} size={14} />
        </View>

        {!!descripcion && (
          <Text style={styles.description} numberOfLines={3}>
            {descripcion}
          </Text>
        )}

        <View style={styles.metaBlock}>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Precio: </Text>
            {precioFmt}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Duración: </Text>
            {duracionFmt}
          </Text>
        </View>

        {renderButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  cardBorder: {
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.06)",
  },

  cardOverflow: {
    overflow: "hidden",
  },

  cardPadding: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },

  cardPaddingCompact: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  cardCompact: {
    width: 124,
    minHeight: 156,
    borderRadius: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },

  flex1: {
    flex: 1,
    alignItems: "center",
    marginTop: 8,
  },

  titleFlex: {
    flex: 1,
  },

  metaBlock: {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 2,
    marginTop: 2,
  },

  ratingRow: {
    marginTop: -2,
    marginBottom: 0,
  },

  ratingRowCompact: {
    marginTop: 4,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 148,
    backgroundColor: "#E5E7EB",
  },

  imageCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    borderWidth: 2,
    borderColor: "rgba(20, 184, 166, 0.14)",
  },

  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 12,
    color: "#1E1240",
    opacity: 0.7,
  },

  title: {
    color: "#1E1240",
    marginBottom: 0,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    letterSpacing: -0.25,
  },

  titleCompact: {
    color: "#1E1240",
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    textAlign: "center",
  },

  description: {
    color: "rgba(30, 18, 64, 0.76)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  metaText: {
    color: "rgba(30, 18, 64, 0.82)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  metaTextCompact: {
    color: "#1E1240",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  metaSubCompact: {
    color: "rgba(30, 18, 64, 0.56)",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },

  metaLabel: {
    color: "#14B8A6",
    fontWeight: "800",
    fontSize: 13,
  },

  favoriteCompact: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 4,
  },

  favoriteNormal: {
    paddingLeft: 6,
    paddingTop: 2,
  },

  button: {
    display: "none",
  },

  buttonEdit: {
    display: "none",
  },

  buttonCompact: {
    display: "none",
  },

  buttonDisabled: {
    display: "none",
  },

  buttonText: {
    display: "none",
  },

  buttonEditText: {
    display: "none",
  },
});