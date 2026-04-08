//app/admin/coupons/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  categorias: number[] | null;
  activo: boolean;
  createdAt: string;
  _count?: {
    usos: number;
  };
};

export default function AdminCoupons() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCoupons();
      setCoupons(response.data);
    } catch (error) {
      console.error("Error cargando cupones:", error);
      Alert.alert("Error", "No se pudieron cargar los cupones");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-CL')}`;
  };

  const getEstadoBadge = (coupon: Coupon) => {
    const hoy = new Date();
    const fin = new Date(coupon.fechaFin);
    const usosActuales = coupon._count?.usos || 0;

    if (!coupon.activo) return { bg: '#FFF1F8', text: '#FF4FAF', label: 'Inactivo' };
    if (fin < hoy) return { bg: '#FFF6E8', text: '#D97706', label: 'Expirado' };
    if (usosActuales >= coupon.usosMaximos) return { bg: '#FFF1F8', text: '#FF4FAF', label: 'Agotado' };
    return { bg: '#F4FCE7', text: '#1E1240', label: 'Activo' };
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando cupones...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={adminStyles.screen}
      contentContainerStyle={[adminStyles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={adminStyles.header}>
        <Pressable onPress={() => router.back()} style={adminStyles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={adminStyles.headerTitle}>Cupones</Text>
        <Pressable
          onPress={() => router.push("/admin/coupons/create" as Href)}
          style={adminStyles.filterButton}
        >
          <Ionicons name="add" size={22} color="#B7FF3C" />
        </Pressable>
      </View>

      <View style={adminStyles.resultsCount}>
        <Text style={adminStyles.resultsCountText}>
          {coupons.length} cupones
        </Text>
        <Pressable onPress={loadCoupons} style={adminStyles.refreshButton}>
          <Ionicons name="refresh" size={16} color="#FF4FAF" />
        </Pressable>
      </View>

      <View style={adminStyles.usersList}>
        {coupons.map((coupon) => {
          const estado = getEstadoBadge(coupon);
          const usosActuales = coupon._count?.usos || 0;

          return (
            <Pressable
              key={coupon.id}
              onPress={() => router.push(`/admin/coupons/${coupon.id}` as Href)}
              style={adminStyles.userCard}
            >
              <View style={adminStyles.userAvatar}>
                <Ionicons name="pricetag-outline" size={20} color="#B7FF3C" />
              </View>

              <View style={adminStyles.userInfo}>
                <View style={adminStyles.userHeader}>
                  <Text style={adminStyles.userName}>{coupon.codigo}</Text>
                  <View style={[adminStyles.rolBadge, { backgroundColor: estado.bg }]}>
                    <Text style={[adminStyles.rolBadgeText, { color: estado.text }]}>
                      {estado.label}
                    </Text>
                  </View>
                </View>

                <Text style={adminStyles.userEmail}>
                  {coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : formatCurrency(coupon.valor)}
                  {coupon.montoMinimo > 0 && ` • Mín: ${formatCurrency(coupon.montoMinimo)}`}
                </Text>

                <View style={adminStyles.userStats}>
                  <View style={adminStyles.statItem}>
                    <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.statText}>
                      {formatDate(coupon.fechaInicio)} - {formatDate(coupon.fechaFin)}
                    </Text>
                  </View>
                </View>

                <View style={adminStyles.userStats}>
                  <View style={adminStyles.statItem}>
                    <Ionicons name="people-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.statText}>
                      {usosActuales}/{coupon.usosMaximos} usos
                    </Text>
                  </View>
                  <View style={adminStyles.statItem}>
                    <Ionicons name="repeat-outline" size={13} color="#6B7280" />
                    <Text style={adminStyles.statText}>
                      {coupon.usosPorUsuario} por usuario
                    </Text>
                  </View>
                </View>

                {coupon.categorias && coupon.categorias.length > 0 ? (
                  <View style={adminStyles.userBadges}>
                    <View style={adminStyles.categoryBadge}>
                      <Text style={adminStyles.categoryBadgeText}>Categorías específicas</Text>
                    </View>
                  </View>
                ) : (
                  <View style={adminStyles.userBadges}>
                    <View style={adminStyles.categoryBadgePink}>
                      <Text style={adminStyles.categoryBadgePinkText}>Todas las categorías</Text>
                    </View>
                  </View>
                )}
              </View>

              <Ionicons name="chevron-forward" size={18} color="#C4C7D0" />
            </Pressable>
          );
        })}
      </View>
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
    marginBottom: 8,
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
    marginTop: 2,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F4FCE7",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  categoryBadgePink: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1F8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  categoryBadgePinkText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },
});