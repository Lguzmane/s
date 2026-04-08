//app/admin/reports/index.tsx
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
import { adminService } from "../../../services/adminService";

type ReportStats = {
  totalPendientes: number;
  porTipo: {
    tipo: 'SERVICE' | 'REVIEW';
    _count: number;
  }[];
  porEstado: {
    estado: 'pendiente' | 'revisado' | 'rechazado';
    _count: number;
  }[];
  topReportados: {
    usuario: {
      id: number;
      nombre: string;
      apellidoPaterno: string;
      email: string;
    };
    totalReportes: number;
  }[];
};

export default function AdminReports() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReportStats();

      if (response?.success && response.data) {
        setStats(response.data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      Alert.alert("Error", "No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'SERVICE': return 'briefcase';
      case 'REVIEW': return 'chatbubble';
      default: return 'alert';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#FF4FAF';
      case 'revisado': return '#1E1240';
      case 'rechazado': return '#D97706';
      default: return '#6B7280';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendientes';
      case 'revisado': return 'Revisados';
      case 'rechazado': return 'Rechazados';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <View style={adminStyles.emptyIconWrap}>
          <Ionicons name="bar-chart-outline" size={26} color="#B7FF3C" />
        </View>
        <Text style={adminStyles.loadingText}>No hay datos disponibles</Text>
        <Pressable onPress={loadStats} style={adminStyles.searchButton}>
          <Text style={adminStyles.searchButtonText}>Reintentar</Text>
        </Pressable>
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
        <Text style={adminStyles.headerTitle}>Reportes y Moderación</Text>
        <Pressable onPress={loadStats} style={adminStyles.filterButton}>
          <Ionicons name="refresh" size={22} color="#B7FF3C" />
        </Pressable>
      </View>

      {stats.totalPendientes > 0 && (
        <Pressable
          onPress={loadStats}
          style={adminStyles.alertCard}
        >
          <View style={adminStyles.alertContent}>
            <View style={adminStyles.alertIconWrap}>
              <Ionicons name="alert-circle" size={16} color="#1E1240" />
            </View>
            <View style={adminStyles.alertTextWrap}>
              <Text style={adminStyles.alertText}>
                {stats.totalPendientes} reportes pendientes de revisión
              </Text>
              <Text style={adminStyles.alertSubtext}>
                Revisa los casos con prioridad
              </Text>
            </View>
          </View>
          <Ionicons name="refresh" size={18} color="#1E1240" />
        </Pressable>
      )}

      <View style={adminStyles.statsGrid}>
        <View style={adminStyles.statCard}>
          <View style={adminStyles.statTopRow}>
            <View style={adminStyles.statIconContainer}>
              <Ionicons name="alert-circle" size={16} color="#FF4FAF" />
            </View>
            <View style={adminStyles.statDotPink} />
          </View>
          <Text style={adminStyles.statValue}>{stats.totalPendientes}</Text>
          <Text style={adminStyles.statTitle}>Pendientes</Text>
        </View>

        <View style={adminStyles.statCard}>
          <View style={adminStyles.statTopRow}>
            <View style={[adminStyles.statIconContainer, adminStyles.statIconContainerLime]}>
              <Ionicons name="checkmark-circle" size={16} color="#B7FF3C" />
            </View>
            <View style={adminStyles.statDotLime} />
          </View>
          <Text style={adminStyles.statValue}>
            {stats.porEstado.find(e => e.estado === 'revisado')?._count || 0}
          </Text>
          <Text style={adminStyles.statTitle}>Revisados</Text>
        </View>
      </View>

      <View style={adminStyles.userCardColumn}>
        <View style={adminStyles.sectionIntro}>
          <View style={adminStyles.sectionIntroIcon}>
            <Ionicons name="pie-chart-outline" size={18} color="#B7FF3C" />
          </View>
          <View style={adminStyles.sectionIntroTextWrap}>
            <Text style={adminStyles.sectionIntroTitle}>Reportes por tipo</Text>
            <Text style={adminStyles.sectionIntroText}>
              Distribución entre servicios y reseñas reportadas.
            </Text>
          </View>
        </View>

        {stats.porTipo.map((item, index) => (
          <View
            key={item.tipo}
            style={[adminStyles.simpleRow, index < stats.porTipo.length - 1 && adminStyles.simpleRowBorder]}
          >
            <View style={adminStyles.simpleRowLeft}>
              <Ionicons name={getTipoIcon(item.tipo)} size={15} color="#6B7280" />
              <Text style={adminStyles.statText}>
                {item.tipo === 'SERVICE' ? 'Servicios' : 'Reseñas'}
              </Text>
            </View>
            <Text style={adminStyles.simpleRowValue}>{item._count}</Text>
          </View>
        ))}
      </View>

      <View style={adminStyles.userCardColumn}>
        <View style={adminStyles.sectionIntro}>
          <View style={adminStyles.sectionIntroIconPink}>
            <Ionicons name="stats-chart-outline" size={18} color="#FF4FAF" />
          </View>
          <View style={adminStyles.sectionIntroTextWrap}>
            <Text style={adminStyles.sectionIntroTitle}>Reportes por estado</Text>
            <Text style={adminStyles.sectionIntroText}>
              Seguimiento del flujo de moderación.
            </Text>
          </View>
        </View>

        {stats.porEstado.map((item, index) => (
          <View
            key={item.estado}
            style={[adminStyles.simpleRow, index < stats.porEstado.length - 1 && adminStyles.simpleRowBorder]}
          >
            <Text style={[adminStyles.statText, { color: getEstadoColor(item.estado) }]}>
              {getEstadoText(item.estado)}
            </Text>
            <Text style={adminStyles.simpleRowValue}>{item._count}</Text>
          </View>
        ))}
      </View>

      {stats.topReportados.length > 0 && (
        <View style={adminStyles.userCardColumn}>
          <View style={adminStyles.sectionIntro}>
            <View style={adminStyles.sectionIntroIconPink}>
              <Ionicons name="warning-outline" size={18} color="#FF4FAF" />
            </View>
            <View style={adminStyles.sectionIntroTextWrap}>
              <Text style={adminStyles.sectionIntroTitle}>Usuarios más reportados</Text>
              <Text style={adminStyles.sectionIntroText}>
                Accesos rápidos a perfiles con mayor volumen de incidencias.
              </Text>
            </View>
          </View>

          {stats.topReportados.map((item, index) => (
            <Pressable
              key={item.usuario.id}
              onPress={() => router.push(`/admin/users/${item.usuario.id}` as Href)}
              style={[adminStyles.reportedUserRow, index < stats.topReportados.length - 1 && adminStyles.simpleRowBorder]}
            >
              <View style={adminStyles.reportedUserLeft}>
                <Text style={adminStyles.rankText}>{index + 1}.</Text>
                <View style={adminStyles.userAvatar}>
                  <Text style={adminStyles.userAvatarText}>
                    {item.usuario.nombre.charAt(0)}
                    {item.usuario.apellidoPaterno.charAt(0)}
                  </Text>
                </View>
                <View style={adminStyles.reportedUserTextWrap}>
                  <Text style={adminStyles.statText}>
                    {item.usuario.nombre} {item.usuario.apellidoPaterno}
                  </Text>
                  <Text style={adminStyles.reportedUserEmail}>
                    {item.usuario.email}
                  </Text>
                </View>
              </View>

              <View style={adminStyles.reportCountWrap}>
                <Text style={adminStyles.reportCountValue}>{item.totalReportes}</Text>
                <Text style={adminStyles.reportCountLabel}>reportes</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <View style={adminStyles.quickActionsContainer}>
        <Text style={adminStyles.sectionTitle}>Acciones rápidas</Text>
        <View style={adminStyles.quickActionsGrid}>
          <Pressable
            style={adminStyles.quickActionCard}
            onPress={loadStats}
          >
            <View style={adminStyles.quickActionIconWrap}>
              <Ionicons name="refresh" size={18} color="#B7FF3C" />
            </View>
            <Text style={adminStyles.quickActionTitle}>Actualizar</Text>
          </Pressable>
          <Pressable
            style={adminStyles.quickActionCard}
            onPress={() => router.push('/admin/reviews/reported' as Href)}
          >
            <View style={adminStyles.quickActionIconWrapPink}>
              <Ionicons name="chatbubble-outline" size={18} color="#FF4FAF" />
            </View>
            <Text style={adminStyles.quickActionTitle}>Reseñas reportadas</Text>
          </Pressable>
        </View>
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
    backgroundColor: "#F4FCE7",
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

  alertCard: {
    backgroundColor: "#FF4FAF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },

  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.38)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  alertTextWrap: {
    flex: 1,
  },

  alertText: {
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.1,
    marginBottom: 2,
  },

  alertSubtext: {
    color: "rgba(30,18,64,0.72)",
    fontSize: 12,
    fontWeight: "600",
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,79,175,0.14)",
  },

  statIconContainerLime: {
    backgroundColor: "rgba(183,255,60,0.18)",
  },

  statDotPink: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#FF4FAF",
  },

  statDotLime: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#B7FF3C",
  },

  statValue: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.4,
    marginBottom: 2,
  },

  statTitle: {
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
    marginBottom: 16,
  },

  sectionIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
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

  simpleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  simpleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.05)",
  },

  simpleRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  simpleRowValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
  },

  statText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },

  reportedUserRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  reportedUserLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  rankText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    marginRight: 8,
  },

  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  userAvatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  reportedUserTextWrap: {
    flex: 1,
  },

  reportedUserEmail: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },

  reportCountWrap: {
    alignItems: "center",
    marginLeft: 10,
  },

  reportCountValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF4FAF",
  },

  reportCountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
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

  quickActionCard: {
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

  quickActionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "rgba(183,255,60,0.18)",
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
});