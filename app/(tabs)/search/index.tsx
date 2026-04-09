// app/(tabs)/search/index.tsx
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  InteractionManager,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import ProviderCard from "../../../components/cards/ProviderCard";
import ServiceFilters, { ServiceFiltersHandle } from "../../../components/filters/ServiceFilters";
import { userService } from "../../../services/userService";
import { theme } from "../../../styles/theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_COLLAPSED = SCREEN_HEIGHT * 0.55;
const SHEET_EXPANDED = 0;
const SHEET_MIDDLE = SCREEN_HEIGHT * 0.2;

type Filters = {
  servicio: string;
  comuna: string;
  lugar: string;
  fecha: string;
};

const mapFiltersToBackend = (filters: Filters) => {
  const params: any = {};

  if (filters.servicio) {
    params.search = filters.servicio;
  }

  if (filters.comuna) params.comuna = filters.comuna;

  if (filters.lugar && filters.lugar !== "") {
    params.lugarAtencion = filters.lugar;
  }

  return params;
};

const mapFechaToDate = (fecha: string) => {
  const today = new Date();

  if (fecha === "hoy") {
    return today.toISOString().split("T")[0];
  }

  if (fecha === "3dias") {
    const future = new Date();
    future.setDate(today.getDate() + 3);
    return future.toISOString().split("T")[0];
  }

  return null;
};

function SearchScreen() {
  const params = useLocalSearchParams();

  const shouldAutofocus = params.autofocus === "1";

  const initialFilters: Filters = useMemo(
    () => ({
      servicio: typeof params.servicio === "string" ? params.servicio : "",
      comuna: typeof params.comuna === "string" ? params.comuna : "",
      lugar: typeof params.lugar === "string" ? params.lugar : "",
      fecha: typeof params.fecha === "string" ? params.fecha : "",
    }),
    [params.servicio, params.comuna, params.lugar, params.fecha]
  );

  const initialLat =
    typeof params.lat === "string" && !isNaN(Number(params.lat))
      ? Number(params.lat)
      : -33.4489;

  const initialLng =
    typeof params.lng === "string" && !isNaN(Number(params.lng))
      ? Number(params.lng)
      : -70.6693;

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const translateY = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const sheetPositionRef = useRef<number>(SHEET_COLLAPSED);
  const filtersRef = useRef<ServiceFiltersHandle>(null);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderGrant: () => {
        translateY.stopAnimation((value: number) => {
          sheetPositionRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        let nextPosition = sheetPositionRef.current + gestureState.dy;
        if (nextPosition < SHEET_EXPANDED) nextPosition = SHEET_EXPANDED;
        if (nextPosition > SHEET_COLLAPSED) nextPosition = SHEET_COLLAPSED;
        translateY.setValue(nextPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        const goingUp = gestureState.dy < -30;
        const goingDown = gestureState.dy > 30;

        let finalPosition = sheetPositionRef.current;

        if (goingUp) {
          finalPosition = SHEET_EXPANDED;
        } else if (goingDown) {
          finalPosition = SHEET_COLLAPSED;
        } else {
          if (sheetPositionRef.current < SHEET_MIDDLE / 2) {
            finalPosition = SHEET_EXPANDED;
          } else if (sheetPositionRef.current < (SHEET_MIDDLE + SHEET_COLLAPSED) / 2) {
            finalPosition = SHEET_MIDDLE;
          } else {
            finalPosition = SHEET_COLLAPSED;
          }
        }

        sheetPositionRef.current = finalPosition;
        Animated.spring(translateY, {
          toValue: finalPosition,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const animateSheetTo = (toValue: number, cb?: () => void) => {
    sheetPositionRef.current = toValue;
    Animated.spring(translateY, { toValue, useNativeDriver: true }).start(() => cb?.());
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!shouldAutofocus) return;
      animateSheetTo(SHEET_MIDDLE, () => {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => filtersRef.current?.focusFirst(), 50);
        });
      });
    }, [shouldAutofocus])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (shouldAutofocus) return;
      animateSheetTo(SHEET_COLLAPSED);
    }, [shouldAutofocus])
  );

  const handleBuscar = async () => {
    setHasSearched(true);
    setLoading(true);

    try {
      const backendParams: any = {
        ...mapFiltersToBackend(filters),
        lat: initialLat,
        lng: initialLng,
        limit: 20,
      };

      const fechaMapped = mapFechaToDate(filters.fecha);
      if (fechaMapped) {
        backendParams.fecha = fechaMapped;
      }

      const response = await userService.getProfessionals(backendParams);

      let data = Array.isArray(response?.data) ? response.data : [];

      if (data.length === 0) {
        const fallbackParams: any = {
          ...mapFiltersToBackend(filters),
          limit: 20,
        };

        if (fechaMapped) {
          fallbackParams.fecha = fechaMapped;
        }

        const fallbackResponse = await userService.getProfessionals(fallbackParams);

        data = Array.isArray(fallbackResponse?.data) ? fallbackResponse.data : [];
      }

      setResultados(data);
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <MapView
          style={styles.map}
          region={{
            latitude: initialLat,
            longitude: initialLng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {hasSearched &&
            resultados.slice(0, 15).map((p) => {
              const lat = Number(p.lat);
              const lng = Number(p.lng);

              if (!isNaN(lat) && !isNaN(lng)) {
                return (
                  <Marker
                    key={p.id}
                    coordinate={{ latitude: lat, longitude: lng }}
                    title={`${p.nombre} ${p.apellidoPaterno || ""}`}
                    description={typeof p.categoria === "string" ? p.categoria : ""}
                  />
                );
              }

              return null;
            })}
        </MapView>
      ) : (
        <View style={styles.map} />
      )}

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.bottomSheet, { transform: [{ translateY }] }]}
      >
        <View style={styles.sheetSurface}>
          <View style={styles.handle} />

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Buscar servicios</Text>

            <ServiceFilters
              ref={filtersRef}
              filters={filters}
              setFilters={setFilters}
              autoFocus={shouldAutofocus}
            />

            <Pressable onPress={handleBuscar} style={styles.searchBtn}>
              <Text style={styles.searchBtnLabel}>Buscar</Text>
            </Pressable>

            <View style={styles.resultsBox}>
              {!hasSearched ? null : loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>
                    Cargando profesionales...
                  </Text>
                </View>
              ) : resultados.length > 0 ? (
                resultados.slice(0, 20).map((profesional) => (
                  <View key={profesional.id} style={styles.cardWrapper}>
                    <ProviderCard
                      provider={{
                        id: profesional.id,
                        nombre: profesional.nombre,
                        apellidoPaterno: profesional.apellidoPaterno,
                        foto: profesional.fotoPerfil,
                        categoria: profesional.categoria,
                        rating: profesional.rating,
                        cantidadOpiniones: profesional.cantidadOpiniones,
                        destacado: profesional.destacado,
                        ubicacion: profesional.ubicacion,
                        lugarAtencion: profesional.lugarAtencion,
                        portafolio:
                          profesional.portfolio?.map((p: any) => p.imagenUrl) || [],
                      }}
                    />
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No se encontraron profesionales con los filtros seleccionados.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  bottomSheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 12,
    // Permite que dropdowns/autocomplete puedan "flotar" sin recortarse.
    overflow: "visible",
  },

  sheetSurface: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "visible",
  },

  handle: {
    alignSelf: "center",
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    marginTop: 10,
    marginBottom: 0,
    zIndex: 2,
    position: "absolute",
    top: 0,
  },

  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 18,
    letterSpacing: -0.4,
    marginHorizontal: -20,
    marginTop: 0,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 22,
    paddingRight: 20,
    backgroundColor: "#1E1240",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  searchBtn: {
    backgroundColor: "#14B8A6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },

  searchBtnLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  resultsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    minHeight: 120,
  },

  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 26,
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  cardWrapper: {
    marginBottom: 12,
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingVertical: 18,
    fontWeight: "500",
  },
});

export default SearchScreen;