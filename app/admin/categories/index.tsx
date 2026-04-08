//app/admin/categories/index.tsx
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

type Category = {
  id: number;
  nombre: string;
  icono?: string;
  descripcion?: string;
  orden: number;
  activa: boolean;
  _count?: {
    servicios: number;
    intereses: number;
  };
};

export default function AdminCategories() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    icono: '',
    descripcion: '',
    orden: '0',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Modal para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [moveServicesTo, setMoveServicesTo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      const categoriesData = Array.isArray(response) ? response : response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      Alert.alert("Error", "No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      nombre: '',
      icono: '',
      descripcion: '',
      orden: '0',
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      icono: category.icono || '',
      descripcion: category.descripcion || '',
      orden: category.orden.toString(),
    });
    setShowModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setMoveServicesTo('');
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    try {
      setActionLoading(true);

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, {
          nombre: formData.nombre,
          icono: formData.icono || undefined,
          descripcion: formData.descripcion || undefined,
          orden: parseInt(formData.orden) || 0,
        });
        Alert.alert("Éxito", "Categoría actualizada");
      } else {
        await adminService.createCategory({
          nombre: formData.nombre,
          icono: formData.icono || undefined,
          descripcion: formData.descripcion || undefined,
          orden: parseInt(formData.orden) || 0,
        });
        Alert.alert("Éxito", "Categoría creada");
      }

      setShowModal(false);
      loadCategories();
    } catch (error) {
      console.error("Error guardando categoría:", error);
      Alert.alert("Error", "No se pudo guardar la categoría");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      setDeleteLoading(true);

      await adminService.deleteCategory(
        deletingCategory.id,
        moveServicesTo ? parseInt(moveServicesTo) : undefined
      );

      setShowDeleteModal(false);
      Alert.alert("Éxito", "Categoría eliminada");
      loadCategories();
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      Alert.alert("Error", "No se pudo eliminar la categoría");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleCategoryActive = async (category: Category) => {
    try {
      await adminService.updateCategory(category.id, {
        activa: !category.activa
      });
      loadCategories();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      Alert.alert("Error", "No se pudo cambiar el estado");
    }
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando categorías...</Text>
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
          <Text style={adminStyles.headerTitle}>Categorías</Text>
          <Pressable onPress={openCreateModal} style={adminStyles.filterButton}>
            <Ionicons name="add" size={22} color="#B7FF3C" />
          </Pressable>
        </View>

        <View style={adminStyles.resultsCount}>
          <Text style={adminStyles.resultsCountText}>
            {categories.length} categorías
          </Text>
          <Pressable onPress={loadCategories} style={adminStyles.refreshButton}>
            <Ionicons name="refresh" size={16} color="#FF4FAF" />
          </Pressable>
        </View>

        <View style={adminStyles.usersList}>
          {categories.length === 0 ? (
            <View style={adminStyles.adminEmptyState}>
              <View style={adminStyles.emptyIconWrap}>
                <Ionicons name="pricetags-outline" size={26} color="#B7FF3C" />
              </View>
              <Text style={adminStyles.adminEmptyStateText}>No hay categorías</Text>
              <Text style={adminStyles.adminEmptyStateSubtext}>
                Crea tu primera categoría
              </Text>
            </View>
          ) : (
            categories.map((category) => (
              <View key={category.id} style={adminStyles.userCard}>
                <View style={[adminStyles.userAvatar, { backgroundColor: category.activa ? '#F4FCE7' : '#FFF1F8' }]}>
                  <Ionicons
                    name={category.icono as any || "pricetag-outline"}
                    size={20}
                    color={category.activa ? "#B7FF3C" : "#FF4FAF"}
                  />
                </View>

                <View style={adminStyles.userInfo}>
                  <View style={adminStyles.userHeader}>
                    <Text style={adminStyles.userName}>{category.nombre}</Text>
                    <Pressable onPress={() => toggleCategoryActive(category)}>
                      <View
                        style={[
                          adminStyles.serviceStatusBadge,
                          category.activa ? adminStyles.serviceStatusActive : adminStyles.serviceStatusInactive
                        ]}
                      >
                        <Text
                          style={[
                            adminStyles.serviceStatusText,
                            category.activa ? adminStyles.serviceStatusTextActive : adminStyles.serviceStatusTextInactive
                          ]}
                        >
                          {category.activa ? 'Activa' : 'Inactiva'}
                        </Text>
                      </View>
                    </Pressable>
                  </View>

                  {category.descripcion ? (
                    <Text style={adminStyles.userEmail} numberOfLines={2}>
                      {category.descripcion}
                    </Text>
                  ) : null}

                  <View style={adminStyles.userStats}>
                    <View style={adminStyles.statItem}>
                      <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
                      <Text style={adminStyles.statText}>
                        {category._count?.servicios || 0} servicios
                      </Text>
                    </View>
                    <View style={adminStyles.statItem}>
                      <Ionicons name="people-outline" size={13} color="#6B7280" />
                      <Text style={adminStyles.statText}>
                        {category._count?.intereses || 0} intereses
                      </Text>
                    </View>
                    <View style={adminStyles.statItem}>
                      <Ionicons name="list" size={13} color="#6B7280" />
                      <Text style={adminStyles.statText}>
                        Orden {category.orden}
                      </Text>
                    </View>
                  </View>

                  <View style={adminStyles.userActionsGrid}>
                    <Pressable
                      style={adminStyles.userActionButton}
                      onPress={() => openEditModal(category)}
                    >
                      <Ionicons name="create-outline" size={15} color="#B7FF3C" />
                      <Text style={adminStyles.userActionText}>Editar</Text>
                    </Pressable>

                    <Pressable
                      style={[adminStyles.userActionButton, adminStyles.userActionButtonDanger]}
                      onPress={() => openDeleteModal(category)}
                    >
                      <Ionicons name="trash-outline" size={15} color="#FF4FAF" />
                      <Text style={[adminStyles.userActionText, adminStyles.userActionTextDanger]}>
                        Eliminar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>
              {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
            </Text>

            <TextInput
              style={adminStyles.modalInputSingle}
              placeholder="Nombre *"
              placeholderTextColor="#9CA3AF"
              value={formData.nombre}
              onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            />

            <TextInput
              style={adminStyles.modalInputSingle}
              placeholder="Icono (nombre Ionicons)"
              placeholderTextColor="#9CA3AF"
              value={formData.icono}
              onChangeText={(text) => setFormData({ ...formData, icono: text })}
            />

            <TextInput
              style={adminStyles.modalInput}
              placeholder="Descripción"
              placeholderTextColor="#9CA3AF"
              value={formData.descripcion}
              onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={adminStyles.modalInputSingle}
              placeholder="Orden (número)"
              placeholderTextColor="#9CA3AF"
              value={formData.orden}
              onChangeText={(text) => setFormData({ ...formData, orden: text })}
              keyboardType="numeric"
            />

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={adminStyles.modalConfirmButton}
                onPress={handleSave}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#1E1240" />
                ) : (
                  <Text style={adminStyles.modalConfirmText}>
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="slide">
        <View style={adminStyles.modalOverlay}>
          <View style={adminStyles.modalContent}>
            <Text style={adminStyles.modalTitle}>Eliminar categoría</Text>
            <Text style={adminStyles.modalSubtitle}>
              ¿Estás seguro de eliminar "{deletingCategory?.nombre}"?
            </Text>

            {deletingCategory?._count?.servicios ? (
              <>
                <Text style={[adminStyles.modalSubtitle, adminStyles.modalSubtitleDanger]}>
                  Esta categoría tiene {deletingCategory._count.servicios} servicios
                </Text>
                <TextInput
                  style={adminStyles.modalInputSingle}
                  placeholder="ID de categoría destino (opcional)"
                  placeholderTextColor="#9CA3AF"
                  value={moveServicesTo}
                  onChangeText={setMoveServicesTo}
                  keyboardType="numeric"
                />
              </>
            ) : null}

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[adminStyles.modalConfirmButton, adminStyles.modalConfirmButtonDanger]}
                onPress={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
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
    marginBottom: 4,
  },

  adminEmptyStateSubtext: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
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
    marginBottom: 10,
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

  userStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
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

  userActionsGrid: {
    flexDirection: "row",
    gap: 8,
  },

  userActionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(183, 255, 60, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },

  userActionButtonDanger: {
    backgroundColor: "#FFF1F8",
    borderColor: "rgba(255, 79, 175, 0.18)",
  },

  userActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  userActionTextDanger: {
    color: "#FF4FAF",
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

  modalSubtitleDanger: {
    color: "#FF4FAF",
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

  modalInputSingle: {
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
    minHeight: 42,
  },

  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
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