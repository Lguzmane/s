// app/profile/index.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ServiceCard from "../../../../components/cards/ServiceCard";
import Portfolio from "../../../../components/profile/Portfolio";
import ProfessionalInfo from "../../../../components/profile/ProfessionalInfo";
import ProfileHeader from "../../../../components/profile/ProfileHeader";
import { AuthContext } from "../../../../context/AuthContext";
import { userService } from "../../../../services/userService";

export default function ProfileScreen() {
  const auth = useContext(AuthContext) as any;
  const { user } = auth;

  const params = useLocalSearchParams<{ userId?: string; refresh?: string }>();
  const isExternalProfile = !!params.userId;

  const [editableData, setEditableData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    certificaciones: false,
    experiencia: false,
    condiciones: false,
    contacto: false,
  });

  const [activeTab, setActiveTab] = useState<"servicios">("servicios");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        let userData: any = {};

        // PERFIL EXTERNO
        if (isExternalProfile && params.userId) {
          const externalUser = await userService.getUserById(params.userId);
          userData = externalUser.data || {};

          if (userData.rol === "Profesional") {
            try {
              const portfolioData = await userService.getPortfolio(params.userId);
              userData.portafolio = portfolioData.items || portfolioData.data || [];
            } catch {
              userData.portafolio = [];
            }
          }
        }
        // PERFIL PROPIO
        else {
          const myProfile = await userService.getMyProfile();
          userData = myProfile ? { ...myProfile } : {};

          if (userData.rol === "Profesional" && userData.id) {
            try {
              const portfolioData = await userService.getPortfolio(String(userData.id));
              userData.portafolio = portfolioData.items || portfolioData.data || [];
            } catch {
              userData.portafolio = [];
            }
          }
        }

        setEditableData(userData);
      } catch (err) {
        console.error("❌ Error al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user, params.userId, params.refresh]);

  const handleEditProfile = () => setIsEditing(!isEditing);

  const handleChange = (name: string, value: string) =>
    setEditableData((prev: any) => ({ ...prev, [name]: value }));

  // Mantener shape del backend en camelCase.
  // No usar aliases como apellido_paterno o foto.
  const handleSaveProfile = async () => {
    try {
      const campos = {
        nombre: editableData.nombre,
        apellidoPaterno: editableData.apellidoPaterno,
        apellidoMaterno: editableData.apellidoMaterno,
        telefono: editableData.telefono,
        region: editableData.region,
        comuna: editableData.comuna,
        fotoPerfil: editableData.fotoPerfil,
      };

      const updated = await userService.updateProfile(campos);
      const updatedUser = updated.data || updated;

      setEditableData((prev: any) => ({ ...prev, ...updatedUser }));
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error al guardar perfil:", err);
    }
  };

  const toggleAccordion = (key: string) =>
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  if (loading)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#1E1240" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.screen}>
      <View style={styles.headerBase}>
        <View style={styles.headerRow} />
      </View>

      <View style={styles.contentCard}>
        <ProfileHeader
          editableData={editableData}
          isEditing={isEditing}
          handleChange={handleChange}
          handleEditProfile={handleEditProfile}
          handleSaveProfile={handleSaveProfile}
          isOwnProfile={!isExternalProfile}
        />

        {editableData.rol === "Profesional" && (
          <>
            <Portfolio
              profesionalId={editableData?.id}
              isEditing={isEditing}
              limit={3}
            />
            <ProfessionalInfo
              editableData={editableData}
              isEditing={isEditing}
              handleChange={handleChange}
              accordionOpen={accordionOpen}
              toggleAccordion={toggleAccordion}
            />
          </>
        )}

        {editableData.rol === "Profesional" && (
          <View style={styles.tabsRow}>
            <Pressable onPress={() => setActiveTab("servicios")} style={styles.tabBtn}>
              <Text style={[styles.tabLabel, activeTab === "servicios" && styles.tabLabelActive]}>
                Revisiones
              </Text>
            </Pressable>
          </View>
        )}

        {activeTab === "servicios" && editableData.rol === "Profesional" && (
          <View style={styles.servicesBox}>
            {!isExternalProfile && (
              <Pressable
                onPress={() => router.push("/profile/create-service" as any)}
                style={styles.addServiceBtn}
              >
                <Text style={styles.addServiceBtnLabel}>+ Agregar Servicio</Text>
              </Pressable>
            )}

            {editableData.servicios?.length > 0 ? (
              editableData.servicios.map((servicio: any, i: number) => (
                <View key={i} style={styles.serviceCardWrapper}>
                  <ServiceCard
                    service={{
                      id: servicio.id,
                      nombre: servicio.nombre,
                      descripcion: servicio.descripcion,
                      precio: servicio.precio,
                      duracion: servicio.duracionMin,
                      imagen: servicio.fotos?.[0]?.imagenUrl || "",
                      rating: servicio.rating || 0,
                    }}
                    compact
                  />
                </View>
              ))
            ) : (
              <Text style={styles.mutedText}>No hay servicios disponibles.</Text>
            )}
          </View>
        )}

        {editableData.rol === "Profesional" && !isExternalProfile && (
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleTitle}>Gestiona tu agenda</Text>
            <Pressable
              onPress={() => router.push("/profile/schedule" as any)}
              style={styles.scheduleBtn}
            >
              <Text style={styles.scheduleBtnLabel}>Ver Agenda Completa</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  scrollContent: {
    paddingBottom: 34,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E1240",
    letterSpacing: -0.2,
  },

  headerBase: {
    backgroundColor: "#1E1240",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 22,
  },

  headerRow: {
    minHeight: 34,
  },

  contentCard: {
    marginHorizontal: 16,
    marginTop: -10,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  tabBtn: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 18,
  },

  tabLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: -0.3,
  },

  tabLabelActive: {
    color: "#1E1240",
    fontWeight: "800",
  },

  servicesBox: {
    marginTop: 0,
    marginBottom: 16,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },

  addServiceBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#65F7F7",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginLeft: 4,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },

  addServiceBtnLabel: {
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  serviceCardWrapper: {
    marginBottom: 12,
  },

  mutedText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 20,
    paddingHorizontal: 4,
  },

  scheduleBox: {
    marginTop: 8,
    marginBottom: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#65F7F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },

  scheduleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: "center",
  },

  scheduleBody: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },

  scheduleBtn: {
    backgroundColor: "#65F7F7",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
    minWidth: 210,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },

  scheduleBtnLabel: {
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});