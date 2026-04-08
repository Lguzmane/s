//app/profile/create-service.tsx
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import serviciosData from "../../../../assets/data/services.json";
import { AuthContext } from "../../../../context/AuthContext";
import { serviceService } from "../../../../services/serviceService"; // 👈 AGREGADO

// =========================
// Tipos
// =========================
type Categoria = {
  nombre: string;
  servicios?: string[];
};

type ServiciosJSON = {
  categorias: Categoria[];
};

type TipoAtencion = "Presencial" | "Online";

type FormData = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: string;
  categoria: string;
  tipoAtencion: TipoAtencion;
  consideraciones: string;
};

// Opciones fijas
const TIPO_ATENCION_OPTIONS: TipoAtencion[] = ["Presencial", "Online"];

export default function CreateService() {
  const auth = useContext(AuthContext); // 👈 CAMBIADO (ya no desestructuramos createService)

  // =========================
  // Datos base desde JSON
  // =========================
  const { categorias: categoriasArr = [] } =
    (serviciosData as unknown as ServiciosJSON) || {};

  const categorias: string[] = categoriasArr.map((c) => c.nombre);

  // =========================
  // Estado del formulario
  // =========================
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
    categoria: "",
    tipoAtencion: "Presencial",
    consideraciones: "",
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [showCategoryList, setShowCategoryList] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // Handlers
  // =========================
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPhoto = async () => {
    try {
      // Permisos
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Necesitas permitir acceso a la galería para subir fotos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotos((prev) => [...prev, uri]);
      }
    } catch (err: any) {
      console.error("❌ Error al seleccionar imagen:", err?.message ?? err);
      setError("No se pudo abrir la galería. Intenta nuevamente.");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const datos = {
        ...formData,
        fotos: photos, // ahora enviamos las fotos seleccionadas
      };

      // 👈 CAMBIADO: usar serviceService en lugar de createService del contexto
      await serviceService.createService(datos);

      setSuccess("✅ Servicio creado exitosamente");
      setTimeout(() => {
        router.replace("/(tabs)/account/profile");
      }, 1000);
    } catch (err: any) {
      console.error("❌ Error al crear servicio:", err?.message ?? err);
      setError(err?.message || "Error al crear servicio");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Encabezado similar a registro */}
      <View style={styles.header}>
        <Text style={styles.title}>Crear nuevo servicio</Text>
        <Text style={styles.subtitle}>
          Completa la información para publicar tu servicio en SMarket.
        </Text>
      </View>

      {/* Caja / Card del formulario */}
      <View style={styles.card}>
        {/* Nombre */}
        <TextInput
          placeholder="Nombre del Servicio"
          value={formData.nombre}
          onChangeText={(v) => handleChange("nombre", v)}
          style={styles.input}
          placeholderTextColor="#6B7280"
        />

        {/* Descripción */}
        <TextInput
          placeholder="Descripción del Servicio"
          value={formData.descripcion}
          onChangeText={(v) => handleChange("descripcion", v)}
          multiline
          style={[styles.input, styles.textarea]}
          placeholderTextColor="#6B7280"
        />

        {/* Precio y Duración */}
        <View style={styles.row}>
          <TextInput
            placeholder="Precio"
            value={formData.precio}
            onChangeText={(v) => handleChange("precio", v)}
            keyboardType="numeric"
            style={[styles.input, styles.flex]}
            placeholderTextColor="#6B7280"
          />
          <TextInput
            placeholder="Duración (min)"
            value={formData.duracion}
            onChangeText={(v) => handleChange("duracion", v)}
            keyboardType="numeric"
            style={[styles.input, styles.flex]}
            placeholderTextColor="#6B7280"
          />
        </View>

        {/* Categoría como desplegable overlay */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoría</Text>

          <View style={styles.selectWrapper}>
            <Pressable
              style={styles.select}
              onPress={() => setShowCategoryList((prev) => !prev)}
            >
              <Text
                style={
                  formData.categoria
                    ? styles.selectValue
                    : styles.selectPlaceholder
                }
              >
                {formData.categoria || "Selecciona una categoría"}
              </Text>
            </Pressable>

            {showCategoryList && (
              <View style={styles.selectDropdown}>
                {categorias.map((cat) => (
                  <Pressable
                    key={cat}
                    style={styles.selectOption}
                    onPress={() => {
                      handleChange("categoria", cat);
                      setShowCategoryList(false);
                    }}
                  >
                    <Text style={styles.selectOptionLabel}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Tipo de atención */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tipo de Atención</Text>
          {TIPO_ATENCION_OPTIONS.map((tipo) => {
            const active = formData.tipoAtencion === tipo;
            return (
              <Pressable
                key={tipo}
                onPress={() => handleChange("tipoAtencion", tipo)}
                style={[
                  styles.option,
                  active ? styles.optionActive : styles.optionInactive,
                ]}
              >
                <Text
                  style={
                    active ? styles.optionLabelActive : styles.optionLabel
                  }
                >
                  {tipo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Consideraciones */}
        <TextInput
          placeholder="Consideraciones (opcional)"
          value={formData.consideraciones}
          onChangeText={(v) => handleChange("consideraciones", v)}
          multiline
          style={[styles.input, styles.textarea]}
          placeholderTextColor="#6B7280"
        />

        {/* Fotografías */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Fotografías</Text>
          <Text style={styles.sectionHelper}>
            Agrega imágenes de tu trabajo para que las clientas vean ejemplos.
          </Text>

          <View style={styles.photosRow}>
            {photos.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={styles.photoItem}
                resizeMode="cover"
              />
            ))}

            <Pressable style={styles.photoPlaceholder} onPress={handleAddPhoto}>
              <Text style={styles.photoPlaceholderText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Mensajes */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        {/* Botón */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitLabel}>Guardar Servicio</Text>
          )}
        </Pressable>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 48,
  },

  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1240",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginTop: 4,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "stretch",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
  },
  flex: {
    flex: 1,
  },

  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  sectionHelper: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },

  selectWrapper: {
    position: "relative",
    zIndex: 20,
  },
  select: {
    borderWidth: 1,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  selectPlaceholder: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectValue: {
    fontSize: 14,
    color: "#111827",
  },
  selectDropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#65F7F7",
    backgroundColor: "#FFFFFF",
    maxHeight: 220,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 30,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  selectOptionLabel: {
    fontSize: 14,
    color: "#111827",
  },

  option: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  optionActive: {
    backgroundColor: "#1E1240",
    borderColor: "#1E1240",
  },
  optionInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#65F7F7",
  },
  optionLabel: {
    fontSize: 14,
    color: "#111827",
  },
  optionLabelActive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  photosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  photoItem: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#65F7F7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1E1240",
  },

  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: "#F59E0B",
  },
  successText: {
    marginTop: 8,
    fontSize: 13,
    color: "#1E1240",
  },

  submitBtn: {
    marginTop: 24,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1240",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});