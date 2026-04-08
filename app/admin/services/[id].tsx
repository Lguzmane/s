//app/admin/services/[id].tsx
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
  View,
  Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../../context/AuthContext";
import { adminService } from "../../../services/adminService";

type ServiceDetail = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMin: number;
  tipoAtencion: string;
  consideraciones?: string;
  activo: boolean;
  destacado: boolean;
  rating: number;
  contadorReservas: number;
  createdAt: string;
  updatedAt: string;
  profesional: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    email: string;
    telefono?: string;
    rating: number;
  };
  categoria?: {
    id: number;
    nombre: string;
    icono?: string;
  };
  fotos?: {
    id: number;
    imagenUrl: string;
    esPrincipal: boolean;
    orden: number;
  }[];
  reviews?: {
    id: number;
    calificacion: number;
    comentario?: string;
    createdAt: string;
    cliente: {
      id: number;
      nombre: string;
      apellidoPaterno: string;
    };
  }[];
  _count?: {
    reservas: number;
    reviews: number;
  };
};

type TabType = 'info' | 'fotos' | 'resenas' | 'reservas';

export default function AdminServiceDetail() {
  const { id } = useLocalSearchParams();
  const serviceId = parseInt(id as string);
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Estados para modales
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadServiceDetail();
  }, [serviceId]);

  const loadServiceDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getServiceById(serviceId);
      setService(response.data);
    } catch (error) {
      console.error("Error cargando servicio:", error);
      Alert.alert("Error", "No se pudo cargar la información del servicio");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveService = async () => {
    try {
      setActionLoading(true);
      await adminService.updateServiceStatus(serviceId, {
        activo: true,
        motivo: statusReason
      });
      await loadServiceDetail();
      setShowStatusModal(false);
      setStatusReason('');
      Alert.alert("Éxito", "Servicio aprobado correctamente");
    } catch (error) {
      console.error("Error aprobando servicio:", error);
      Alert.alert("Error", "No se pudo aprobar el servicio");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectService = async () => {
    if (!statusReason.trim()) {
      Alert.alert("Error", "Debes especificar un motivo para rechazar");
      return;
    }

    try {
      setActionLoading(true);
      await adminService.updateServiceStatus(serviceId, {
        activo: false,
        motivo: statusReason
      });
      await loadServiceDetail();
      setShowStatusModal(false);
      setStatusReason('');
      Alert.alert("Éxito", "Servicio rechazado");
    } catch (error) {
      console.error("Error rechazando servicio:", error);
      Alert.alert("Error", "No se pudo rechazar el servicio");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    try {
      setActionLoading(true);
      await adminService.updateServiceStatus(serviceId, {
        destacado: !service?.destacado
      });
      await loadServiceDetail();
      Alert.alert(
        "Éxito",
        service?.destacado ? "Destacado removido" : "Servicio destacado"
      );
    } catch (error) {
      console.error("Error cambiando destacado:", error);
      Alert.alert("Error", "No se pudo cambiar el estado destacado");
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

  const goToProfessionalDetail = (professionalId: number) => {
    router.push(`/admin/users/${professionalId}` as Href);
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando servicio...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <View style={adminStyles.emptyIconWrap}>
          <Ionicons name="alert-circle-outline" size={26} color="#FF4FAF" />
        </View>
        <Text style={adminStyles.loadingText}>Servicio no encontrado</Text>
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
          <Text style={adminStyles.headerTitle} numberOfLines={1}>
            {service.nombre}
          </Text>
          <View style={adminStyles.headerSpacer} />
        </View>

        <View style={adminStyles.serviceDetailHeader}>
          <View style={adminStyles.serviceDetailStatus}>
            <View style={[
              adminStyles.serviceDetailStatusBadge,
              service.activo ? adminStyles.serviceDetailStatusActive : adminStyles.serviceDetailStatusInactive
            ]}>
              <Text style={[
                adminStyles.serviceDetailStatusText,
                service.activo ? adminStyles.serviceDetailStatusTextActive : adminStyles.serviceDetailStatusTextInactive
              ]}>
                {service.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            {service.destacado && (
              <View style={adminStyles.badgeFeatured}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={adminStyles.badgeText}>Destacado</Text>
              </View>
            )}
          </View>

          <View style={adminStyles.serviceDetailActions}>
            {!service.activo && (
              <Pressable
                style={[adminStyles.serviceDetailAction, adminStyles.serviceDetailActionApprove]}
                onPress={() => setShowStatusModal(true)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#B7FF3C" />
                <Text style={adminStyles.serviceDetailActionText}>Aprobar</Text>
              </Pressable>
            )}
            {service.activo && (
              <Pressable
                style={[adminStyles.serviceDetailAction, adminStyles.serviceDetailActionReject]}
                onPress={() => setShowStatusModal(true)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#FF4FAF" />
                <Text style={adminStyles.serviceDetailActionText}>Rechazar</Text>
              </Pressable>
            )}
            <Pressable
              style={adminStyles.serviceDetailAction}
              onPress={handleToggleFeatured}
            >
              <Ionicons
                name={service.destacado ? "star-half-outline" : "star-outline"}
                size={18}
                color="#FFB800"
              />
              <Text style={adminStyles.serviceDetailActionText}>
                {service.destacado ? 'Quitar destacado' : 'Destacar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={adminStyles.serviceDetailStats}>
          <View style={adminStyles.serviceDetailStat}>
            <Ionicons name="star" size={18} color="#FFB800" />
            <Text style={adminStyles.serviceDetailStatValue}>
              {service.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={adminStyles.serviceDetailStatLabel}>
              ({service._count?.reviews || 0} reseñas)
            </Text>
          </View>
          <View style={adminStyles.serviceDetailStatDivider} />
          <View style={adminStyles.serviceDetailStat}>
            <Ionicons name="calendar-outline" size={18} color="#B7FF3C" />
            <Text style={adminStyles.serviceDetailStatValue}>
              {service._count?.reservas || 0}
            </Text>
            <Text style={adminStyles.serviceDetailStatLabel}>reservas</Text>
          </View>
          <View style={adminStyles.serviceDetailStatDivider} />
          <View style={adminStyles.serviceDetailStat}>
            <Ionicons name="time-outline" size={18} color="#FF4FAF" />
            <Text style={adminStyles.serviceDetailStatValue}>
              {service.duracionMin}
            </Text>
            <Text style={adminStyles.serviceDetailStatLabel}>min</Text>
          </View>
        </View>

        <Pressable
          style={adminStyles.serviceDetailProfessional}
          onPress={() => goToProfessionalDetail(service.profesional.id)}
        >
          <View style={adminStyles.serviceDetailProfessionalAvatar}>
            <Text style={adminStyles.serviceDetailProfessionalAvatarText}>
              {service.profesional.nombre.charAt(0)}
              {service.profesional.apellidoPaterno.charAt(0)}
            </Text>
          </View>
          <View style={adminStyles.serviceDetailProfessionalInfo}>
            <Text style={adminStyles.serviceDetailProfessionalName}>
              {service.profesional.nombre} {service.profesional.apellidoPaterno}
            </Text>
            <Text style={adminStyles.serviceDetailProfessionalEmail}>
              {service.profesional.email}
            </Text>
            <View style={adminStyles.serviceDetailProfessionalRating}>
              <Ionicons name="star" size={13} color="#FFB800" />
              <Text style={adminStyles.serviceDetailProfessionalRatingText}>
                {service.profesional.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C4C7D0" />
        </Pressable>

        <View style={adminStyles.serviceDetailTabs}>
          <Pressable
            style={[adminStyles.serviceDetailTab, activeTab === 'info' && adminStyles.serviceDetailTabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[adminStyles.serviceDetailTabText, activeTab === 'info' && adminStyles.serviceDetailTabTextActive]}>
              Información
            </Text>
          </Pressable>
          <Pressable
            style={[adminStyles.serviceDetailTab, activeTab === 'fotos' && adminStyles.serviceDetailTabActivePink]}
            onPress={() => setActiveTab('fotos')}
          >
            <Text style={[adminStyles.serviceDetailTabText, activeTab === 'fotos' && adminStyles.serviceDetailTabTextActivePink]}>
              Fotos ({service.fotos?.length || 0})
            </Text>
          </Pressable>
          <Pressable
            style={[adminStyles.serviceDetailTab, activeTab === 'resenas' && adminStyles.serviceDetailTabActive]}
            onPress={() => setActiveTab('resenas')}
          >
            <Text style={[adminStyles.serviceDetailTabText, activeTab === 'resenas' && adminStyles.serviceDetailTabTextActive]}>
              Reseñas
            </Text>
          </Pressable>
        </View>

        <View style={adminStyles.serviceDetailTabContent}>
          {activeTab === 'info' && (
            <View>
              <View style={adminStyles.serviceDetailInfoRow}>
                <Text style={adminStyles.serviceDetailInfoLabel}>Precio:</Text>
                <Text style={adminStyles.serviceDetailInfoValue}>{formatPrice(service.precio)}</Text>
              </View>
              <View style={adminStyles.serviceDetailInfoRow}>
                <Text style={adminStyles.serviceDetailInfoLabel}>Duración:</Text>
                <Text style={adminStyles.serviceDetailInfoValue}>{service.duracionMin} minutos</Text>
              </View>
              <View style={adminStyles.serviceDetailInfoRow}>
                <Text style={adminStyles.serviceDetailInfoLabel}>Tipo atención:</Text>
                <Text style={adminStyles.serviceDetailInfoValue}>{service.tipoAtencion}</Text>
              </View>
              <View style={adminStyles.serviceDetailInfoRow}>
                <Text style={adminStyles.serviceDetailInfoLabel}>Categoría:</Text>
                <Text style={adminStyles.serviceDetailInfoValue}>
                  {service.categoria?.nombre || 'Sin categoría'}
                </Text>
              </View>
              <View style={adminStyles.serviceDetailInfoDivider} />
              <Text style={adminStyles.serviceDetailInfoSubtitle}>Descripción</Text>
              <Text style={adminStyles.serviceDetailInfoDescription}>
                {service.descripcion || 'Sin descripción'}
              </Text>
              {service.consideraciones && (
                <>
                  <Text style={adminStyles.serviceDetailInfoSubtitle}>Consideraciones</Text>
                  <Text style={adminStyles.serviceDetailInfoDescription}>
                    {service.consideraciones}
                  </Text>
                </>
              )}
              <View style={adminStyles.serviceDetailInfoDivider} />
              <Text style={adminStyles.serviceDetailInfoSubtitle}>Fechas</Text>
              <View style={adminStyles.serviceDetailInfoRow}>
                <Text style={adminStyles.serviceDetailInfoLabel}>Creado:</Text>
                <Text style={adminStyles.serviceDetailInfoValue}>{formatDate(service.createdAt)}</Text>
              </View>
              <View style={adminStyles.serviceDetailInfoRow}>
                <Text style={adminStyles.serviceDetailInfoLabel}>Actualizado:</Text>
                <Text style={adminStyles.serviceDetailInfoValue}>{formatDate(service.updatedAt)}</Text>
              </View>
            </View>
          )}

          {activeTab === 'fotos' && (
            <View>
              {service.fotos && service.fotos.length > 0 ? (
                <View style={adminStyles.serviceDetailPhotos}>
                  {service.fotos.map((foto) => (
                    <View key={foto.id} style={adminStyles.serviceDetailPhotoCard}>
                      {foto.imagenUrl ? (
                        <Image source={{ uri: foto.imagenUrl }} style={adminStyles.serviceDetailPhotoImage} />
                      ) : (
                        <View style={adminStyles.serviceDetailPhotoPlaceholder}>
                          <Ionicons name="image" size={36} color="#D1D5DB" />
                        </View>
                      )}
                      {foto.esPrincipal && (
                        <View style={adminStyles.serviceDetailPhotoPrincipal}>
                          <Text style={adminStyles.serviceDetailPhotoPrincipalText}>Principal</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={adminStyles.emptyTab}>
                  <Ionicons name="images-outline" size={42} color="#D1D5DB" />
                  <Text style={adminStyles.emptyTabText}>Sin fotos</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'resenas' && (
            <View>
              {service.reviews && service.reviews.length > 0 ? (
                service.reviews.map((review) => (
                  <View key={review.id} style={adminStyles.serviceDetailReview}>
                    <View style={adminStyles.serviceDetailReviewHeader}>
                      <View style={adminStyles.serviceDetailReviewUser}>
                        <Text style={adminStyles.serviceDetailReviewUserName}>
                          {review.cliente.nombre} {review.cliente.apellidoPaterno}
                        </Text>
                        <Text style={adminStyles.serviceDetailReviewDate}>
                          {formatDate(review.createdAt)}
                        </Text>
                      </View>
                      <View style={adminStyles.serviceDetailReviewRating}>
                        <Ionicons name="star" size={13} color="#FFB800" />
                        <Text style={adminStyles.serviceDetailReviewRatingText}>
                          {review.calificacion}
                        </Text>
                      </View>
                    </View>
                    {review.comentario && (
                      <Text style={adminStyles.serviceDetailReviewComment}>
                        "{review.comentario}"
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <View style={adminStyles.emptyTab}>
                  <Ionicons name="chatbubble-outline" size={42} color="#D1D5DB" />
                  <Text style={adminStyles.emptyTabText}>Sin reseñas</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showStatusModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>
              {service.activo ? 'Rechazar servicio' : 'Aprobar servicio'}
            </Text>

            <Text style={adminStyles.modalSubtitle}>
              {service.nombre}
            </Text>

            <TextInput
              style={adminStyles.modalInput}
              placeholder={service.activo ? "Motivo del rechazo" : "Motivo (opcional)"}
              placeholderTextColor="#9CA3AF"
              value={statusReason}
              onChangeText={setStatusReason}
              multiline
              numberOfLines={3}
            />

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => {
                  setShowStatusModal(false);
                  setStatusReason('');
                }}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  adminStyles.modalConfirmButton,
                  !service.activo ? adminStyles.modalConfirmButtonSuccess : adminStyles.modalConfirmButtonDanger
                ]}
                onPress={service.activo ? handleRejectService : handleApproveService}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={adminStyles.modalConfirmTextDanger}>
                    {service.activo ? 'Rechazar' : 'Aprobar'}
                  </Text>
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

  serviceDetailHeader: {
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

  serviceDetailStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  serviceDetailStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  serviceDetailStatusActive: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.28)",
  },

  serviceDetailStatusInactive: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  serviceDetailStatusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  serviceDetailStatusTextActive: {
    color: "#1E1240",
  },

  serviceDetailStatusTextInactive: {
    color: "#A61E6E",
  },

  badgeFeatured: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF8E6",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  serviceDetailActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  serviceDetailAction: {
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },

  serviceDetailActionApprove: {
    borderColor: "rgba(183, 255, 60, 0.26)",
    backgroundColor: "#F8FAFC",
  },

  serviceDetailActionReject: {
    borderColor: "rgba(255, 79, 175, 0.18)",
    backgroundColor: "#FFF1F8",
  },

  serviceDetailActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  serviceDetailStats: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  serviceDetailStat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  serviceDetailStatDivider: {
    width: 1,
    backgroundColor: "rgba(17, 24, 39, 0.06)",
    marginHorizontal: 2,
  },

  serviceDetailStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    marginTop: 4,
    marginBottom: 2,
    letterSpacing: -0.2,
  },

  serviceDetailStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
  },

  serviceDetailProfessional: {
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
    alignItems: "center",
    marginBottom: 12,
  },

  serviceDetailProfessionalAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  serviceDetailProfessionalAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  serviceDetailProfessionalInfo: {
    flex: 1,
  },

  serviceDetailProfessionalName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1240",
    marginBottom: 2,
    letterSpacing: -0.1,
  },

  serviceDetailProfessionalEmail: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },

  serviceDetailProfessionalRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  serviceDetailProfessionalRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  serviceDetailTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  serviceDetailTab: {
    minHeight: 38,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  serviceDetailTabActive: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.36)",
  },

  serviceDetailTabActivePink: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  serviceDetailTabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: -0.1,
  },

  serviceDetailTabTextActive: {
    color: "#1E1240",
  },

  serviceDetailTabTextActivePink: {
    color: "#A61E6E",
  },

  serviceDetailTabContent: {
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
  },

  serviceDetailInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  serviceDetailInfoLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  serviceDetailInfoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  serviceDetailInfoDivider: {
    height: 1,
    backgroundColor: "rgba(17, 24, 39, 0.06)",
    marginVertical: 12,
  },

  serviceDetailInfoSubtitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    marginBottom: 8,
    letterSpacing: -0.1,
  },

  serviceDetailInfoDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 12,
  },

  serviceDetailPhotos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  serviceDetailPhotoCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    position: "relative",
  },

  serviceDetailPhotoImage: {
    width: "100%",
    height: "100%",
  },

  serviceDetailPhotoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceDetailPhotoPrincipal: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FFF1F8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  serviceDetailPhotoPrincipalText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  emptyTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 26,
  },

  emptyTabText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },

  serviceDetailReview: {
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
  },

  serviceDetailReviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  serviceDetailReviewUser: {
    flex: 1,
  },

  serviceDetailReviewUserName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    marginBottom: 2,
  },

  serviceDetailReviewDate: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },

  serviceDetailReviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF8E6",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  serviceDetailReviewRatingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E1240",
  },

  serviceDetailReviewComment: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    fontWeight: "600",
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

  modalConfirmButtonSuccess: {
    backgroundColor: "#B7FF3C",
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