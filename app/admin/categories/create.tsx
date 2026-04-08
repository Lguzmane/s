//app/admin/categories/create.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function CreateCategory() {
  const auth = useContext(AuthContext) as any;
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    nombre: '',
    icono: '',
    descripcion: '',
    orden: '0',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    try {
      setLoading(true);

      await adminService.createCategory({
        nombre: formData.nombre,
        icono: formData.icono || undefined,
        descripcion: formData.descripcion || undefined,
        orden: parseInt(formData.orden) || 0,
      });

      Alert.alert("Éxito", "Categoría creada correctamente");
      router.back();
    } catch (error) {
      console.error("Error creando categoría:", error);
      Alert.alert("Error", "No se pudo crear la categoría");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={adminStyles.headerTitle}>Nueva Categoría</Text>
        <View style={adminStyles.headerSpacer} />
      </View>

      <View style={adminStyles.formCard}>
        <View style={adminStyles.introBlock}>
          <View style={adminStyles.introIconWrap}>
            <Ionicons name="pricetag-outline" size={18} color="#B7FF3C" />
          </View>
          <View style={adminStyles.introTextWrap}>
            <Text style={adminStyles.introTitle}>Crear categoría</Text>
            <Text style={adminStyles.introText}>
              Completa los datos básicos para agregar una nueva categoría al sistema.
            </Text>
          </View>
        </View>

        <View style={adminStyles.fieldBlock}>
          <Text style={adminStyles.filterLabel}>Nombre *</Text>
          <TextInput
            style={adminStyles.searchBar}
            placeholder="Ej: Plomería, Electricidad, Clases..."
            placeholderTextColor="#9CA3AF"
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
          />
        </View>

        <View style={adminStyles.fieldBlock}>
          <Text style={adminStyles.filterLabel}>Icono (opcional)</Text>
          <TextInput
            style={adminStyles.searchBar}
            placeholder="Nombre del icono (Ionicons)"
            placeholderTextColor="#9CA3AF"
            value={formData.icono}
            onChangeText={(text) => setFormData({ ...formData, icono: text })}
          />
          {formData.icono ? (
            <View style={adminStyles.previewWrap}>
              <View style={adminStyles.previewIconBox}>
                <Ionicons name={formData.icono as any} size={24} color="#B7FF3C" />
              </View>
            </View>
          ) : null}
        </View>

        <View style={adminStyles.fieldBlock}>
          <Text style={adminStyles.filterLabel}>Descripción (opcional)</Text>
          <TextInput
            style={adminStyles.modalInput}
            placeholder="Breve descripción de la categoría..."
            placeholderTextColor="#9CA3AF"
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={adminStyles.fieldBlock}>
          <Text style={adminStyles.filterLabel}>Orden (opcional)</Text>
          <TextInput
            style={adminStyles.searchBar}
            placeholder="Número de orden (ej: 1, 2, 3...)"
            placeholderTextColor="#9CA3AF"
            value={formData.orden}
            onChangeText={(text) => setFormData({ ...formData, orden: text })}
            keyboardType="numeric"
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
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1E1240" />
            ) : (
              <Text style={adminStyles.modalConfirmText}>Crear</Text>
            )}
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

  formCard: {
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

  introBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  introIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(183,255,60,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  introTextWrap: {
    flex: 1,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 3,
  },

  introText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
  },

  fieldBlock: {
    marginBottom: 14,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
    marginBottom: 6,
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

  modalInput: {
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
    minHeight: 96,
    textAlignVertical: "top",
  },

  previewWrap: {
    alignItems: "center",
    marginTop: 10,
  },

  previewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F4FCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 10,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: "#FFF1F8",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 79, 179, 0.18)",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF4FB3",
    letterSpacing: -0.1,
  },

  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#B7FF3C",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  modalConfirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.1,
  },
});