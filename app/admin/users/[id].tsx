//app/admin/users/[id].tsx
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

type UserDetail = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  rut?: string;
  rol: string;
  categoria?: string;
  experiencia?: string;
  certificaciones?: string;
  fotoPerfil?: string;
  ubicacion?: string;
  region?: string;
  comuna?: string;
  lugarAtencion?: any;
  rating: number;
  cantidadOpiniones: number;
  destacado: boolean;
  verificado: boolean;
  emailConfirmado: boolean;
  createdAt: string;
  updatedAt: string;
  servicios?: any[];
  portfolio?: any[];
  reservasCliente?: any[];
  reservasProfesional?: any[];
  reviewsRecibidas?: any[];
  reviewsDadas?: any[];
  notificaciones?: any[];
};

type TabType = 'info' | 'servicios' | 'reservas' | 'resenas' | 'notificaciones';

export default function AdminUserDetail() {
  const { id } = useLocalSearchParams();
  const userId = parseInt(id as string);
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserById(userId);
      setUser(response.data);
      setSelectedRole(response.data.rol);
    } catch (error) {
      console.error("Error cargando usuario:", error);
      Alert.alert("Error", "No se pudo cargar la información del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user?.rol) {
      setShowRoleModal(false);
      return;
    }

    try {
      setActionLoading(true);
      await adminService.updateUserRole(userId, selectedRole);
      await loadUserDetail();
      setShowRoleModal(false);
      Alert.alert("Éxito", "Rol actualizado correctamente");
    } catch (error) {
      console.error("Error cambiando rol:", error);
      Alert.alert("Error", "No se pudo actualizar el rol");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    Alert.alert(
      "Verificar usuario",
      "¿Estás seguro de que quieres verificar este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Verificar",
          onPress: async () => {
            try {
              setActionLoading(true);
              await adminService.verifyUser(userId);
              await loadUserDetail();
              Alert.alert("Éxito", "Usuario verificado correctamente");
            } catch (error) {
              console.error("Error verificando usuario:", error);
              Alert.alert("Error", "No se pudo verificar el usuario");
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleFeatured = async () => {
    try {
      setActionLoading(true);
      await adminService.toggleUserFeatured(userId);
      await loadUserDetail();
      Alert.alert(
        "Éxito",
        user?.destacado ? "Destacado removido" : "Usuario destacado"
      );
    } catch (error) {
      console.error("Error cambiando destacado:", error);
      Alert.alert("Error", "No se pudo cambiar el estado destacado");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason.trim()) {
      Alert.alert("Error", "Debes especificar un motivo");
      return;
    }

    try {
      setActionLoading(true);
      await adminService.suspendUser(userId, suspendReason);
      setShowSuspendModal(false);
      setSuspendReason('');
      Alert.alert("Éxito", "Usuario suspendido correctamente");
      router.back();
    } catch (error) {
      console.error("Error suspendiendo usuario:", error);
      Alert.alert("Error", "No se pudo suspender el usuario");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Admin': return '#FF4FAF';
      case 'Profesional': return '#B7FF3C';
      default: return '#1E1240';
    }
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando usuario...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <View style={adminStyles.emptyIconWrap}>
          <Ionicons name="alert-circle-outline" size={26} color="#FF4FAF" />
        </View>
        <Text style={adminStyles.loadingText}>Usuario no encontrado</Text>
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
          <Text style={adminStyles.headerTitle}>Detalle Usuario</Text>
          <View style={adminStyles.headerSpacer} />
        </View>

        <View style={adminStyles.userProfileHeader}>
          <View style={[adminStyles.userProfileAvatar, { backgroundColor: getRolColor(user.rol) + '20' }]}>
            <Text style={[adminStyles.userProfileAvatarText, { color: getRolColor(user.rol) }]}>
              {user.nombre.charAt(0)}{user.apellidoPaterno.charAt(0)}
            </Text>
          </View>
          <View style={adminStyles.userProfileInfo}>
            <Text style={adminStyles.userProfileName}>
              {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
            </Text>
            <Text style={adminStyles.userProfileEmail}>{user.email}</Text>
            <View style={adminStyles.userProfileBadges}>
              <View style={[adminStyles.rolBadge, { backgroundColor: getRolColor(user.rol) }]}>
                <Text style={adminStyles.rolBadgeText}>{user.rol}</Text>
              </View>
              {user.verificado && (
                <View style={adminStyles.badgeVerified}>
                  <Ionicons name="checkmark-circle" size={12} color="#B7FF3C" />
                  <Text style={adminStyles.badgeText}>Verificado</Text>
                </View>
              )}
              {user.destacado && (
                <View style={adminStyles.badgeFeatured}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={adminStyles.badgeText}>Destacado</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={adminStyles.userStatsGrid}>
          <View style={adminStyles.userStatCard}>
            <Ionicons name="star" size={20} color="#FFB800" />
            <Text style={adminStyles.userStatValue}>{user.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={adminStyles.userStatLabel}>Rating</Text>
            <Text style={adminStyles.userStatSub}>({user.cantidadOpiniones} opiniones)</Text>
          </View>
          <View style={adminStyles.userStatCard}>
            <Ionicons name="briefcase-outline" size={20} color="#B7FF3C" />
            <Text style={adminStyles.userStatValue}>{user.servicios?.length || 0}</Text>
            <Text style={adminStyles.userStatLabel}>Servicios</Text>
          </View>
          <View style={adminStyles.userStatCard}>
            <Ionicons name="calendar-outline" size={20} color="#FF4FAF" />
            <Text style={adminStyles.userStatValue}>
              {(user.reservasCliente?.length || 0) + (user.reservasProfesional?.length || 0)}
            </Text>
            <Text style={adminStyles.userStatLabel}>Reservas</Text>
          </View>
          <View style={adminStyles.userStatCard}>
            <Ionicons name="chatbubble-outline" size={20} color="#1E1240" />
            <Text style={adminStyles.userStatValue}>{user.reviewsRecibidas?.length || 0}</Text>
            <Text style={adminStyles.userStatLabel}>Reseñas</Text>
          </View>
        </View>

        <View style={adminStyles.userActionsSection}>
          <Text style={adminStyles.sectionTitle}>Acciones de administrador</Text>
          <View style={adminStyles.userActionsGrid}>
            <Pressable
              style={adminStyles.userActionButton}
              onPress={() => setShowRoleModal(true)}
            >
              <Ionicons name="people-outline" size={18} color="#B7FF3C" />
              <Text style={adminStyles.userActionText}>Cambiar rol</Text>
            </Pressable>

            {!user.verificado && (
              <Pressable
                style={adminStyles.userActionButton}
                onPress={handleVerifyUser}
              >
                <Ionicons name="checkmark-done-outline" size={18} color="#B7FF3C" />
                <Text style={adminStyles.userActionText}>Verificar</Text>
              </Pressable>
            )}

            <Pressable
              style={adminStyles.userActionButton}
              onPress={handleToggleFeatured}
            >
              <Ionicons
                name={user.destacado ? "star-half-outline" : "star-outline"}
                size={18}
                color="#FFB800"
              />
              <Text style={adminStyles.userActionText}>
                {user.destacado ? "Quitar destacado" : "Destacar"}
              </Text>
            </Pressable>

            <Pressable
              style={[adminStyles.userActionButton, adminStyles.userActionButtonDanger]}
              onPress={() => setShowSuspendModal(true)}
            >
              <Ionicons name="ban-outline" size={18} color="#FF4FAF" />
              <Text style={[adminStyles.userActionText, adminStyles.userActionTextDanger]}>Suspender</Text>
            </Pressable>
          </View>
        </View>

        <View style={adminStyles.userTabs}>
          <Pressable
            style={[adminStyles.userTab, activeTab === 'info' && adminStyles.userTabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[adminStyles.userTabText, activeTab === 'info' && adminStyles.userTabTextActive]}>
              Info
            </Text>
          </Pressable>
          <Pressable
            style={[adminStyles.userTab, activeTab === 'servicios' && adminStyles.userTabActivePink]}
            onPress={() => setActiveTab('servicios')}
          >
            <Text style={[adminStyles.userTabText, activeTab === 'servicios' && adminStyles.userTabTextActivePink]}>
              Servicios
            </Text>
          </Pressable>
          <Pressable
            style={[adminStyles.userTab, activeTab === 'reservas' && adminStyles.userTabActive]}
            onPress={() => setActiveTab('reservas')}
          >
            <Text style={[adminStyles.userTabText, activeTab === 'reservas' && adminStyles.userTabTextActive]}>
              Reservas
            </Text>
          </Pressable>
          <Pressable
            style={[adminStyles.userTab, activeTab === 'resenas' && adminStyles.userTabActivePink]}
            onPress={() => setActiveTab('resenas')}
          >
            <Text style={[adminStyles.userTabText, activeTab === 'resenas' && adminStyles.userTabTextActivePink]}>
              Reseñas
            </Text>
          </Pressable>
        </View>

        <View style={adminStyles.userTabContent}>
          {activeTab === 'info' && (
            <View style={adminStyles.infoSection}>
              <View style={adminStyles.infoRow}>
                <Text style={adminStyles.infoLabel}>RUT:</Text>
                <Text style={adminStyles.infoValue}>{user.rut || 'No especificado'}</Text>
              </View>
              <View style={adminStyles.infoRow}>
                <Text style={adminStyles.infoLabel}>Teléfono:</Text>
                <Text style={adminStyles.infoValue}>{user.telefono || 'No especificado'}</Text>
              </View>
              <View style={adminStyles.infoRow}>
                <Text style={adminStyles.infoLabel}>Región/Comuna:</Text>
                <Text style={adminStyles.infoValue}>
                  {user.region ? `${user.region} / ${user.comuna || ''}` : 'No especificado'}
                </Text>
              </View>
              <View style={adminStyles.infoRow}>
                <Text style={adminStyles.infoLabel}>Email confirmado:</Text>
                <Text style={[adminStyles.infoValue, user.emailConfirmado ? adminStyles.infoValueOk : adminStyles.infoValueDanger]}>
                  {user.emailConfirmado ? 'Sí' : 'No'}
                </Text>
              </View>
              <View style={adminStyles.infoRow}>
                <Text style={adminStyles.infoLabel}>Fecha registro:</Text>
                <Text style={adminStyles.infoValue}>{formatDate(user.createdAt)}</Text>
              </View>

              {user.rol === 'Profesional' && (
                <>
                  <View style={adminStyles.infoDivider} />
                  <Text style={adminStyles.infoSubtitle}>Información profesional</Text>
                  <View style={adminStyles.infoRow}>
                    <Text style={adminStyles.infoLabel}>Categoría:</Text>
                    <Text style={adminStyles.infoValue}>{user.categoria || 'No especificada'}</Text>
                  </View>
                  <View style={adminStyles.infoRow}>
                    <Text style={adminStyles.infoLabel}>Experiencia:</Text>
                    <Text style={adminStyles.infoValue}>{user.experiencia || 'No especificada'}</Text>
                  </View>
                  {user.lugarAtencion && (
                    <View style={adminStyles.infoRow}>
                      <Text style={adminStyles.infoLabel}>Lugar atención:</Text>
                      <Text style={adminStyles.infoValue}>
                        {Array.isArray(user.lugarAtencion) ? user.lugarAtencion.join(', ') : 'No especificado'}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {activeTab === 'servicios' && (
            <View style={adminStyles.emptyTab}>
              <Ionicons name="construct-outline" size={42} color="#D1D5DB" />
              <Text style={adminStyles.emptyTabText}>Próximamente: Lista de servicios</Text>
            </View>
          )}

          {activeTab === 'reservas' && (
            <View style={adminStyles.emptyTab}>
              <Ionicons name="calendar-outline" size={42} color="#D1D5DB" />
              <Text style={adminStyles.emptyTabText}>Próximamente: Historial de reservas</Text>
            </View>
          )}

          {activeTab === 'resenas' && (
            <View style={adminStyles.emptyTab}>
              <Ionicons name="star-outline" size={42} color="#D1D5DB" />
              <Text style={adminStyles.emptyTabText}>Próximamente: Reseñas recibidas</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showRoleModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Cambiar rol de usuario</Text>

            <View style={adminStyles.modalOptions}>
              <Pressable
                style={[adminStyles.modalOption, selectedRole === 'Cliente' && adminStyles.modalOptionSelected]}
                onPress={() => setSelectedRole('Cliente')}
              >
                <Text style={[adminStyles.modalOptionText, selectedRole === 'Cliente' && adminStyles.modalOptionTextSelected]}>
                  Cliente
                </Text>
              </Pressable>
              <Pressable
                style={[adminStyles.modalOption, selectedRole === 'Profesional' && adminStyles.modalOptionSelectedPink]}
                onPress={() => setSelectedRole('Profesional')}
              >
                <Text style={[adminStyles.modalOptionText, selectedRole === 'Profesional' && adminStyles.modalOptionTextSelectedPink]}>
                  Profesional
                </Text>
              </Pressable>
              <Pressable
                style={[adminStyles.modalOption, selectedRole === 'Admin' && adminStyles.modalOptionSelected]}
                onPress={() => setSelectedRole('Admin')}
              >
                <Text style={[adminStyles.modalOptionText, selectedRole === 'Admin' && adminStyles.modalOptionTextSelected]}>
                  Admin
                </Text>
              </Pressable>
            </View>

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={adminStyles.modalConfirmButton}
                onPress={handleRoleChange}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#1E1240" />
                ) : (
                  <Text style={adminStyles.modalConfirmText}>Confirmar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuspendModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Suspender usuario</Text>
            <Text style={adminStyles.modalSubtitle}>
              ¿Estás seguro de suspender a {user.nombre}?
            </Text>

            <TextInput
              style={adminStyles.modalInput}
              placeholder="Motivo de la suspensión"
              placeholderTextColor="#9CA3AF"
              value={suspendReason}
              onChangeText={setSuspendReason}
              multiline
              numberOfLines={3}
            />

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                }}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[adminStyles.modalConfirmButton, adminStyles.modalConfirmButtonDanger]}
                onPress={handleSuspendUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={adminStyles.modalConfirmTextDanger}>Suspender</Text>
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

  userProfileHeader: {
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

  userProfileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  userProfileAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  userProfileInfo: {
    flex: 1,
  },

  userProfileName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 3,
  },

  userProfileEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },

  userProfileBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  rolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  rolBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.1,
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

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  userStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 12,
  },

  userStatCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: "center",
  },

  userStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.3,
    marginTop: 6,
    marginBottom: 2,
  },

  userStatLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  userStatSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 2,
  },

  userActionsSection: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  userActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  userActionButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  userActionButtonDanger: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  userActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  userActionTextDanger: {
    color: "#FF4FAF",
  },

  userTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  userTab: {
    minHeight: 38,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  userTabActive: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.36)",
  },

  userTabActivePink: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  userTabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: -0.1,
  },

  userTabTextActive: {
    color: "#1E1240",
  },

  userTabTextActivePink: {
    color: "#A61E6E",
  },

  userTabContent: {
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

  infoSection: {},

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  infoValueOk: {
    color: "#B7FF3C",
  },

  infoValueDanger: {
    color: "#FF4FAF",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "rgba(17, 24, 39, 0.06)",
    marginVertical: 12,
  },

  infoSubtitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    marginBottom: 8,
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

  modalOptions: {
    gap: 8,
    marginBottom: 10,
  },

  modalOption: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  modalOptionSelected: {
    backgroundColor: "#F4FCE7",
    borderColor: "rgba(183, 255, 60, 0.36)",
  },

  modalOptionSelectedPink: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  modalOptionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: -0.1,
  },

  modalOptionTextSelected: {
    color: "#1E1240",
  },

  modalOptionTextSelectedPink: {
    color: "#A61E6E",
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