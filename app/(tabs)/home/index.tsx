//app/(tabs)/home/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Image,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ServiceCard from "../../../components/cards/ServiceCard";
import { AuthContext } from "../../../context/AuthContext";
import { serviceService } from "../../../services/serviceService";
import { favoriteService } from "../../../services/favoriteService";
import api from "../../../services/api";

type Filters = {
  servicio: string;
  comuna: string;
  lugar: string;
  fecha: string;
};

type NextBooking = {
  id: number | string;
  fecha?: string;
  hora?: string;
  servicio?: string;
  profesional?: string;
  estado?: string;
  direccion?: string;
};

type PendingRequest = {
  id: number | string;
  cliente?: string;
  servicio?: string;
  fecha?: string;
  hora?: string;
  estado?: string;
};

type UserStats = {
  totalServicios: number;
  totalReservasCliente: number;
  totalReservasProfesional: number;
  reservasPendientes: number;
  reservasCompletadas: number;
  totalFavoritos: number;
};

export default function Home() {
  const auth = useContext(AuthContext) as any;
  const { user } = auth || {};
  const insets = useSafeAreaInsets();

  const isPro = user?.rol === "Profesional";

  const [filters] = useState<Filters>({
    servicio: "",
    comuna: "",
    lugar: "",
    fecha: "",
  });

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [nextBooking, setNextBooking] = useState<NextBooking | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleAuthAction = (action: () => void) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    action();
  };

  const fmtFecha = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);

    if (isNaN(d.getTime())) return "";

    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const parseBookingDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const loadUnreadCount = useCallback(async () => {
    if (!user || !user.emailConfirmado) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get("/api/notifications/unread-count");
      const count =
        response?.data?.count ??
        response?.data?.data?.count ??
        response?.data?.unreadCount ??
        0;

      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error("Error cargando contador de notificaciones:", error);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    const loadNext = async () => {
      if (!user || !user.emailConfirmado) {
        setNextBooking(null);
        return;
      }

      try {
        setLoadingNext(true);

        const response = await api.get("/api/bookings/my-bookings", {
          params: { tipo: "cliente" },
        });

        if (!response.data?.success || !Array.isArray(response.data.data)) {
          setNextBooking(null);
          return;
        }

        const bookings = response.data.data;

        const pendingBookings = bookings.filter((b: any) => {
          const fechaObj = parseBookingDate(b.fechaHora);
          return b.estado === "pendiente" && fechaObj;
        });

        if (pendingBookings.length === 0) {
          setNextBooking(null);
          return;
        }

        const sorted = pendingBookings.sort((a: any, b: any) => {
          const dateA = parseBookingDate(a.fechaHora);
          const dateB = parseBookingDate(b.fechaHora);
          return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
        });

        const next = sorted[0];
        const fechaObj = parseBookingDate(next.fechaHora);

        if (!fechaObj) {
          setNextBooking(null);
          return;
        }

        const normalized: NextBooking = {
          id: next.id,
          fecha: fechaObj.toISOString(),
          hora: fechaObj.toTimeString().slice(0, 5),
          servicio: next.servicio?.nombre || "Servicio",
          profesional: next.profesional
            ? `${next.profesional.nombre || ""} ${next.profesional.apellidoPaterno || ""}`.trim()
            : "",
          estado: next.estado,
          direccion: next.direccionServicio || "",
        };

        setNextBooking(normalized);
      } catch (e) {
        console.error("Error cargando próxima reserva:", e);
        setNextBooking(null);
      } finally {
        setLoadingNext(false);
      }
    };

    loadNext();
  }, [user]);

  useEffect(() => {
    const loadPendingRequests = async () => {
      if (!isPro || !user || !user.emailConfirmado) {
        setPendingRequests([]);
        return;
      }

      try {
        setLoadingRequests(true);

        const response = await api.get("/api/bookings/my-bookings", {
          params: { tipo: "profesional" },
        });

        if (!response.data?.success || !Array.isArray(response.data.data)) {
          setPendingRequests([]);
          return;
        }

        const bookings = response.data.data;

        const pending = bookings.filter((b: any) => {
          const fechaObj = parseBookingDate(b.fechaHora);
          return b.estado === "pendiente" && fechaObj;
        });

        const requests = pending.map((b: any) => {
          const fechaObj = parseBookingDate(b.fechaHora);

          return {
            id: b.id,
            cliente: b.cliente
              ? `${b.cliente.nombre || ""} ${b.cliente.apellidoPaterno || ""}`.trim()
              : "Cliente",
            servicio: b.servicio?.nombre || "Servicio",
            fecha: fechaObj ? fechaObj.toISOString() : "",
            hora: fechaObj ? fechaObj.toTimeString().slice(0, 5) : "",
            estado: b.estado,
          };
        });

        setPendingRequests(requests);
      } catch (e) {
        console.error("Error cargando solicitudes pendientes:", e);
        setPendingRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadPendingRequests();
  }, [user, isPro]);

  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) {
        setUserStats(null);
        return;
      }
      try {
        setLoadingStats(true);
        const response = await api.get("/api/users/stats/me");

        if (response.data?.success && response.data?.data) {
          setUserStats(response.data.data);
        } else {
          setUserStats(null);
        }
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        setUserStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    loadUserStats();
  }, [user]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user || !user.emailConfirmado) {
        setFavoriteIds([]);
        return;
      }

      try {
        const favoritos = await favoriteService.getMyFavorites();
        const ids = favoritos.map((f: any) => String(f.servicioId));
        setFavoriteIds(ids);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
        setFavoriteIds([]);
      }
    };

    loadFavorites();
  }, [user]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await serviceService.getAllServices(1, 8);

        if (response?.success && Array.isArray(response.data)) {
          setRecommendedServices(response.data);
        } else {
          console.warn("Respuesta inválida en servicios:", response);
          setRecommendedServices([]);
        }
      } catch (error) {
        console.error("Error cargando servicios:", error);
        setRecommendedServices([]);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({});

        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (error) {
        console.log("Error obteniendo ubicación", error);
      }
    };

    getLocation();
  }, []);

  const toggleFavorite = async (servicioId: string) => {
    if (!user || !user.emailConfirmado) {
      router.push("/auth/login");
      return;
    }

    try {
      const result = await favoriteService.toggleFavorite(servicioId);

      if (result.isFavorite) {
        setFavoriteIds((prev) => [...prev, String(servicioId)]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== String(servicioId)));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const goSearch = () => {
    InteractionManager.runAfterInteractions(() => {
      const qs = new URLSearchParams({
        ...filters,
        lat: location?.lat?.toString() || "",
        lng: location?.lng?.toString() || "",
        autofocus: "1",
      } as any).toString();

      router.push(`/(tabs)/search?${qs}`);
    });
  };

  const goNotifications = () => {
    handleAuthAction(() => router.push("/(tabs)/account/notifications" as any));
  };

  const goFavorites = () =>
    handleAuthAction(() => router.push("/(tabs)/account/favorites" as any));

  const goAllBookings = () =>
    handleAuthAction(() => router.push("/(tabs)/account/history" as any));

  const goClientHistory = () =>
    handleAuthAction(() => router.push("/(tabs)/account/history" as any));

  const goMyServices = () =>
    handleAuthAction(() => router.push("/(tabs)/account/profile/myservices" as any));

  const goAgenda = () =>
    handleAuthAction(() => router.push("/(tabs)/account/profile/schedule" as any));

  const goHistoryPro = () =>
    handleAuthAction(() => router.push("/(tabs)/account/history-pro" as any));

  const goPortfolio = () =>
    handleAuthAction(() => router.push("/(tabs)/account/profile/portfolio" as any));

  const goPendingRequests = () =>
    handleAuthAction(() => router.push("/(tabs)/account/profile/requests" as any));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.greetingBox, { paddingTop: insets.top + 18 }]}>
        <View style={styles.headerTopRow}>
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.greetingName}>{user?.nombre || "invitado"}</Text>
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir notificaciones"
            onPress={goNotifications}
            style={styles.notificationButton}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" style={styles.notificationIcon} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={goSearch}
          style={styles.searchBar}
          hitSlop={8}
        >
          <Ionicons name="search-outline" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>¿Qué servicio estás buscando?</Text>
        </Pressable>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitleCliente}>Experiencia cliente</Text>

        <Pressable
          onPress={goAllBookings}
          style={styles.nextBookingCard}
          accessibilityRole="button"
          accessibilityLabel="Ver próximas reservas"
        >
          <View style={styles.nextBookingHeader}>
            <Ionicons name="calendar-outline" style={styles.nextBookingIcon} />
            <Text style={styles.nextBookingTitle}>Próxima cita</Text>
          </View>

          {loadingNext ? (
            <Text style={styles.nextBookingMuted}>Cargando…</Text>
          ) : nextBooking ? (
            <View style={styles.nextBookingBody}>
              <Text style={styles.nextBookingService}>
                {nextBooking.servicio || "Servicio"}
              </Text>
              <Text style={styles.nextBookingMeta}>
                {fmtFecha(nextBooking.fecha)}
                {nextBooking.hora ? ` · ${nextBooking.hora}` : ""}
              </Text>
              {nextBooking.profesional ? (
                <Text style={styles.nextBookingMuted}>
                  con {nextBooking.profesional}
                </Text>
              ) : null}
              {nextBooking.estado ? (
                <View style={styles.nextBookingChip}>
                  <Text style={styles.nextBookingChipText}>
                    {nextBooking.estado}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.nextBookingEmpty}>
              <Text style={styles.nextBookingMuted}>
                {user ? "No tienes próximas citas" : "Inicia sesión para ver tus citas"}
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.actionsGrid}>
          <Pressable
            accessibilityRole="button"
            onPress={goFavorites}
            style={[styles.actionCard, styles.actionCardCliente]}
            android_ripple={{ color: "#00000010", borderless: false }}
          >
            <Ionicons name="heart-outline" style={[styles.actionIcon, styles.actionIconCliente]} />
            <Text style={[styles.actionLabel, styles.actionLabelCliente]}>
              Favoritos
              {userStats && userStats.totalFavoritos > 0 && (
                <Text style={{ color: "#65f7f7", fontWeight: "bold" }}>
                  {" "}({userStats.totalFavoritos})
                </Text>
              )}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={goClientHistory}
            style={[styles.actionCard, styles.actionCardCliente]}
            android_ripple={{ color: "#00000010", borderless: false }}
          >
            <Ionicons name="book-outline" style={[styles.actionIcon, styles.actionIconCliente]} />
            <Text style={[styles.actionLabel, styles.actionLabelCliente]}>
              Historial
              {!isPro && userStats && userStats.reservasPendientes > 0 && (
                <Text style={{ color: "#65f7f7", fontWeight: "bold" }}>
                  {" "}({userStats.reservasPendientes})
                </Text>
              )}
            </Text>
          </Pressable>
        </View>
      </View>

      {isPro && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitlePro}>Experiencia pro</Text>

          <Pressable
            onPress={goPendingRequests}
            style={styles.pendingCard}
            accessibilityRole="button"
            accessibilityLabel="Ver solicitudes pendientes"
          >
            <View style={styles.pendingHeader}>
              <View style={styles.pendingTitleRow}>
                <Ionicons name="time-outline" style={styles.pendingIcon} />
                <Text style={styles.pendingTitle}>Solicitudes pendientes</Text>
              </View>

              {pendingRequests.length > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>
                    {pendingRequests.length}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.pendingBody}>
              {loadingRequests ? (
                <Text style={styles.pendingMuted}>Cargando…</Text>
              ) : pendingRequests.length > 0 ? (
                <Text style={styles.pendingText}>
                  Tienes {pendingRequests.length} solicitud
                  {pendingRequests.length !== 1 ? "es" : ""} esperando tu confirmación.
                </Text>
              ) : (
                <Text style={styles.pendingMuted}>
                  No tienes solicitudes pendientes por ahora.
                </Text>
              )}
            </View>
          </Pressable>

          <View style={styles.actionsGrid}>
            <Pressable
              accessibilityRole="button"
              onPress={goMyServices}
              style={[styles.actionCard, styles.actionCardPro]}
              android_ripple={{ color: "#00000010", borderless: false }}
            >
              <Ionicons name="briefcase-outline" style={[styles.actionIcon, styles.actionIconPro]} />
              <Text style={[styles.actionLabel, styles.actionLabelPro]}>
                Mis servicios
                {userStats && userStats.totalServicios > 0 && (
                  <Text style={{ color: "#F59E0B", fontWeight: "bold" }}>
                    {" "}({userStats.totalServicios})
                  </Text>
                )}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={goAgenda}
              style={[styles.actionCard, styles.actionCardPro]}
              android_ripple={{ color: "#00000010", borderless: false }}
            >
              <Ionicons name="calendar-outline" style={[styles.actionIcon, styles.actionIconPro]} />
              <Text style={[styles.actionLabel, styles.actionLabelPro]}>Agenda</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={goHistoryPro}
              style={[styles.actionCard, styles.actionCardPro]}
              android_ripple={{ color: "#00000010", borderless: false }}
            >
              <Ionicons name="time-outline" style={[styles.actionIcon, styles.actionIconPro]} />
              <Text style={[styles.actionLabel, styles.actionLabelPro]}>
                Historial pro
                {userStats && userStats.reservasCompletadas > 0 && (
                  <Text style={{ color: "#F59E0B", fontWeight: "bold" }}>
                    {" "}({userStats.reservasCompletadas})
                  </Text>
                )}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={goPortfolio}
              style={[styles.actionCard, styles.actionCardPro]}
              android_ripple={{ color: "#00000010", borderless: false }}
            >
              <Ionicons name="images-outline" style={[styles.actionIcon, styles.actionIconPro]} />
              <Text style={[styles.actionLabel, styles.actionLabelPro]}>Portafolio</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendados para ti</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedCarousel}
        >
          {recommendedServices.map((servicio) =>
            servicio?.nombre ? (
              <View key={servicio.id} style={styles.recommendedCardWrap}>
                <ServiceCard
                  service={servicio}
                  compact={false}
                  showFavorite={false}
                />
              </View>
            ) : null
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.tipsContainer}>
          <View style={styles.tipsContent}>
            <Text style={styles.sectionTitle}>Tips para clientes</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Lee con atención las condiciones del servicio.</Text>
              <Text style={styles.tipItem}>• Revisa el portafolio y opiniones de otros clientes.</Text>
              <Text style={styles.tipItem}>• Llega puntual a tu cita.</Text>
              <Text style={styles.tipItem}>• Confirma tu reserva a tiempo.</Text>
            </View>
          </View>

          <View style={styles.tipsImageBox}>
            <Image
              source={require("../../../assets/images/tips.png")}
              style={styles.tipsImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {!isPro && (
        <View style={[styles.section, styles.mbBottom]}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>¿Ofreces servicios?</Text>
            <Text style={styles.ctaText}>Únete a SMarket y crece con nosotros.</Text>
            <Pressable
              onPress={() => router.push("/auth/register")}
              style={styles.buttonPrimary}
            >
              <Text style={styles.buttonPrimaryLabel}>Comenzar ahora</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
  },

  greetingBox: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  greetingText: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 18,
  },

  greetingName: {
    color: "#65F7F7",
  },

  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1240",
    borderWidth: 1,
    borderColor: "#F59E0B",
    marginBottom: 18,
    position: "relative",
  },

  notificationIcon: {
    fontSize: 20,
    color: "#F59E0B",
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#65F7F7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    color: "#1E1240",
    fontSize: 10,
    fontWeight: "700",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#65F7F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 0,
  },

  searchIcon: {
    fontSize: 22,
    color: "#65F7F7",
    opacity: 0.95,
    marginRight: 12,
  },

  searchPlaceholder: {
    color: "#6B7280",
    fontSize: 17,
    fontWeight: "500",
  },

  searchChipText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "400",
  },

  sectionBlock: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 24,
  },

  sectionBlockTight: {
    paddingBottom: 0,
    marginBottom: 16,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  sectionTitleCliente: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  sectionTitlePro: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  actionCard: {
    width: "48%",
    height: 84,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    backgroundColor: "#1E1240",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 6,
  },

  actionCardCliente: {
    backgroundColor: "#1E1240",
    borderColor: "#65F7F7",
  },

  actionCardPro: {
    backgroundColor: "#1E1240",
    borderColor: "#F59E0B",
  },

  actionCardGhost: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  actionIcon: {
    fontSize: 28,
    opacity: 1,
  },

  actionIconCliente: {
    color: "#65F7F7",
  },

  actionIconPro: {
    color: "#F59E0B",
  },

  actionLabel: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "700",
  },

  actionLabelCliente: {
    color: "#65F7F7",
  },

  actionLabelPro: {
    color: "#F59E0B",
  },

  actionCardDisabled: {
    opacity: 0.55,
  },

  nextBookingCard: {
    backgroundColor: "#1E1240",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#65F7F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },

  nextBookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  nextBookingIcon: {
    fontSize: 22,
    color: "#65F7F7",
    opacity: 1,
    marginRight: 8,
  },

  nextBookingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#65F7F7",
  },

  nextBookingBody: {
    marginTop: 4,
  },

  nextBookingService: {
    fontSize: 16,
    fontWeight: "700",
    color: "#65F7F7",
    marginBottom: 2,
  },

  nextBookingMeta: {
    color: "#65F7F7",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 4,
    opacity: 0.88,
  },

  nextBookingMuted: {
    color: "#65F7F7",
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.88,
  },

  nextBookingChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#1E1240",
    borderWidth: 1,
    borderColor: "#65F7F7",
    marginTop: 4,
  },

  nextBookingChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#65F7F7",
  },

  nextBookingEmpty: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nextBookingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1240",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  nextBookingPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#65F7F7",
    marginRight: 4,
  },

  nextBookingPillIcon: {
    fontSize: 16,
    color: "#65F7F7",
    opacity: 0.8,
  },

  pendingCard: {
    backgroundColor: "#1E1240",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },

  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  pendingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pendingIcon: {
    fontSize: 22,
    color: "#F59E0B",
    opacity: 1,
  },

  pendingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
  },

  pendingBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  pendingBadgeText: {
    color: "#1E1240",
    fontSize: 12,
    fontWeight: "700",
  },

  pendingBody: {
    marginTop: 4,
  },

  pendingText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.9,
  },

  pendingMuted: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.9,
  },

  listGap: {
    rowGap: 12,
  },

  recommendedCarousel: {
    paddingRight: 20,
  },

  recommendedCardWrap: {
    width: 178,
    marginRight: 12,
  },

  ctaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  ctaTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  ctaText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 12,
  },

  mbBottom: {
    marginBottom: 32,
  },

  tipsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  tipsContent: {
    flex: 1,
  },

  tipsList: {
    marginTop: 8,
    rowGap: 4,
  },

  tipItem: {
    color: "#111827",
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: "400",
  },

  tipsImagePlaceholder: {
    flexBasis: "40%",
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },

  tipsImageBox: {
    width: 100,
    height: 170,
    borderRadius: 12,
    overflow: "hidden",
  },

  tipsImage: {
    width: "100%",
    height: "100%",
  },

  buttonPrimary: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPrimaryLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});