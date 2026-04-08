// app/(tabs)/account/portfolio/index.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState, useEffect, useContext } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator
} from "react-native";
import DraggableFlatList, {
    RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext } from "../../../../context/AuthContext";
import portfolioService, { PortfolioItem as ApiPortfolioItem } from "../../../../services/portfolioService";

type UIItem = {
  id: number;
  uri: string;
  titulo: string;
  fecha: string;
  orden: number;
  descripcion: string | null;
};

export default function PortfolioScreen() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<UIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<UIItem | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Verificar si el usuario es profesional
  const isProfesional = user?.rol === "Profesional";
  const hasItems = items.length > 0;

  // Cargar portafolio real
  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      // Si hay usuario logueado, mostrar su portafolio
      // Si no, mostrar portafolio público (para visitantes)
      const profesionalId = user?.id || 0; // Esto debería venir de params si es vista pública
      const data = await portfolioService.getPortfolio(profesionalId);
      
      const uiItems: UIItem[] = data.map(item => ({
        id: item.id,
        uri: item.imagenUrl,
        titulo: item.descripcion || "Sin descripción",
        fecha: item.createdAt,
        orden: item.orden,
        descripcion: item.descripcion
      })).sort((a, b) => b.orden - a.orden); // Más reciente primero

      setItems(uiItems);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el portafolio");
    } finally {
      setLoading(false);
    }
  };

  const fmtFecha = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================
  // Agregar imagen desde galería
  // ============================
  const handleAddPhoto = async () => {
    if (!isProfesional) {
      Alert.alert("Acceso denegado", "Solo profesionales pueden agregar fotos");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir el acceso a tu galería para subir fotos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets?.length) return;

    try {
      setUploading(true);
      const newImage = result.assets[0];

      // Opción 1: Subir imagen a servidor (si tienes endpoint de upload)
      // const imageUrl = await portfolioService.uploadImage(newImage.uri);
      
      // Opción 2: Usar URI local (temporal, solo para desarrollo)
      const imageUrl = newImage.uri;

      const nuevoItem = await portfolioService.addPhoto(
        imageUrl,
        "Nuevo trabajo"
      );

      const newUIItem: UIItem = {
        id: nuevoItem.id,
        uri: nuevoItem.imagenUrl,
        titulo: nuevoItem.descripcion || "Nuevo trabajo",
        fecha: nuevoItem.createdAt,
        orden: nuevoItem.orden,
        descripcion: nuevoItem.descripcion
      };

      setItems(prev => [newUIItem, ...prev]);
      Alert.alert("Éxito", "Foto agregada al portafolio");
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la foto");
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // Eliminar foto
  // ============================
  const handleDelete = (id: number) => {
    if (!isProfesional) return;

    Alert.alert("Eliminar foto", "¿Seguro que quieres eliminar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await portfolioService.deletePhoto(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
            Alert.alert("Éxito", "Foto eliminada");
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la foto");
          }
        },
      },
    ]);
  };

  // ============================
  // Reordenar fotos (al soltar)
  // ============================
  const handleDragEnd = async ({ data }: { data: UIItem[] }) => {
    setItems(data);
    
    if (!isProfesional) return;

    try {
      const nuevoOrden = data.map(item => item.id);
      await portfolioService.reorder(nuevoOrden);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el nuevo orden");
      // Revertir al orden anterior? Recargar?
    }
  };

  // ============================
  // Modal editar descripción
  // ============================
  const openEdit = (item: UIItem) => {
    if (!isProfesional) return;
    setEditingItem(item);
    setEditingTitle(item.descripcion || "");
  };

  const saveEdit = async () => {
    if (!editingItem || !isProfesional) return;

    const updated = editingTitle.trim() || "Sin descripción";

    try {
      const updatedItem = await portfolioService.updateDescription(
        editingItem.id,
        updated
      );

      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id 
            ? { ...i, titulo: updated, descripcion: updated } 
            : i
        )
      );

      setEditingItem(null);
      Alert.alert("Éxito", "Descripción actualizada");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la descripción");
    }
  };

  const closeEdit = () => setEditingItem(null);

  // ============================
  // Render item
  // ============================
  const renderItem = ({ item, drag, isActive }: RenderItemParams<UIItem>) => (
    <Pressable
      onLongPress={isProfesional ? drag : undefined}
      delayLongPress={120}
      disabled={isActive || !isProfesional}
      style={[styles.card, isActive && styles.cardActive]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Botones solo visibles para profesional */}
        {isProfesional && (
          <>
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" style={styles.deleteIcon} />
            </Pressable>

            <Pressable
              style={styles.editButton}
              onPress={() => openEdit(item)}
              hitSlop={8}
            >
              <Ionicons name="create-outline" style={styles.editIcon} />
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.cardMeta}>{fmtFecha(item.fecha)}</Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={[styles.listContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#1E1240" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen}>
        <DraggableFlatList
          key={`draggable-list-${items.length}`}
          data={items}
          keyExtractor={(item) => item.id.toString()}
          onDragEnd={handleDragEnd}
          renderItem={renderItem}
          scrollEnabled
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Pressable
                  onPress={() => router.back()}
                  style={styles.backButton}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-back" style={styles.backIcon} />
                </Pressable>
                <Text style={styles.title}>Portafolio</Text>
              </View>

              {isProfesional && (
                <>
                  <Text style={styles.subtitle}>
                    Sube fotos de tus trabajos, edita la descripción y ordena el
                    portafolio manteniendo presionadas las fotos.
                  </Text>

                  <Pressable
                    onPress={handleAddPhoto}
                    style={[styles.addButton, uploading && { opacity: 0.5 }]}
                    android_ripple={{ color: "#00000010", borderless: false }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" style={styles.addIcon} />
                        <Text style={styles.addLabel}>
                          Agregar foto desde galería
                        </Text>
                      </>
                    )}
                  </Pressable>
                </>
              )}

              {!hasItems && (
                <View style={styles.emptyBox}>
                  <Ionicons name="images-outline" style={styles.emptyIcon} />
                  <Text style={styles.emptyTitle}>Aún no hay fotos</Text>
                  <Text style={styles.emptyText}>
                    {isProfesional 
                      ? "Cuando subas fotos de tus trabajos, se mostrarán aquí."
                      : "Este profesional aún no ha agregado fotos a su portafolio."}
                  </Text>
                </View>
              )}
            </View>
          }
        />

        {/* MODAL EDITAR DESCRIPCIÓN */}
        <Modal
          visible={!!editingItem}
          transparent
          animationType="fade"
          onRequestClose={closeEdit}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Editar descripción</Text>

              <TextInput
                style={styles.modalInput}
                value={editingTitle}
                onChangeText={setEditingTitle}
                multiline
                placeholder="Describe este trabajo…"
                placeholderTextColor="#6B7280"
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={closeEdit}
                >
                  <Text style={styles.modalButtonSecondaryLabel}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={saveEdit}
                >
                  <Text style={styles.modalButtonPrimaryLabel}>
                    Guardar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Contenido interno de la lista (DraggableFlatList)
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  headerContainer: {
    gap: 12,
    marginBottom: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    paddingRight: 4,
    paddingVertical: 4,
  },
  backIcon: {
    fontSize: 22,
    color: "#1E1240",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },

  // Botón agregar
  addButton: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  addIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  addLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // =========================
  // CARD DE CADA FOTO (2 COLUMNAS)
  // =========================
  card: {
    width: "48%",
    margin: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#65F7F7",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardActive: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },

  // Contenedor de la imagen
  imageWrapper: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#1E1240",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  editButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#1E1240",
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },

  // Contenido de la card (texto)
  cardBody: {
    padding: 8,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 18,
  },
  cardMeta: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },

  // =========================
  // Empty state
  // =========================
  emptyBox: {
    marginTop: 16,
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#65F7F7",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 40,
    color: "#1E1240",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
  },

  // =========================
  // Modal editar texto
  // =========================
  modalOverlay: {
    flex: 1,
    backgroundColor: "#1E1240",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalInput: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#65F7F7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    textAlignVertical: "top",
    backgroundColor: "#F9FAFB",
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#65F7F7",
  },
  modalButtonPrimary: {
    backgroundColor: "#1E1240",
  },
  modalButtonSecondaryLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  modalButtonPrimaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});