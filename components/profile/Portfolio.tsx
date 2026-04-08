// components/profile/Portfolio.tsx
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import portfolioService, { PortfolioItem } from "../../services/portfolioService";

type Props = {
  profesionalId: number | string;
  isEditing?: boolean;
  limit?: number;
};

const DEFAULT_IMG = "https://via.placeholder.com/200.png?text=Sin+imagen";

export default function Portfolio({ profesionalId, isEditing = false, limit = 3 }: Props) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, [profesionalId]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);

      const id = Number(profesionalId);
      if (!id) {
        setItems([]);
        return;
      }

      const data = await portfolioService.getPortfolio(id);
      setItems(data);
    } catch (error) {
      console.error("Error cargando portafolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const fotos: string[] = items
    .sort((a, b) => b.orden - a.orden)
    .slice(0, limit)
    .map(item => item.imagenUrl);

  const tripleta = [...fotos];
  while (tripleta.length < 3) tripleta.push("");

  const handleNavigateToFullPortfolio = () => {
    router.push("/(tabs)/account/portfolio");
  };

  const handleAddPhoto = () => {
    router.push("/(tabs)/account/portfolio");
  };

  const handleReorder = () => {
    router.push("/(tabs)/account/portfolio");
  };

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          styles.cardBorder,
          styles.cardPadding,
          styles.mbMd,
          styles.loadingBox,
        ]}
      >
        <ActivityIndicator size="small" color="#14B8A6" />
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardBorder, styles.cardPadding, styles.mbMd]}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={styles.title}>Galerías</Text>

        {/* Acciones */}
        <View style={[styles.row, styles.actionsRow]}>
          {isEditing ? (
            <>
              <Pressable
                onPress={handleAddPhoto}
                style={[styles.actionBtn, styles.actionBtnPrimary]}
              >
                <Text style={styles.actionTextOn}>
                  Agregar fotos
                </Text>
              </Pressable>

              <Pressable
                onPress={handleReorder}
                style={[styles.actionBtn, styles.actionBtnPrimary]}
              >
                <Text style={styles.actionTextOn}>
                  Reorganizar
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={handleNavigateToFullPortfolio}
              style={[styles.actionBtn, styles.actionBtnGhost]}
            >
              <Text style={styles.actionTextGhost}>
                Ver todo
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Carrusel simple horizontal */}
      {fotos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          style={styles.carousel}
        >
          {tripleta.map((src, i) => (
            <Image
              key={i}
              source={{ uri: src || DEFAULT_IMG }}
              style={[styles.thumb, !src && styles.emptyThumb]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.carousel, styles.emptyState]}>
          <Text style={styles.emptyText}>
            {isEditing
              ? "Aún no has agregado fotos a tu portafolio"
              : "Este profesional aún no tiene fotos en su portafolio"}
          </Text>
        </View>
      )}

      {/* Controles estilo "<" ">" (solo si hay fotos) */}
      {fotos.length > 0 && (
        <View style={[styles.row, styles.controlsRow]}>
          <Pressable onPress={() => {}} style={styles.ctrlBtn}>
            <Text style={styles.ctrlText}>‹</Text>
          </Pressable>
          <Pressable onPress={() => {}} style={styles.ctrlBtn}>
            <Text style={styles.ctrlText}>›</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
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

  cardPadding: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  mbMd: {
    marginBottom: 16,
  },

  loadingBox: {
    minHeight: 170,
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerRow: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.3,
  },

  actionsRow: {
    gap: 8,
  },

  actionBtn: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  actionBtnPrimary: {
    backgroundColor: "#14B8A6",
  },

  actionBtnGhost: {
    backgroundColor: "rgba(20, 184, 166, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.18)",
  },

  actionTextOn: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
  },

  actionTextGhost: {
    fontSize: 12,
    fontWeight: "800",
    color: "#14B8A6",
    letterSpacing: -0.2,
  },

  carousel: {
    marginHorizontal: -2,
  },

  carouselContent: {
    paddingHorizontal: 2,
    gap: 10,
  },

  thumb: {
    width: 104,
    height: 104,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.06)",
  },

  emptyThumb: {
    opacity: 0.28,
  },

  emptyState: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.05)",
  },

  emptyText: {
    color: "rgba(30, 18, 64, 0.56)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },

  controlsRow: {
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },

  ctrlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  ctrlText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "700",
    color: "#1E1240",
    marginTop: -2,
  },
});