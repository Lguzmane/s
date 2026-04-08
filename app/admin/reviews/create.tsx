//app/admin/reviews/create.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import RatingStars from "../../../components/ui/RatingStars";
import { createReview } from "../../../services/reviewService";

export default function CreateReview() {
  // 🔥 CORRECCIÓN: reservaId → bookingId
  const { bookingId } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");

  const handleSubmit = async () => {
    if (!bookingId) return;
    if (rating < 1 || rating > 5) return;

    try {
      await createReview({
        bookingId: Number(bookingId),  // 🔥 CORRECCIÓN: reservaId → bookingId
        calificacion: rating,
        comentario,
      });

      Alert.alert("Reseña enviada correctamente");
      router.replace("/(tabs)/account/profile?refresh=1");
    } catch (error) {
      console.error("Error creando review:", error);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>★</Text>
        </View>

        <Text style={styles.title}>¿Cómo fue tu experiencia?</Text>
        <Text style={styles.subtitle}>
          Tu opinión ayuda a mejorar la calidad de los servicios.
        </Text>

        <View style={styles.starsWrap}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)} style={styles.starButton}>
              <RatingStars rating={value <= rating ? value : rating} size={28} />
            </Pressable>
          ))}
        </View>

        <TextInput
          placeholder="Cuéntanos más (opcional)"
          placeholderTextColor="#9CA3AF"
          value={comentario}
          onChangeText={setComentario}
          multiline
          style={styles.input}
        />

        <Pressable
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          <Text style={styles.submitText}>Enviar reseña</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF1F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  iconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FF4FAF",
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.2,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 18,
  },

  starsWrap: {
    flexDirection: "row",
    marginBottom: 18,
  },

  starButton: {
    marginRight: 6,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 18,
    minHeight: 100,
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "600",
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#B7FF3C",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  submitText: {
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.1,
  },
});