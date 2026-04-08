//app/admin/users/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type User = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  rut?: string;
  rol: string;
  categoria?: string;
  rating: number;
  cantidadOpiniones: number;
  destacado: boolean;
  verificado: boolean;
  emailConfirmado: boolean;
  createdAt: string;
  _count?: {
    servicios: number;
    reservasCliente: number;
    reservasProfesional: number;
  };
};

type Filters = {
  search: string;
  rol: string;
  verificado: string;
  destacado: string;
};

export default function AdminUsers() {
  const auth = useContext(AuthContext) as any;
  const { user } = auth || {};
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    rol: "",
    verificado: "",
    destacado: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const loadUsers = async (pageNum: number = 1, newFilters = filters) => {
    try {
      setLoading(true);

      const params: any = {
        page: pageNum,
        limit: 20,
      };

      if (newFilters.search) params.search = newFilters.search;
      if (newFilters.rol) params.rol = newFilters.rol;
      if (newFilters.verificado) params.verificado = newFilters.verificado;
      if (newFilters.destacado) params.destacado = newFilters.destacado;

      const response = await adminService.getUsers(params);

      setUsers(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.hasNext);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadUsers(1, filters);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setFilters({ search: "", rol: "", verificado: "", destacado: "" });
    loadUsers(1, { search: "", rol: "", verificado: "", destacado: "" });
  };

  const handleNextPage = () => {
    if (hasNext && !loading) {
      loadUsers(page + 1, filters);
    }
  };

  const handlePrevPage = () => {
    if (page > 1 && !loading) {
      loadUsers(page - 1, filters);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", rol: "", verificado: "", destacado: "" });
    setShowFilters(false);
    loadUsers(1, { search: "", rol: "", verificado: "", destacado: "" });
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'Admin': return { bg: '#FF4FAF', text: '#fff', label: 'Admin' };
      case 'Profesional': return { bg: '#B7FF3C', text: '#1E1240', label: 'Pro' };
      default: return { bg: '#1E1240', text: '#fff', label: 'Cliente' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const goToUserDetail = (userId: number) => {
    router.push(`/admin/users/${userId}` as Href);
  };

  if (loading && page === 1) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
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
        <Text style={adminStyles.headerTitle}>Usuarios</Text>
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
            placeholder="Buscar por nombre, email o RUT..."
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
            <Text style={adminStyles.filterLabel}>Rol</Text>
            <View style={adminStyles.filterOptions}>
              <Pressable
                onPress={() => handleFilterChange('rol', '')}
                style={[adminStyles.filterChip, filters.rol === '' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.rol === '' && adminStyles.filterChipTextActive]}>
                  Todos
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleFilterChange('rol', 'Cliente')}
                style={[adminStyles.filterChip, filters.rol === 'Cliente' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.rol === 'Cliente' && adminStyles.filterChipTextActive]}>
                  Clientes
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleFilterChange('rol', 'Profesional')}
                style={[adminStyles.filterChip, filters.rol === 'Profesional' && adminStyles.filterChipPinkActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.rol === 'Profesional' && adminStyles.filterChipPinkTextActive]}>
                  Profesionales
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleFilterChange('rol', 'Admin')}
                style={[adminStyles.filterChip, filters.rol === 'Admin' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.rol === 'Admin' && adminStyles.filterChipTextActive]}>
                  Admins
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={adminStyles.filterRow}>
            <Text style={adminStyles.filterLabel}>Verificado</Text>
            <View style={adminStyles.filterOptions}>
              <Pressable
                onPress={() => handleFilterChange('verificado', '')}
                style={[adminStyles.filterChip, filters.verificado === '' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.verificado === '' && adminStyles.filterChipTextActive]}>
                  Todos
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleFilterChange('verificado', 'true')}
                style={[adminStyles.filterChip, filters.verificado === 'true' && adminStyles.filterChipActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.verificado === 'true' && adminStyles.filterChipTextActive]}>
                  Verificados
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleFilterChange('verificado', 'false')}
                style={[adminStyles.filterChip, filters.verificado === 'false' && adminStyles.filterChipPinkActive]}
              >
                <Text style={[adminStyles.filterChipText, filters.verificado === 'false' && adminStyles.filterChipPinkTextActive]}>
                  No verificados
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
          {users.length} usuarios encontrados
        </Text>
        <Pressable onPress={handleRefresh} style={adminStyles.refreshButton}>
          <Ionicons name="refresh" size={16} color="#FF4FAF" />
        </Pressable>
      </View>

      <View style={adminStyles.usersList}>
        {users.map((userItem) => {
          const rolBadge = getRolBadge(userItem.rol);

          return (
            <Pressable
              key={userItem.id}
              onPress={() => goToUserDetail(userItem.id)}
              style={adminStyles.userCard}
            >
              <View style={adminStyles.userAvatar}>
                <Text style={adminStyles.userAvatarText}>
                  {userItem.nombre.charAt(0)}
                  {userItem.apellidoPaterno.charAt(0)}
                </Text>
              </View>

              <View style={adminStyles.userInfo}>
                <View style={adminStyles.userHeader}>
                  <Text style={adminStyles.userName}>
                    {userItem.nombre} {userItem.apellidoPaterno}
                  </Text>
                  <View style={[adminStyles.rolBadge, { backgroundColor: rolBadge.bg }]}>
                    <Text style={[adminStyles.rolBadgeText, { color: rolBadge.text }]}>
                      {rolBadge.label}
                    </Text>
                  </View>
                </View>

                <Text style={adminStyles.userEmail}>{userItem.email}</Text>

                <View style={adminStyles.userStats}>
                  <View style={adminStyles.statItem}>
                    <Ionicons name="star" size={13} color="#FFB800" />
                    <Text style={adminStyles.statText}>
                      {userItem.rating?.toFixed(1) || "0.0"} ({userItem.cantidadOpiniones})
                    </Text>
                  </View>

                  <View style={adminStyles.statItem}>
                    <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.statText}>
                      {userItem._count?.servicios || 0} servicios
                    </Text>
                  </View>

                  <View style={adminStyles.statItem}>
                    <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.statText}>
                      {formatDate(userItem.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={adminStyles.userBadges}>
                  {userItem.verificado && (
                    <View style={adminStyles.badgeVerified}>
                      <Ionicons name="checkmark-circle" size={12} color="#B7FF3C" />
                      <Text style={adminStyles.badgeText}>Verificado</Text>
                    </View>
                  )}

                  {userItem.destacado && (
                    <View style={adminStyles.badgeFeatured}>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <Text style={adminStyles.badgeText}>Destacado</Text>
                    </View>
                  )}

                  {!userItem.emailConfirmado && (
                    <View style={adminStyles.badgeWarning}>
                      <Ionicons name="alert-circle" size={12} color="#FF4FAF" />
                      <Text style={adminStyles.badgeWarningText}>Email no confirmado</Text>
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#C4C7D0" />
            </Pressable>
          );
        })}
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
          <Text style={adminStyles.loadingMoreText}>Cargando más usuarios...</Text>
        </View>
      )}
    </ScrollView>
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

  usersList: {
    gap: 10,
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
    marginBottom: 10,
  },

  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4FCE7",
  },

  userAvatarText: {
    fontSize: 13,
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

  rolBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  rolBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  userEmail: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 10,
  },

  userStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  userBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F4FCE7",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
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

  badgeWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF1F8",
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

  badgeWarningText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
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
});