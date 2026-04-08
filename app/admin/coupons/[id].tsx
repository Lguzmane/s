//app/admin/coupons/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Href } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../../context/AuthContext";
import { adminService } from '../../../services/adminService';

type Coupon = {
  id: number;
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  usosMaximos: number;
  usosPorUsuario: number;
  montoMinimo: number;
  categorias?: number[] | null;
  activo: boolean;
  createdAt: string;
  _count?: {
    usos: number;
  };
};

type Category = {
  id: number;
  nombre: string;
};

export default function CouponDetail() {
  const { id } = useLocalSearchParams();
  const couponId = parseInt(id as string);
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Formulario
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'porcentaje' as 'porcentaje' | 'fijo',
    valor: '',
    fechaInicio: '',
    fechaFin: '',
    usosMaximos: '',
    usosPorUsuario: '1',
    montoMinimo: '',
    categorias: [] as number[],
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, [couponId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar cupón y categorías en paralelo
      const [couponResponse, categoriesResponse] = await Promise.all([
        adminService.getCouponById(couponId),
        adminService.getCategories()
      ]);

      const couponData = couponResponse.data;
      setCoupon(couponData);

      // Preparar formData con los datos del cupón
      setFormData({
        codigo: couponData.codigo,
        tipo: couponData.tipo,
        valor: couponData.valor.toString(),
        fechaInicio: couponData.fechaInicio.split('T')[0],
        fechaFin: couponData.fechaFin.split('T')[0],
        usosMaximos: couponData.usosMaximos.toString(),
        usosPorUsuario: couponData.usosPorUsuario.toString(),
        montoMinimo: couponData.montoMinimo.toString(),
        categorias: couponData.categorias || [],
        activo: couponData.activo,
      });

      setSelectedCategories(couponData.categorias || []);
      setCategories(categoriesResponse.data);

    } catch (error) {
      console.error("Error cargando datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del cupón");
    } finally {
      setLoading(false);
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    if (!formData.codigo.trim()) {
      Alert.alert("Error", "El código es requerido");
      return;
    }

    if (!formData.valor.trim() || parseInt(formData.valor) <= 0) {
      Alert.alert("Error", "El valor debe ser mayor a 0");
      return;
    }

    if (!formData.fechaFin) {
      Alert.alert("Error", "La fecha de fin es requerida");
      return;
    }

    if (new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
      Alert.alert("Error", "La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    if (!formData.usosMaximos.trim() || parseInt(formData.usosMaximos) <= 0) {
      Alert.alert("Error", "Los usos máximos deben ser mayor a 0");
      return;
    }

    try {
      setSaving(true);

      await adminService.updateCoupon(couponId, {
        codigo: formData.codigo,
        tipo: formData.tipo,
        valor: parseInt(formData.valor),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        usosMaximos: parseInt(formData.usosMaximos),
        usosPorUsuario: parseInt(formData.usosPorUsuario),
        montoMinimo: formData.montoMinimo ? parseInt(formData.montoMinimo) : 0,
        categorias: formData.categorias.length > 0 ? formData.categorias : [],
        activo: formData.activo
      });

      Alert.alert("Éxito", "Cupón actualizado correctamente");
      loadData();

    } catch (error: any) {
      console.error("Error actualizando cupón:", error);
      const message = error.response?.data?.message || "No se pudo actualizar el cupón";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Eliminar cupón",
      "¿Estás seguro de eliminar este cupón?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await adminService.deleteCoupon(couponId);

              Alert.alert(
                "Éxito",
                "Cupón eliminado",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error: any) {
              console.error("Error eliminando cupón:", error);
              const message = error.response?.data?.message || "No se pudo eliminar el cupón";
              Alert.alert("Error", message);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const aplicarCategorias = () => {
    setFormData({ ...formData, categorias: selectedCategories });
    setShowCategorySelector(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-CL')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando cupón...</Text>
      </View>
    );
  }

  if (!coupon) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={52} color="#FF4FAF" />
        <Text style={adminStyles.loadingText}>Cupón no encontrado</Text>
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
          <Text style={adminStyles.headerTitle}>{coupon.codigo}</Text>
          <Pressable onPress={handleDelete} style={adminStyles.filterButton} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator size="small" color="#FF4FAF" />
            ) : (
              <Ionicons name="trash-outline" size={22} color="#FF4FAF" />
            )}
          </Pressable>
        </View>

        <View style={adminStyles.userStatsGrid}>
          <View style={adminStyles.userStatCard}>
            <Text style={adminStyles.userStatValue}>{coupon._count?.usos || 0}</Text>
            <Text style={adminStyles.userStatLabel}>Usos</Text>
          </View>
          <View style={adminStyles.userStatCard}>
            <Text style={adminStyles.userStatValue}>{coupon.usosMaximos}</Text>
            <Text style={adminStyles.userStatLabel}>Máximos</Text>
          </View>
          <View style={adminStyles.userStatCard}>
            <Text style={adminStyles.userStatValue}>
              {Math.round((((coupon._count?.usos || 0) / coupon.usosMaximos) * 100))}%
            </Text>
            <Text style={adminStyles.userStatLabel}>Uso</Text>
          </View>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIcon}>
              <Ionicons name="ticket-outline" size={18} color="#B7FF3C" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Editar cupón</Text>
              <Text style={adminStyles.sectionIntroText}>
                Ajusta reglas, fechas, restricciones y estado del cupón.
              </Text>
            </View>
          </View>

          <Text style={adminStyles.filterLabel}>Código *</Text>
          <TextInput
            style={adminStyles.searchBarFull}
            value={formData.codigo}
            onChangeText={(text) => setFormData({ ...formData, codigo: text.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
            autoCapitalize="characters"
          />

          <Text style={adminStyles.filterLabel}>Tipo de descuento</Text>
          <View style={adminStyles.filterOptions}>
            <Pressable
              onPress={() => setFormData({ ...formData, tipo: 'porcentaje' })}
              style={[adminStyles.filterChip, formData.tipo === 'porcentaje' && adminStyles.filterChipActive]}
            >
              <Text style={[adminStyles.filterChipText, formData.tipo === 'porcentaje' && adminStyles.filterChipTextActive]}>
                Porcentaje (%)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFormData({ ...formData, tipo: 'fijo' })}
              style={[adminStyles.filterChip, formData.tipo === 'fijo' && adminStyles.filterChipPinkActive]}
            >
              <Text style={[adminStyles.filterChipText, formData.tipo === 'fijo' && adminStyles.filterChipPinkTextActive]}>
                Monto fijo ($)
              </Text>
            </Pressable>
          </View>

          <Text style={adminStyles.filterLabel}>
            Valor {formData.tipo === 'porcentaje' ? '(%)' : '($)'} *
          </Text>
          <TextInput
            style={adminStyles.searchBarFull}
            value={formData.valor}
            onChangeText={(text) => setFormData({ ...formData, valor: text.replace(/[^0-9]/g, '') })}
            keyboardType="numeric"
          />

          <View style={adminStyles.rowFields}>
            <View style={adminStyles.rowField}>
              <Text style={adminStyles.filterLabel}>Desde</Text>
              <TextInput
                style={adminStyles.searchBar}
                value={formData.fechaInicio}
                onChangeText={(text) => setFormData({ ...formData, fechaInicio: text })}
              />
            </View>
            <View style={adminStyles.rowField}>
              <Text style={adminStyles.filterLabel}>Hasta *</Text>
              <TextInput
                style={adminStyles.searchBar}
                value={formData.fechaFin}
                onChangeText={(text) => setFormData({ ...formData, fechaFin: text })}
              />
            </View>
          </View>

          <View style={adminStyles.rowFields}>
            <View style={adminStyles.rowField}>
              <Text style={adminStyles.filterLabel}>Usos máximos *</Text>
              <TextInput
                style={adminStyles.searchBar}
                value={formData.usosMaximos}
                onChangeText={(text) => setFormData({ ...formData, usosMaximos: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
              />
            </View>
            <View style={adminStyles.rowField}>
              <Text style={adminStyles.filterLabel}>Por usuario</Text>
              <TextInput
                style={adminStyles.searchBar}
                value={formData.usosPorUsuario}
                onChangeText={(text) => setFormData({ ...formData, usosPorUsuario: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={adminStyles.filterLabel}>Monto mínimo (opcional)</Text>
          <TextInput
            style={adminStyles.searchBarFull}
            value={formData.montoMinimo}
            onChangeText={(text) => setFormData({ ...formData, montoMinimo: text.replace(/[^0-9]/g, '') })}
            keyboardType="numeric"
          />

          <Text style={adminStyles.filterLabel}>Aplicar a categorías</Text>
          <Pressable
            style={adminStyles.selectorField}
            onPress={() => {
              setSelectedCategories(formData.categorias);
              setShowCategorySelector(true);
            }}
          >
            <Text style={[adminStyles.selectorText, formData.categorias.length === 0 && adminStyles.selectorPlaceholder]}>
              {formData.categorias.length > 0
                ? `${formData.categorias.length} categorías seleccionadas`
                : "Todas las categorías"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          <View style={adminStyles.switchRow}>
            <Text style={adminStyles.filterLabel}>Cupón activo</Text>
            <Switch
              value={formData.activo}
              onValueChange={(value) => setFormData({ ...formData, activo: value })}
              trackColor={{ false: '#D1D5DB', true: '#B7FF3C' }}
              thumbColor={formData.activo ? '#1E1240' : '#FFFFFF'}
            />
          </View>

          <View style={adminStyles.filterActions}>
            <Pressable
              style={adminStyles.modalCancelButton}
              onPress={() => router.back()}
            >
              <Text style={adminStyles.modalCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={adminStyles.modalConfirmButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#1E1240" />
              ) : (
                <Text style={adminStyles.modalConfirmText}>Guardar cambios</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.historyHeader}>
            <Text style={adminStyles.userName}>Historial de uso</Text>
            <View style={adminStyles.historyBadge}>
              <Text style={adminStyles.historyBadgeText}>{coupon._count?.usos || 0} usos</Text>
            </View>
          </View>

          <Text style={adminStyles.userEmail}>
            Creado: {formatDate(coupon.createdAt)}
          </Text>
          <Text style={adminStyles.userEmail}>
            {coupon._count?.usos || 0} usos de {coupon.usosMaximos} disponibles
          </Text>

          {(coupon._count?.usos || 0) > 0 && (
            <Pressable
              style={adminStyles.userActionButton}
              onPress={async () => {
                try {
                  const usage = await adminService.getCouponUsage(couponId);
                  Alert.alert(
                    "Usos del cupón",
                    `Total: ${usage.data.total} usos\n\n` +
                    `Total descontado: ${formatCurrency(usage.data.stats.totalDescuentos)}\n` +
                    `Promedio descuento: ${formatCurrency(usage.data.stats.promedioDescuento)}`
                  );
                } catch (error) {
                  Alert.alert("Error", "No se pudo cargar el historial de usos");
                }
              }}
            >
              <Ionicons name="people-outline" size={15} color="#B7FF3C" />
              <Text style={adminStyles.userActionText}>Ver estadísticas de uso</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {showCategorySelector && (
        <View style={[adminStyles.modalOverlay, adminStyles.modalOverlayBottom]}>
          <View style={adminStyles.bottomSheetContent}>
            <Text style={adminStyles.modalTitle}>Seleccionar categorías</Text>

            {loadingCategories ? (
              <View style={adminStyles.loadingCategoriesWrap}>
                <ActivityIndicator size="large" color="#B7FF3C" />
              </View>
            ) : (
              <ScrollView style={adminStyles.categoriesScroll} showsVerticalScrollIndicator={false}>
                {categories.map(cat => (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    style={adminStyles.categoryRow}
                  >
                    <Text style={adminStyles.statText}>{cat.nombre}</Text>
                    {selectedCategories.includes(cat.id) && (
                      <Ionicons name="checkmark-circle" size={22} color="#B7FF3C" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <View style={adminStyles.modalActions}>
              <Pressable
                style={adminStyles.modalCancelButton}
                onPress={() => setShowCategorySelector(false)}
              >
                <Text style={adminStyles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={adminStyles.modalConfirmButton}
                onPress={aplicarCategorias}
                disabled={loadingCategories}
              >
                <Text style={adminStyles.modalConfirmText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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

  userStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  userStatCard: {
    width: "31.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  userStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  userStatLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: -0.1,
  },

  userCardColumn: {
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
    marginTop: 16,
  },

  sectionIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  sectionIntroIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(183,255,60,0.16)",
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

  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 6,
  },

  searchBarFull: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    marginBottom: 14,
  },

  searchBar: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
  },

  rowFields: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  rowField: {
    flex: 1,
  },

  filterOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  filterChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(183, 255, 60, 0.26)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
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

  selectorField: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    marginBottom: 14,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },

  selectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
  },

  selectorPlaceholder: {
    color: "#9CA3AF",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.34)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalOverlayBottom: {
    justifyContent: "flex-end",
    paddingHorizontal: 0,
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

  bottomSheetContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
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

  userName: {
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

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  historyBadge: {
    backgroundColor: "#FFF1F8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  historyBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  userActionButton: {
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
    marginTop: 10,
  },

  userActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  loadingCategoriesWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },

  categoriesScroll: {
    maxHeight: 400,
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.05)",
  },

  statText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
});