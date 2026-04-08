//app/admin/reviews/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
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

type Review = {
  id: number;
  calificacion: number;
  comentario?: string;
  createdAt: string;
  cliente: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
  };
  profesional: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
  };
  servicio: {
    id: number;
    nombre: string;
  };
  reportCount?: number;
  reportReason?: string;
};

type Filters = {
  search: string;
  minRating: string;
};

export default function AdminReviews() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    minRating: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReportedReviews();
      const reviewsData = Array.isArray(response) ? response : response.data || [];
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error cargando reseñas:", error);
      Alert.alert("Error", "No se pudieron cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = reviews.filter(review => {
      if (
        filters.search &&
        !review.comentario?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !review.cliente.nombre.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.minRating && review.calificacion < parseInt(filters.minRating)) {
        return false;
      }
      return true;
    });
    setReviews(filtered);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", minRating: "" });
    setShowFilters(false);
    loadReviews();
  };

  const openDeleteModal = (review: Review) => {
    setSelectedReview(review);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    if (!deleteReason.trim()) {
      Alert.alert("Error", "Debes especificar un motivo");
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deleteReview(selectedReview.id, deleteReason);
      setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
      setShowDeleteModal(false);
      Alert.alert("Éxito", "Reseña eliminada");
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

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#FFB800" : "#D1D5DB"}
        />
      );
    }
    return stars;
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
        <Text style={adminStyles.loadingText}>Cargando reseñas...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={adminStyles.screen}
        contentContainerStyle={[adminStyles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={adminStyles.header}>
          <Pressable onPress={() => router.back()} style={adminStyles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={adminStyles.headerTitle}>Reseñas Reportadas</Text>
          <Pressable onPress={() => setShowFilters(!showFilters)} style={adminStyles.filterButton}>
            <Ionicons
              name={showFilters ? "close" : "options-outline"}
              size={22}
              color={showFilters ? "#FF4FAF" : "#B7FF3C"}
            />
          </Pressable>
        </View>

        <View style={adminStyles.searchContainer}>
          <View style={adminStyles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={adminStyles.searchInput}
              placeholder="Buscar en comentarios..."
              placeholderTextColor="#9CA3AF"
              value={filters.search}
              onChangeText={(text) => handleFilterChange('search', text)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {filters.search !== "" && (
              <Pressable onPress={() => {
                handleFilterChange('search', '');
                handleSearch();
              }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
          <Pressable onPress={handleSearch} style={adminStyles.searchButton}>
            <Text style={adminStyles.searchButtonText}>Buscar</Text>
          </Pressable>
        </View>

        {showFilters && (
          <View style={adminStyles.filtersContainer}>
            <Text style={adminStyles.filterLabel}>Calificación mínima</Text>

            <View style={adminStyles.filterOptions}>
              <Pressable
                onPress={() => handleFilterChange('minRating', '')}
                style={[adminStyles.filterChip, filters.minRating === '' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.minRating === '' && adminStyles.filterChipTextActive]}>
                  Todas
                </Text>
              </Pressable>

              {[1, 2, 3, 4].map(rating => (
                <Pressable
                  key={rating}
                  onPress={() => handleFilterChange('minRating', rating.toString())}
                  style={[adminStyles.filterChip, filters.minRating === rating.toString() && adminStyles.filterChipPinkActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.minRating === rating.toString() && adminStyles.filterChipPinkTextActive]}>
                    {rating}+ ⭐
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={adminStyles.filterActions}>
              <Pressable onPress={clearFilters} style={adminStyles.clearFiltersButton}>
                <Text style={adminStyles.clearFiltersText}>Limpiar filtros</Text>
              </Pressable>
              <Pressable onPress={handleSearch} style={adminStyles.applyFiltersButton}>
                <Text style={adminStyles.applyFiltersText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={adminStyles.resultsCount}>
          <Text style={adminStyles.resultsCountText}>
            {reviews.length} reseñas encontradas
          </Text>
          <Pressable onPress={loadReviews} style={adminStyles.refreshButton}>
            <Ionicons name="refresh" size={16} color="#FF4FAF" />
          </Pressable>
        </View>

        <View style={adminStyles.adminReviewsList}>
          {reviews.length === 0 ? (
            <View style={adminStyles.adminEmptyState}>
              <View style={adminStyles.emptyIconWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={26} color="#B7FF3C" />
              </View>
              <Text style={adminStyles.adminEmptyStateText}>No hay reseñas reportadas</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <Pressable
                key={review.id}
                onPress={() => goToUserDetail(review.cliente.id)}
                style={adminStyles.adminReviewCard}
              >
                <View style={adminStyles.adminReviewCardHeader}>
                  <View style={adminStyles.adminReviewCardUser}>
                    <View style={adminStyles.adminReviewCardAvatar}>
                      <Text style={adminStyles.adminReviewCardAvatarText}>
                        {review.cliente.nombre.charAt(0)}
                        {review.cliente.apellidoPaterno.charAt(0)}
                      </Text>
                    </View>
                    <View style={adminStyles.adminReviewCardUserText}>
                      <Text style={adminStyles.adminReviewCardUserName}>
                        {review.cliente.nombre} {review.cliente.apellidoPaterno}
                      </Text>
                      <Text style={adminStyles.adminReviewCardDate}>
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={adminStyles.adminReviewCardRating}>
                    {getRatingStars(review.calificacion)}
                  </View>
                </View>

                <Pressable
                  onPress={() => goToServiceDetail(review.servicio.id)}
                  style={adminStyles.infoPill}
                >
                  <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
                  <Text style={adminStyles.infoPillText}>
                    {review.servicio.nombre}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => goToUserDetail(review.profesional.id)}
                  style={adminStyles.infoPill}
                >
                  <Ionicons name="person-outline" size={13} color="#6B7280" />
                  <Text style={adminStyles.infoPillText}>
                    {review.profesional.nombre} {review.profesional.apellidoPaterno}
                  </Text>
                </Pressable>

                <Text style={adminStyles.adminReviewCardComment} numberOfLines={3}>
                  "{review.comentario || 'Sin comentario'}"
                </Text>

                <View style={adminStyles.adminReviewCardFooter}>
                  <View style={adminStyles.reportBadge}>
                    <Ionicons name="flag" size={13} color="#FF4FAF" />
                    <Text style={adminStyles.adminReviewCardReportText}>
                      {review.reportCount || 1} reporte(s)
                    </Text>
                  </View>

                  <Pressable
                    style={adminStyles.adminReviewCardDelete}
                    onPress={() => openDeleteModal(review)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF4FAF" />
                  </Pressable>
                </View>
              </Pressable>
            ))
          )}
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

  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  searchBar: {
    flex: 1,
    minHeight: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
    marginLeft: 8,
    marginRight: 8,
  },

  searchButton: {
    backgroundColor: "#B7FF3C",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  searchButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  filtersContainer: {
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
    marginBottom: 14,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 8,
  },

  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  filterChip: {
    minHeight: 38,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(183, 255, 60, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  filterChipActive: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.36)",
  },

  filterChipPinkActive: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  filterChipTextActive: {
    color: "#1E1240",
  },

  filterChipPinkTextActive: {
    color: "#A61E6E",
  },

  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  clearFiltersButton: {
    flex: 1,
    backgroundColor: "#FFF1F8",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  clearFiltersText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  applyFiltersButton: {
    flex: 1,
    backgroundColor: "#B7FF3C",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  applyFiltersText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  resultsCount: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsCountText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  refreshButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F8",
    borderWidth: 1,
    borderColor: "rgba(255, 79, 175, 0.16)",
  },

  adminReviewsList: {
    gap: 10,
  },

  adminEmptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  emptyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  adminEmptyStateText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
  },

  adminReviewCard: {
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
    marginBottom: 10,
  },

  adminReviewCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  adminReviewCardUser: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  adminReviewCardUserText: {
    flex: 1,
  },

  adminReviewCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  adminReviewCardAvatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  adminReviewCardUserName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 2,
  },

  adminReviewCardDate: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
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

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    alignSelf: "flex-start",
  },

  infoPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  adminReviewCardComment: {
    fontSize: 13,
    lineHeight: 19,
    color: "#1E1240",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 12,
  },

  adminReviewCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  reportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1F8",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  adminReviewCardReportText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  adminReviewCardDelete: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F8",
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