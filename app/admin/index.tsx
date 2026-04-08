////app/admin/index.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { adminService } from "../../services/adminService";
import { AuthContext } from "../../context/AuthContext";

type Stats = {
  totalUsers: number;
  newUsersToday: number;
  totalServices: number;
  pendingServices: number;
  totalBookings: number;
  totalReviews: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportedReviews, setReportedReviews] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, reviewsResponse] = await Promise.all([
        adminService.getStats(),
        adminService.getReportedReviews()
      ]);
      setStats(statsResponse.data);
      setReportedReviews(reviewsResponse.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[adminStyles.screen, adminStyles.centerContent]}>
        <ActivityIndicator size="large" color="#B7FF3C" />
        <Text style={adminStyles.loadingText}>Cargando panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={adminStyles.screen} contentContainerStyle={adminStyles.content} showsVerticalScrollIndicator={false}>
      <View style={adminStyles.header}>
        <Text style={adminStyles.headerTitle}>Panel de Administración</Text>
        <View style={adminStyles.headerSpacer} />
      </View>

      <View style={adminStyles.welcomeContainer}>
        <Text style={adminStyles.welcomeText}>
          Hola, <Text style={adminStyles.welcomeName}>{user?.nombre}</Text>
        </Text>
        <Text style={adminStyles.welcomeSubtext}>
          Administra SMarket desde un solo lugar
        </Text>
      </View>

      <View style={adminStyles.statsContainer}>
        <Text style={adminStyles.sectionTitle}>Resumen general</Text>

        <View style={adminStyles.statsGrid}>
          <StatCard
            title="Usuarios"
            value={stats?.totalUsers || 0}
            icon="users"
            color="#B7FF3C"
            onPress={() => router.push("/admin/users" as Href)}
          />
          <StatCard
            title="Nuevos hoy"
            value={stats?.newUsersToday || 0}
            icon="user-plus"
            color="#FF4FAF"
            onPress={() => router.push("/admin/users" as Href)}
          />
          <StatCard
            title="Servicios"
            value={stats?.totalServices || 0}
            icon="briefcase"
            color="#B7FF3C"
            onPress={() => router.push("/admin/services" as Href)}
          />
          <StatCard
            title="Pendientes"
            value={stats?.pendingServices || 0}
            icon="clock-o"
            color="#FF4FAF"
            onPress={() => router.push("/admin/services?status=pending" as Href)}
          />
          <StatCard
            title="Reservas"
            value={stats?.totalBookings || 0}
            icon="calendar"
            color="#B7FF3C"
            onPress={() => router.push("/admin/bookings" as Href)}
          />
          <StatCard
            title="Reseñas"
            value={stats?.totalReviews || 0}
            icon="star"
            color="#FF4FAF"
            onPress={() => router.push("/admin/reviews" as Href)}
          />
        </View>
      </View>

      {(stats?.totalReviews || 0) > 0 && (
        <View style={adminStyles.alertsContainer}>
          <Text style={adminStyles.sectionTitle}>Alertas</Text>

          <TouchableOpacity
            onPress={() => router.push("/admin/reviews" as Href)}
            style={adminStyles.alertCard}
            activeOpacity={0.9}
          >
            <View style={adminStyles.alertContent}>
              <View style={adminStyles.alertIconWrap}>
                <FontAwesome name="exclamation-triangle" size={15} color="#1E1240" />
              </View>
              <View style={adminStyles.alertTextWrap}>
                <Text style={adminStyles.alertText}>
                  {stats?.totalReviews} reseñas reportadas
                </Text>
                <Text style={adminStyles.alertSubtext}>
                  Requieren revisión del equipo admin
                </Text>
              </View>
            </View>
            <FontAwesome name="angle-right" size={20} color="#1E1240" />
          </TouchableOpacity>
        </View>
      )}

      {reportedReviews.length > 0 && (
        <View style={adminStyles.reviewsContainer}>
          <View style={adminStyles.reviewsHeader}>
            <Text style={adminStyles.sectionTitle}>Últimas reportadas</Text>
            <TouchableOpacity onPress={() => router.push("/admin/reviews" as Href)}>
              <Text style={adminStyles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {reportedReviews.map((review: any) => (
            <TouchableOpacity
              key={review.id}
              onPress={() => router.push(`/admin/reviews/${review.id}` as Href)}
              style={adminStyles.reviewCard}
              activeOpacity={0.9}
            >
              <View style={adminStyles.reviewTopRow}>
                <Text style={adminStyles.reviewServiceName} numberOfLines={1}>
                  {review.serviceName}
                </Text>
                <View style={adminStyles.reviewBadge}>
                  <Text style={adminStyles.reviewBadgeText}>{review.reportCount} reportes</Text>
                </View>
              </View>

              <Text style={adminStyles.reviewComment} numberOfLines={2}>
                "{review.comment}"
              </Text>

              <View style={adminStyles.reviewFooter}>
                <Text style={adminStyles.reviewRating}>⭐ {review.rating}</Text>
                <Text style={adminStyles.reviewAction}>Revisar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={adminStyles.quickActionsContainer}>
        <Text style={adminStyles.sectionTitle}>Acciones rápidas</Text>

        <View style={adminStyles.quickActionsGrid}>
          <QuickAction
            title="Categoría"
            icon="plus-circle"
            color="#B7FF3C"
            onPress={() => router.push("/admin/categories/create" as Href)}
          />
          <QuickAction
            title="Reportes"
            icon="flag"
            color="#FF4FAF"
            onPress={() => router.push("/admin/reports" as Href)}
          />
          <QuickAction
            title="Config."
            icon="cog"
            color="#B7FF3C"
            onPress={() => router.push("/admin/settings" as Href)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[adminStyles.statCard, { borderColor: color + "22" }]}
      activeOpacity={0.9}
    >
      <View style={adminStyles.statTopRow}>
        <View style={[adminStyles.statIconContainer, { backgroundColor: color + "22" }]}>
          <FontAwesome name={icon} size={16} color={color} />
        </View>
        <View style={[adminStyles.statDot, { backgroundColor: color }]} />
      </View>
      <Text style={adminStyles.statValue}>{value}</Text>
      <Text style={adminStyles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ title, icon, color, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={adminStyles.quickActionCard}
      activeOpacity={0.9}
    >
      <View style={[adminStyles.quickActionIconWrap, { backgroundColor: color + "22" }]}>
        <FontAwesome name={icon} size={18} color={color} />
      </View>
      <Text style={adminStyles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
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
    justifyContent: "center",
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

  welcomeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 4,
  },

  welcomeName: {
    color: "#1E1240",
  },

  welcomeSubtext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: -0.1,
  },

  statsContainer: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 0,
    borderWidth: 1,
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
  },

  statDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
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

  alertsContainer: {
    marginBottom: 18,
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

  reviewsContainer: {
    marginBottom: 18,
  },

  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },

  reviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  reviewServiceName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },

  reviewBadge: {
    backgroundColor: "#FFF1F8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  reviewBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF4FAF",
    letterSpacing: -0.1,
  },

  reviewComment: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
    marginBottom: 10,
  },

  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  reviewRating: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
  },

  reviewAction: {
    fontSize: 12,
    fontWeight: "800",
    color: "#B7FF3C",
  },

  quickActionsContainer: {
    marginBottom: 8,
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
  },

  quickActionTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },
});