// app/service/[id].tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, Alert, TextInput } from "react-native";
import RatingStars from "../../../components/ui/RatingStars";
import { AuthContext } from "../../../context/AuthContext";
import * as reviewService from "../../../services/reviewService";
import { Ionicons } from "@expo/vector-icons";
import { favoriteService } from "../../../services/favoriteService";
import api from '../../../services/api';

// Imágenes por defecto
const defaultImage = "https://via.placeholder.com/400x300.png?text=Imagen+no+disponible";
const defaultProfile = "https://via.placeholder.com/150.png?text=Sin+foto";

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useContext(AuthContext) as any;
  const { user } = auth || {};
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<reviewService.Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  
  // Estados para el formulario de reseña
  const [userCanReview, setUserCanReview] = useState(false);
  const [userBookingId, setUserBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // ========================
  // FUNCIÓN PARA ACCIONES QUE REQUIEREN LOGIN
  // ========================
  const handleAuthAction = (action: () => void) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    action();
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length 
    : 0;

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/api/services/${id}`);
        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || "Error al cargar el servicio");
        }

        const s = data.data;

        const processed = {
          ...s,
          imagenes: Array.isArray(s.fotos) ? s.fotos.map((foto: any) => foto.imagenUrl) : [],
          foto_proveedor: s.profesional?.fotoPerfil || null,
          nombre_profesional: s.profesional
            ? `${s.profesional.nombre} ${s.profesional.apellidoPaterno || ""}`.trim()
            : null,
          tipo_atencion: s.tipoAtencion || "No especificado",
          duracion: s.duracionMin,
          categoria: s.categoria?.nombre || "No especificada",
          profesional_id: s.profesional?.id || null,
        };

        setService(processed);
      } catch (err: any) {
        console.error("Error fetching service:", err);
        setError(err.message || "Error al cargar el servicio");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      try {
        setLoadingReviews(true);
        const result = await reviewService.getReviewsByService(id);
        setReviews(result.reviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchService();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!id || !user) return;

      try {
        const result = await favoriteService.checkIsFavorite(id);
        setIsFavorite(result);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };
    
    checkFavorite();
  }, [id, user]);

  // 🔥 CORRECCIÓN: Verificar si el usuario puede reseñar este servicio
  useEffect(() => {
    const checkIfUserCanReview = async () => {
      if (!user || !service?.id) return;
      
      try {
        // 🔥 CORRECCIÓN 1: usar el endpoint correcto
        const response = await api.get('/api/bookings/my-bookings', {
          params: { tipo: 'cliente' }
        });
        
        const userBookings = response.data.data || [];
        
        // 🔥 CORRECCIÓN 2: usar "servicio" no "service"
        const completedBooking = userBookings.find(
          (booking: any) => 
            booking.servicio?.id === service.id && 
            booking.estado === 'completada'
        );
        
        if (completedBooking) {
          setUserCanReview(true);
          setUserBookingId(String(completedBooking.id));
        }
      } catch (error) {
        console.error('Error checking if user can review:', error);
      }
    };
    
    checkIfUserCanReview();
  }, [user, service]);

  // Enviar reseña
  const handleSubmitReview = async () => {
    if (!userBookingId || reviewRating === 0) return;
    
    try {
      setSubmittingReview(true);
      await reviewService.createReview({
        bookingId: parseInt(userBookingId),
        calificacion: reviewRating,
        comentario: reviewComment.trim() || undefined
      });
      
      // Recargar reseñas
      const result = await reviewService.getReviewsByService(id);
      setReviews(result.reviews);
      
      // Resetear formulario
      setReviewRating(0);
      setReviewComment('');
      setUserCanReview(false);
      
      Alert.alert('Éxito', '¡Gracias por tu reseña!');
    } catch (error: any) {
      Alert.alert('Error', error.message || error.error || 'No se pudo enviar la reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id || loadingFavorite) return;
    
    handleAuthAction(async () => {
      try {
        setLoadingFavorite(true);
        const result = await favoriteService.toggleFavorite(id);
        setIsFavorite(result.isFavorite);
      } catch (error) {
        console.error('Error toggling favorite:', error);
      } finally {
        setLoadingFavorite(false);
      }
    });
  };

  const handleAddToCart = () => {
    Alert.alert(
      "Acción no disponible",
      "Debes crear primero una reserva desde 'Reservar ahora'."
    );
  };

  if (loading)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#1E1240" />
        <Text style={styles.loadingText}>Cargando servicio...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );

  if (!service)
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.emptyText}>Servicio no encontrado</Text>
      </View>
    );

  return (
    <ScrollView style={styles.screen}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {service.imagenes?.length > 0 ? (
          service.imagenes.map((img: string, i: number) => (
            <Image
              key={i}
              source={{ uri: img || defaultImage }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          ))
        ) : (
          <Image
            source={{ uri: defaultImage }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        )}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: service.foto_proveedor || defaultProfile }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.serviceTitle, { flex: 1 }]}>{service.nombre || "Sin nombre"}</Text>
              <Pressable
                onPress={handleToggleFavorite}
                disabled={loadingFavorite}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={28}
                  color={isFavorite ? "#1E1240" : "#6B7280"}
                />
              </Pressable>
            </View>
            <View style={styles.ratingRow}>
              <RatingStars rating={averageRating} size={16} />
              <Text style={styles.reviewCount}>
                ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
              </Text>
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Categoría: </Text>
              {service.categoria || "No especificada"}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Tipo de atención: </Text>
              {service.tipo_atencion || "No especificado"}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Duración: </Text>
              {service.duracion ? `${service.duracion} minutos` : "No especificada"}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Precio: </Text>
              {service.precio ? `$${service.precio}` : "Consultar"}
            </Text>
          </View>
        </View>

        {/* SECCIÓN RESEÑAS CON FORMULARIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reseñas</Text>
          
          {/* FORMULARIO PARA ESCRIBIR RESEÑA (solo si puede reseñar) */}
          {userCanReview && (
            <View style={styles.reviewForm}>
              <Text style={styles.formTitle}>Califica este servicio</Text>
              
              {/* Selector de estrellas */}
              <View style={styles.starSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setReviewRating(star)}>
                    <Ionicons
                      name={star <= reviewRating ? "star" : "star-outline"}
                      size={32}
                      color={star <= reviewRating ? "#F59E0B" : "#6B7280"}
                      style={{ marginHorizontal: 4 }}
                    />
                  </Pressable>
                ))}
              </View>
              
              {/* Comentario opcional */}
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe tu comentario (opcional)"
                placeholderTextColor="#6B7280"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              {/* Botón enviar */}
              <Pressable
                onPress={handleSubmitReview}
                disabled={reviewRating === 0 || submittingReview}
                style={[
                  styles.submitButton,
                  (reviewRating === 0 || submittingReview) && styles.submitButtonDisabled
                ]}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Enviar reseña</Text>
                )}
              </Pressable>
              
              <View style={styles.formDivider} />
            </View>
          )}
          
          {/* RESEÑAS EXISTENTES */}
          {loadingReviews ? (
            <ActivityIndicator size="small" color="#1E1240" />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyReviews}>Aún no hay reseñas para este servicio</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image 
                    source={{ uri: review.cliente.fotoPerfil || defaultProfile }}
                    style={styles.reviewerAvatar}
                  />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>
                      {review.cliente.nombre} {review.cliente.apellidoPaterno || ''}
                    </Text>
                    <RatingStars rating={review.calificacion} size={14} />
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comentario}</Text>
                {review.respuestaProfesional && (
                  <View style={styles.professionalResponse}>
                    <Text style={styles.responseLabel}>Respuesta del profesional:</Text>
                    <Text style={styles.responseText}>{review.respuestaProfesional}</Text>  
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* BOTONES DE ACCIÓN - CON VALIDACIÓN DE LOGIN */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          <Pressable
            onPress={() => handleAuthAction(handleAddToCart)}
            style={[styles.reserveBtn, { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#65F7F7" }]}
          >
            <Text style={[styles.reserveBtnLabel, { color: "#1E1240" }]}>
              Agregar al carrito
            </Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleAuthAction(() =>
              router.push({
                pathname: "/booking",
                params: {
                  id: service.id,
                  nombre: service.nombre,
                  duracion: service.duracion,
                  precio: service.precio,
                  profesional_id: service.profesional_id,
                },
              })
            )}
            style={[styles.reserveBtn, { flex: 1 }]}
          >
            <Text style={styles.reserveBtnLabel}>Reservar ahora</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Loading / estados vacíos
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  centerScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    textAlign: "center",
  },

  // Carrusel
  carouselImage: {
    width: "100%",
    height: 256,
    backgroundColor: "#FFFFFF",
  },

  // Contenido
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Header proveedor
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#65F7F7",
  },
  headerInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
  },

  // Descripción
  section: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },

  // Botón reservar
  reserveBtn: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  reserveBtnLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Estilos para reseñas
  reviewCount: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    marginLeft: 4,
  },

  emptyReviews: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 24,
  },

  reviewItem: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#65F7F7",
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#65F7F7",
  },

  reviewerInfo: {
    flex: 1,
  },

  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: "#111827",
    marginBottom: 2,
  },

  reviewDate: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },

  reviewComment: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    marginLeft: 52,
  },

  professionalResponse: {
    marginTop: 8,
    marginLeft: 52,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#65F7F7",
  },

  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: "#1E1240",
    marginBottom: 2,
  },

  responseText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },

  // Estilos para el formulario de reseña (NUEVOS)
  reviewForm: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#65F7F7",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  starSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#65F7F7",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
    backgroundColor: "#FFFFFF",
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: "#1E1240",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  formDivider: {
    height: 1,
    backgroundColor: "#65F7F7",
    marginTop: 24,
  },
});