//app/admin/services/index.tsx
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

type Service = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMin: number;
  tipoAtencion: string;
  activo: boolean;
  destacado: boolean;
  rating: number;
  contadorReservas: number;
  createdAt: string;
  profesional: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
  };
  categoria?: {
    id: number;
    nombre: string;
  };
  fotos?: {
    id: number;
    imagenUrl: string;
    esPrincipal: boolean;
  }[];
  _count?: {
    reservas: number;
    reviews: number;
  };
};

type Filters = {
  search: string;
  categoria: string;
  activo: string;
  destacado: string;
};

export default function AdminServices() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    categoria: "",
    activo: "",
    destacado: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Modal para cambiar estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | 'feature' | 'unfeature'>('approve');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async (pageNum: number = 1, newFilters = filters) => {
    try {
      setLoading(true);

      const params: any = {
        page: pageNum,
        limit: 20,
      };

      if (newFilters.search) params.search = newFilters.search;
      if (newFilters.categoria) params.categoria = parseInt(newFilters.categoria);
      if (newFilters.activo) params.activo = newFilters.activo === 'true';
      if (newFilters.destacado) params.destacado = newFilters.destacado === 'true';

      const response = await adminService.getServices(params);

      setServices(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.hasNext);
    } catch (error) {
      console.error("Error cargando servicios:", error);
      Alert.alert("Error", "No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadServices(1, filters);
  };

  const handleNextPage = () => {
    if (hasNext && !loading) {
      loadServices(page + 1, filters);
    }
  };

  const handlePrevPage = () => {
    if (page > 1 && !loading) {
      loadServices(page - 1, filters);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", categoria: "", activo: "", destacado: "" });
    setShowFilters(false);
    loadServices(1, { search: "", categoria: "", activo: "", destacado: "" });
  };

  const openStatusModal = (service: Service, action: 'approve' | 'reject' | 'feature' | 'unfeature') => {
    setSelectedService(service);
    setStatusAction(action);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleStatusAction = async () => {
    if (!selectedService) return;

    if ((statusAction === 'reject' || statusAction === 'approve') && !statusReason.trim()) {
      Alert.alert("Error", "Debes especificar un motivo");
      return;
    }

    try {
      setActionLoading(true);

      switch (statusAction) {
        case 'approve':
          await adminService.updateServiceStatus(selectedService.id, {
            activo: true,
            motivo: statusReason
          });
          Alert.alert("Éxito", "Servicio aprobado correctamente");
          break;
        case 'reject':
          await adminService.updateServiceStatus(selectedService.id, {
            activo: false,
            motivo: statusReason
          });
          Alert.alert("Éxito", "Servicio rechazado");
          break;
        case 'feature':
          await adminService.updateServiceStatus(selectedService.id, {
            destacado: true
          });
          Alert.alert("Éxito", "Servicio destacado");
          break;
        case 'unfeature':
          await adminService.updateServiceStatus(selectedService.id, {
            destacado: false
          });
          Alert.alert("Éxito", "Destacado removido");
          break;
      }

      setShowStatusModal(false);
      loadServices(page, filters);
    } catch (error) {
      console.error("Error actualizando servicio:", error);
      Alert.alert("Error", "No se pudo actualizar el servicio");
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  const goToServiceDetail = (serviceId: number) => {
    router.push(`/admin/services/${serviceId}` as Href);
  };

  if (loading && page === 1) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando servicios...</Text>
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
          <Text style={adminStyles.headerTitle}>Servicios</Text>
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
              placeholder="Buscar por nombre o profesional..."
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
            <View style={adminStyles.filterRow}>
              <Text style={adminStyles.filterLabel}>Categoría</Text>
              <View style={adminStyles.filterOptions}>
                <Pressable
                  onPress={() => handleFilterChange('categoria', '')}
                  style={[adminStyles.filterChip, filters.categoria === '' && adminStyles.filterChipActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.categoria === '' && adminStyles.filterChipTextActive]}>
                    Todas
                  </Text>
                </Pressable>
                {categories.slice(0, 5).map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleFilterChange('categoria', cat.id.toString())}
                    style={[adminStyles.filterChip, filters.categoria === cat.id.toString() && adminStyles.filterChipPinkActive]}
                  >
                    <Text style={[adminStyles.filterChipText, filters.categoria === cat.id.toString() && adminStyles.filterChipPinkTextActive]}>
                      {cat.nombre}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={adminStyles.filterRow}>
              <Text style={adminStyles.filterLabel}>Estado</Text>
              <View style={adminStyles.filterOptions}>
                <Pressable
                  onPress={() => handleFilterChange('activo', '')}
                  style={[adminStyles.filterChip, filters.activo === '' && adminStyles.filterChipActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.activo === '' && adminStyles.filterChipTextActive]}>
                    Todos
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFilterChange('activo', 'true')}
                  style={[adminStyles.filterChip, filters.activo === 'true' && adminStyles.filterChipActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.activo === 'true' && adminStyles.filterChipTextActive]}>
                    Activos
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFilterChange('activo', 'false')}
                  style={[adminStyles.filterChip, filters.activo === 'false' && adminStyles.filterChipPinkActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.activo === 'false' && adminStyles.filterChipPinkTextActive]}>
                    Inactivos
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={adminStyles.filterRow}>
              <Text style={adminStyles.filterLabel}>Destacado</Text>
              <View style={adminStyles.filterOptions}>
                <Pressable
                  onPress={() => handleFilterChange('destacado', '')}
                  style={[adminStyles.filterChip, filters.destacado === '' && adminStyles.filterChipActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.destacado === '' && adminStyles.filterChipTextActive]}>
                    Todos
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFilterChange('destacado', 'true')}
                  style={[adminStyles.filterChip, filters.destacado === 'true' && adminStyles.filterChipActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.destacado === 'true' && adminStyles.filterChipTextActive]}>
                    Destacados
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFilterChange('destacado', 'false')}
                  style={[adminStyles.filterChip, filters.destacado === 'false' && adminStyles.filterChipPinkActive]}
                >
                  <Text style={[adminStyles.filterChipText, filters.destacado === 'false' && adminStyles.filterChipPinkTextActive]}>
                    No destacados
                  </Text>
                </Pressable>
              </View>
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
            {services.length} servicios encontrados
          </Text>
        </View>

        <View style={adminStyles.servicesList}>
          {services.map((service) => (
            <Pressable
              key={service.id}
              onPress={() => goToServiceDetail(service.id)}
              style={adminStyles.serviceCard}
            >
              <View style={adminStyles.serviceImageContainer}>
                {service.fotos?.find(f => f.esPrincipal) ? (
                  <View style={adminStyles.serviceImagePlaceholderFilled}>
                    <Ionicons name="image" size={26} color="#B7FF3C" />
                  </View>
                ) : (
                  <View style={adminStyles.serviceImagePlaceholder}>
                    <Ionicons name="image-outline" size={26} color="#D1D5DB" />
                  </View>
                )}
              </View>

              <View style={adminStyles.serviceInfo}>
                <View style={adminStyles.serviceHeader}>
                  <Text style={adminStyles.serviceName} numberOfLines={1}>
                    {service.nombre}
                  </Text>
                  <View style={adminStyles.serviceBadges}>
                    {service.destacado && (
                      <View style={adminStyles.badgeFeatured}>
                        <Ionicons name="star" size={10} color="#FFB800" />
                      </View>
                    )}
                    <View
                      style={[
                        adminStyles.serviceStatusBadge,
                        service.activo ? adminStyles.serviceStatusActive : adminStyles.serviceStatusInactive
                      ]}
                    >
                      <Text
                        style={[
                          adminStyles.serviceStatusText,
                          service.activo ? adminStyles.serviceStatusTextActive : adminStyles.serviceStatusTextInactive
                        ]}
                      >
                        {service.activo ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={adminStyles.serviceProfessional}>
                  {service.profesional.nombre} {service.profesional.apellidoPaterno}
                </Text>

                <View style={adminStyles.serviceDetails}>
                  <Text style={adminStyles.serviceCategory}>
                    {service.categoria?.nombre || 'Sin categoría'}
                  </Text>
                  <Text style={adminStyles.servicePrice}>
                    {formatPrice(service.precio)}
                  </Text>
                </View>

                <View style={adminStyles.serviceStats}>
                  <View style={adminStyles.serviceStat}>
                    <Ionicons name="star" size={13} color="#FFB800" />
                    <Text style={adminStyles.serviceStatText}>
                      {service.rating?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                  <View style={adminStyles.serviceStat}>
                    <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.serviceStatText}>
                      {service._count?.reservas || 0} reservas
                    </Text>
                  </View>
                  <View style={adminStyles.serviceStat}>
                    <Ionicons name="time-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.serviceStatText}>
                      {service.duracionMin} min
                    </Text>
                  </View>
                </View>
              </View>

              <View style={adminStyles.serviceActions}>
                {!service.activo && (
                  <Pressable
                    style={adminStyles.serviceActionApprove}
                    onPress={() => openStatusModal(service, 'approve')}
                  >
                    <Ionicons name="checkmark" size={16} color="#B7FF3C" />
                  </Pressable>
                )}
                {service.activo && (
                  <Pressable
                    style={adminStyles.serviceActionReject}
                    onPress={() => openStatusModal(service, 'reject')}
                  >
                    <Ionicons name="close" size={16} color="#FF4FAF" />
                  </Pressable>
                )}
                <Pressable
                  style={adminStyles.serviceActionFeature}
                  onPress={() => openStatusModal(service, service.destacado ? 'unfeature' : 'feature')}
                >
                  <Ionicons
                    name={service.destacado ? "star-half-outline" : "star-outline"}
                    size={16}
                    color="#FFB800"
                  />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {totalPages > 1 && (
          <View style={adminStyles.pagination}>
            <Pressable
              onPress={handlePrevPage}
              disabled={page === 1 || loading}
              style={[adminStyles.paginationButton, page === 1 && adminStyles.paginationButtonDisabled]}
            >
              <Ionicons name="chevron-back" size={18} color={page === 1 ? "#C4C7D0" : "#1E1240"} />
              <Text style={[adminStyles.paginationButtonText, page === 1 && adminStyles.paginationButtonTextDisabled]}>
                Anterior
              </Text>
            </Pressable>

            <Text style={adminStyles.paginationInfo}>
              Página {page} de {totalPages}
            </Text>

            <Pressable
              onPress={handleNextPage}
              disabled={!hasNext || loading}
              style={[adminStyles.paginationButton, !hasNext && adminStyles.paginationButtonDisabled]}
            >
              <Text style={[adminStyles.paginationButtonText, !hasNext && adminStyles.paginationButtonTextDisabled]}>
                Siguiente
              </Text>
              <Ionicons name="chevron-forward" size={18} color={!hasNext ? "#C4C7D0" : "#1E1240"} />
            </Pressable>
          </View>
        )}

        {loading && page > 1 && (
          <View style={adminStyles.loadingMore}>
            <ActivityIndicator size="small" color="#B7FF3C" />
            <Text style={adminStyles.loadingMoreText}>Cargando más servicios...</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showStatusModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>
              {statusAction === 'approve' && 'Aprobar servicio'}
              {statusAction === 'reject' && 'Rechazar servicio'}
              {statusAction === 'feature' && 'Destacar servicio'}
              {statusAction === 'unfeature' && 'Quitar destacado'}
            </Text>

            <Text style={adminStyles.modalSubtitle}>
              {selectedService?.nombre}
            </Text>

            {(statusAction === 'approve' || statusAction === 'reject') && (
              <TextInput
                style={adminStyles.modalInput}
                placeholder="Motivo (opcional)"
                placeholderTextColor="#9CA3AF"
                value={statusReason}
                onChangeText={setStatusReason}
                multiline
                numberOfLines={3}
              />
            )}

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  adminStyles.modalConfirmButton,
                  statusAction === 'reject' && adminStyles.modalConfirmButtonDanger
                ]}
                onPress={handleStatusAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={statusAction === 'reject' ? adminStyles.modalConfirmTextDanger : adminStyles.modalConfirmText}>
                    {statusAction === 'approve' && 'Aprobar'}
                    {statusAction === 'reject' && 'Rechazar'}
                    {statusAction === 'feature' && 'Destacar'}
                    {statusAction === 'unfeature' && 'Quitar'}
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

  filterRow: {
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
    marginTop: 2,
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

  servicesList: {
    gap: 10,
  },

  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
    marginBottom: 10,
  },

  serviceImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
  },

  serviceImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
  },

  serviceImagePlaceholderFilled: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4FCE7",
    borderWidth: 1,
    borderColor: "rgba(183, 255, 60, 0.24)",
  },

  serviceInfo: {
    flex: 1,
  },

  serviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },

  serviceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  serviceBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  badgeFeatured: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#FFF8E6",
  },

  serviceStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  serviceStatusActive: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.28)",
  },

  serviceStatusInactive: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  serviceStatusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  serviceStatusTextActive: {
    color: "#1E1240",
  },

  serviceStatusTextInactive: {
    color: "#A61E6E",
  },

  serviceProfessional: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },

  serviceDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  serviceCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    flex: 1,
  },

  servicePrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
  },

  serviceStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  serviceStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  serviceStatText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },

  serviceActions: {
    gap: 8,
    alignItems: "center",
  },

  serviceActionApprove: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4FCE7",
  },

  serviceActionReject: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F8",
  },

  serviceActionFeature: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E6",
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
  },

  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  paginationButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },

  paginationButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  paginationButtonTextDisabled: {
    color: "#C4C7D0",
  },

  paginationInfo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },

  loadingMoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
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

  modalConfirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  modalConfirmTextDanger: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.1,
  },
});