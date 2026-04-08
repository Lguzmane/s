// app/profile/myservices.tsx
import { Link } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ServiceCard from "../../../../components/cards/ServiceCard";
import { AuthContext } from "../../../../context/AuthContext";
import { serviceService } from "../../../../services/serviceService";

export default function MyServicesScreen() {
  const { user } = useContext(AuthContext) as any;
  const [useMockData] = useState(false);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar servicios reales cuando se desactiva el modo mock
  useEffect(() => {
    const loadRealServices = async () => {
      if (!useMockData && user?.id) {
        setLoading(true);
        try {
          // 👇 Usamos el endpoint real con el ID del usuario
          const response = await serviceService.getMyServices(user.id);
          setRealServices(response.data || []);
        } catch (error) {
          console.error("Error cargando servicios:", error);
          setRealServices([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadRealServices();
  }, [useMockData, user]);

  const { services, isPro, hasServices } = useMemo(() => {
    const userServices = realServices;

    return {
      services: userServices,
      isPro: user?.rol === "Profesional",
      hasServices: userServices.length > 0,
    };
  }, [user, realServices]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.infoCard}>
          <ActivityIndicator size="large" color="#1E1240" />
          <Text style={styles.infoText}>Cargando servicios...</Text>
        </View>
      );
    }

    if (!isPro) {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Esta sección está disponible para personas que ofrecen servicios.
            Activa tu perfil profesional para comenzar a publicar.
          </Text>
        </View>
      );
    }

    if (!hasServices) {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Aún no has creado servicios. Crea tu primer servicio desde el botón
            "Crear servicio".
          </Text>
          <Link href="/(tabs)/account/profile/create-service" asChild>
            <Pressable style={styles.createButton}>
              <Text style={styles.createButtonText}>Crear primer servicio</Text>
            </Pressable>
          </Link>
        </View>
      );
    }

    return (
      <View style={styles.list}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} variant="profile" />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis servicios</Text>

        {isPro && hasServices && (
          <Link href="/(tabs)/account/profile/create-service" asChild>
            <Pressable style={styles.createButtonSmall}>
              <Text style={styles.createButtonText}>+ Crear</Text>
            </Pressable>
          </Link>
        )}
      </View>

      {renderContent()}
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
    paddingVertical: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1240",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#65F7F7",
    marginBottom: 16,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    textAlign: "center",
  },
  list: {
    gap: 16,
  },
  createButton: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    minWidth: 200,
  },
  createButtonSmall: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  debugButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#65F7F7",
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#111827",
  },
});