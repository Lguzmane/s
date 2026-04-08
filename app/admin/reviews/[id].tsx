//app/admin/reviews/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Href } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../../context/AuthContext";
import { adminService } from "../../../services/adminService";

type ReviewDetail = {
  id: number;
  calificacion: number;
  comentario?: string;
  createdAt: string;
  cliente: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    email: string;
    fotoPerfil?: string;
  };
  profesional: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    email: string;
    rating: number;
    cantidadOpiniones: number;
  };
  servicio: {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    duracionMin: number;
  };
};

export default function AdminReviewDetail() {
  const { id } = useLocalSearchParams();
  const reviewId = parseInt(id as string);
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReviewDetail();
  }, [reviewId]);

  const loadReviewDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReviewById(reviewId);

      if (response?.success && response.data) {
        setReview(response.data);
      } else {
        setReview(null);
      }
    } catch (error) {
      console.error("Error cargando reseña:", error);
      Alert.alert("Error", "No se pudo cargar la información de la reseña");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReason.trim()) {
      Alert.alert("Error", "Debes especificar un motivo");
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deleteReview(reviewId, deleteReason);
      setShowDeleteModal(false);
      Alert.alert("Éxito", "Reseña eliminada correctamente");
      router.back();
    } catch (error) {
      console.error("Error eliminando reseña:", error);
      Alert.alert("Error", "No se pudo eliminar la reseña");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  const goToUserDetail = (userId: number) => {
    router.push(`/admin/users/${userId}` as Href);
  };

  const goToServiceDetail = (serviceId: number) => {
    router.push(`/admin/services/${serviceId}` as Href);
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando reseña...</Text>
      </View>
    );
  }

  if (!review) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <View style={adminStyles.emptyIconWrap}>
          <Ionicons name="alert-circle-outline" size={26} color="#FF4FAF" />
        </View>
        <Text style={adminStyles.loadingText}>Reseña no encontrada</Text>
        <Pressable onPress={() => router.back()} style={adminStyles.searchButton}>
          <Text style={adminStyles.searchButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={adminStyles.screen}
        contentContainerStyle={[adminStyles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={adminStyles.header}>
          <Pressable onPress={() => router.back()} style={adminStyles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={adminStyles.headerTitle}>Detalle de Reseña</Text>
          <View style={adminStyles.headerSpacer} />
        </View>

        <View style={adminStyles.userCard}>
          <View style={adminStyles.userAvatar}>
            <Text style={adminStyles.userAvatarText}>
              {review.cliente.nombre.charAt(0)}
              {review.cliente.apellidoPaterno.charAt(0)}
            </Text>
          </View>
          <View style={adminStyles.userInfo}>
            <View style={adminStyles.userHeader}>
              <Text style={adminStyles.userName}>
                {review.cliente.nombre} {review.cliente.apellidoPaterno}
              </Text>
              <View style={adminStyles.adminReviewCardRating}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Ionicons
                    key={i}
                    name={i <= review.calificacion ? "star" : "star-outline"}
                    size={15}
                    color={i <= review.calificacion ? "#FFB800" : "#D1D5DB"}
                  />
                ))}
              </View>
            </View>
            <Text style={adminStyles.userEmail}>{review.cliente.email}</Text>
            <Text style={adminStyles.userEmail}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => goToServiceDetail(review.servicio.id)}
          style={adminStyles.userCard}
        >
          <View style={[adminStyles.userAvatar, adminStyles.serviceAvatar]}>
            <Ionicons name="briefcase-outline" size={20} color="#B7FF3C" />
          </View>
          <View style={adminStyles.userInfo}>
            <Text style={adminStyles.userName}>{review.servicio.nombre}</Text>
            <Text style={adminStyles.userEmail} numberOfLines={2}>
              {review.servicio.descripcion || 'Sin descripción'}
            </Text>
            <View style={adminStyles.userStats}>
              <Text style={adminStyles.priceText}>{formatPrice(review.servicio.precio)}</Text>
              <Text style={adminStyles.statText}>• {review.servicio.duracionMin} min</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C4C7D0" />
        </Pressable>

        <Pressable
          onPress={() => goToUserDetail(review.profesional.id)}
          style={adminStyles.userCard}
        >
          <View style={adminStyles.userAvatar}>
            <Text style={adminStyles.userAvatarText}>
              {review.profesional.nombre.charAt(0)}
              {review.profesional.apellidoPaterno.charAt(0)}
            </Text>
          </View>
          <View style={adminStyles.userInfo}>
            <Text style={adminStyles.userName}>
              {review.profesional.nombre} {review.profesional.apellidoPaterno}
            </Text>
            <Text style={adminStyles.userEmail}>{review.profesional.email}</Text>
            <View style={adminStyles.userStats}>
              <Ionicons name="star" size={13} color="#FFB800" />
              <Text style={adminStyles.statText}>
                {review.profesional.rating?.toFixed(1) || '0.0'} ({review.profesional.cantidadOpiniones || 0})
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C4C7D0" />
        </Pressable>

        <View style={adminStyles.commentCard}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIconPink}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FF4FAF" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Comentario</Text>
              <Text style={adminStyles.sectionIntroText}>
                Contenido escrito por la persona que dejó la reseña.
              </Text>
            </View>
          </View>
          <Text style={adminStyles.commentText}>
            "{review.comentario || 'Sin comentario'}"
          </Text>
        </View>

        <View style={adminStyles.quickActionsContainer}>
          <Text style={adminStyles.sectionTitle}>Acciones</Text>
          <View style={adminStyles.quickActionsGrid}>
            <Pressable
              style={adminStyles.quickActionCardDanger}
              onPress={() => setShowDeleteModal(true)}
            >
              <View style={adminStyles.quickActionIconWrapPink}>
                <Ionicons name="trash-outline" size={18} color="#FF4FAF" />
              </View>
              <Text style={adminStyles.quickActionTitle}>Eliminar reseña</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Eliminar reseña</Text>
            <Text style={adminStyles.modalSubtitle}>
              ¿Estás seguro de eliminar esta reseña?
            </Text>

            <TextInput
              style={adminStyles.modalInput}
              placeholder="Motivo de la eliminación"
              placeholderTextColor="#9CA3AF"
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline
              numberOfLines={3}
            />

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[adminStyles.modalConfirmButton, adminStyles.modalConfirmButtonDanger]}
                onPress={handleDeleteReview}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={adminStyles.modalConfirmTextDanger}>Eliminar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const adminStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  searchButton: {
    marginTop: 14,
    backgroundColor: "#B7FF3C",
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  searchButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  emptyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF1F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  header: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    marginBottom: 18,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  headerSpacer: {
    width: 40,
  },

  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  commentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },

  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceAvatar: {
    backgroundColor: "#F4FCE7",
  },

  userAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  userInfo: {
    flex: 1,
  },

  userHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },

  userName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  userEmail: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 6,
  },

  userStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  priceText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
  },

  adminReviewCardRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FFF8E6",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  sectionIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  sectionIntroIconPink: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,79,175,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIntroTextWrap: {
    flex: 1,
  },

  sectionIntroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 3,
  },

  sectionIntroText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
  },

  commentText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#1E1240",
    fontWeight: "600",
  },

  quickActionsContainer: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  quickActionCardDanger: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    minHeight: 88,
  },

  quickActionIconWrapPink: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "rgba(255,79,175,0.12)",
  },

  quickActionTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.34)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 10,
  },

  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    marginBottom: 10,
    textAlignVertical: "top",
    minHeight: 86,
  },

  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: "#FFF1F8",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#B7FF3C",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  modalConfirmButtonDanger: {
    backgroundColor: "#FF4FAF",
  },

  modalConfirmTextDanger: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.1,
  },
});