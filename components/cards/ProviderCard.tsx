//components/cards/ProviderCard.tsx
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import RatingStars from "../ui/RatingStars";

type Provider = {
  id: string | number;
  nombre?: string;
  apellidoPaterno?: string;
  foto?: string;
  categoria?: string;
  rating?: number;
  cantidadOpiniones?: number;
  destacado?: boolean;
  ubicacion?: string;
  lugarAtencion?: string[] | string;
  isFavorite?: boolean;
  portafolio?: string[]; // URLs
};

type Props = {
  provider: Provider;
  compact?: boolean;
  onToggleFavorite?: (servicioId: string) => void;
};

function isHttpUrl(src?: string) {
  if (!src) return false;
  return /^https?:\/\//i.test(src);
}

export default function ProviderCard({
  provider,
  compact = false,
  onToggleFavorite,
}: Props) {
  const {
    id,
    nombre = "Proveedor",
    apellidoPaterno = "",
    foto,
    categoria,
    rating = 4,
    cantidadOpiniones = 0,
    destacado,
    ubicacion,
    lugarAtencion,
    isFavorite,
    portafolio = [],
  } = provider;

  // Hasta 3 imágenes de portafolio
  const imgs = [...portafolio].slice(0, 3);
  while (imgs.length < 3) imgs.push("");

  const fullName = `${nombre} ${apellidoPaterno}`.trim();

  const Photo = isHttpUrl(foto) ? (
    <Image source={{ uri: foto! }} style={styles.avatar} resizeMode="cover" />
  ) : (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <Text style={styles.placeholderTiny}>Sin foto</Text>
    </View>
  );

  const PortfolioItem = (src?: string, key?: number) =>
    isHttpUrl(src) ? (
      <Image key={key} source={{ uri: src! }} style={styles.portfolioItem} resizeMode="cover" />
    ) : (
      <View key={key} style={[styles.portfolioItem, styles.portfolioPlaceholder]}>
        <Text style={styles.placeholderTiny}>Sin imagen</Text>
      </View>
    );

  const FavoriteButton = () => (
    <Pressable
      onPress={() => onToggleFavorite?.(String(id))}
      style={styles.favoriteBtn}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <FontAwesome
        name={isFavorite ? "heart" : "heart-o"}
        size={20}
        color={isFavorite ? "#1E1240" : "#6B7280"}
      />
    </Pressable>
  );

  if (compact) {
    // Versión compacta: una imagen de portafolio
    return (
      <View style={[styles.card, styles.cardBorder, styles.cardPadding]}>
        <FavoriteButton />
        <View style={styles.row}>
          {Photo}
          <View style={styles.flex1}>
            <View style={styles.nameRow}>
              {destacado && <Text style={styles.badge}>FIRST CLASS</Text>}
              <Text style={styles.titleCompact}>{fullName}</Text>
            </View>

            {categoria ? <Text style={styles.categoryCompact}>{categoria}</Text> : null}

            <View style={styles.ratingRow}>
              <RatingStars rating={Number(rating)} size={14} />
              <Text style={styles.reviewsText}>({cantidadOpiniones} opiniones)</Text>
            </View>

            <Link asChild href={{ pathname: "/(tabs)/account/profile", params: { userId: String(id) } }}>
              <Pressable style={[styles.button, styles.buttonCompact]}>
                <Text style={styles.buttonText}>Ver Perfil</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.portfolioAside}>{PortfolioItem(imgs[0], 0)}</View>
        </View>
      </View>
    );
  }

  // Versión completa
  return (
    <View style={[styles.card, styles.cardBorder, styles.cardPadding, styles.cardOverflow]}>
      <FavoriteButton />

      <View style={styles.row}>
        {Photo}

        <View style={styles.flex1}>
          <View style={styles.nameRow}>
            {destacado && <Text style={styles.badge}>FIRST CLASS</Text>}
            <Text style={styles.title}>{fullName}</Text>
          </View>

          {categoria ? <Text style={styles.category}>{categoria}</Text> : null}

          <View style={styles.ratingRow}>
            <RatingStars rating={Number(rating)} />
            <Text style={styles.reviewsText}>({cantidadOpiniones} opiniones)</Text>
          </View>

          <Link asChild href={{ pathname: "/(tabs)/account/profile", params: { userId: String(id) } }}>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Ver Perfil</Text>
            </Pressable>
          </Link>

          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>
              Precios desde <Text style={styles.metaBold}>$xxxxx</Text>
            </Text>
            {ubicacion ? <Text style={styles.location}>{ubicacion}</Text> : null}
            <Text style={styles.attentionText}>
              Atiende en:{" "}
              {Array.isArray(lugarAtencion) ? lugarAtencion.join(", ") : lugarAtencion || "No especificado"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.portfolioRow}>{imgs.map((img, i) => PortfolioItem(img, i))}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // CARD
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardBorder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#65F7F7",
  },
  cardOverflow: { overflow: "hidden" },
  cardPadding: {
    padding: 16,
    gap: 8,
  },

  // LAYOUT
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  flex1: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaBlock: {
    gap: 4,
    marginTop: 8,
  },

  // AVATAR
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderTiny: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },

  // TÍTULOS Y TEXTOS
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  titleCompact: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  category: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },
  categoryCompact: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },
  reviewsText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },
  metaText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  metaBold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
  },
  location: {
    fontSize: 12,
    fontWeight: "400",
    color: "#111827",
  },
  attentionText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#111827",
  },

  // BOTÓN VER PERFIL
  button: {
    marginTop: 8,
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonCompact: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // BADGE DESTACADO
  badge: {
    backgroundColor: "#F59E0B",
    color: "#FFFFFF",
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "400",
  },

  // FAVORITE (HEART)
  favoriteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // PORTAFOLIO
  portfolioAside: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
  },
  portfolioRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  portfolioItem: {
    flex: 1,
    height: 84,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  portfolioPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});