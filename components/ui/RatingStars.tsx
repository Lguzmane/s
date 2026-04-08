//componentsui/ RatingStars.tsx
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

type RatingStarsProps = {
  rating: number;
  size?: number;
};

export default function RatingStars({ rating, size = 18 }: RatingStarsProps) {
  const maxStars = 5;

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => (
        <FontAwesome
          key={index}
          name={index < rating ? "star" : "star-o"}
          size={size}
          color={index < rating ? "#F59E0B" : "#6B7280"}
          style={styles.star}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  star: {
    marginRight: 4,
  },
});