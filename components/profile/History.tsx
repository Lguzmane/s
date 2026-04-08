//components/profile/History.tsx
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import HistoryItem from "./HistoryItem";

export type HistoryItemData = {
  bookingId: string | number;  // 🔥 CORRECCIÓN: id → bookingId
  nombreServicio?: string;
  contraparte?: string;
  rol?: "cliente" | "proveedor";
  fecha?: string;
  hora?: string;
  estado?: string;
  foto?: string;
  monto?: number | null;
  reviewDetalle?: any;
};

type Props = {
  items?: HistoryItemData[];
  title?: string;
  emptyMessage?: string;
};

export default function History({
  items = [],
  title,
  emptyMessage = "No hay historial disponible.",
}: Props) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      {hasItems ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {items.map((item, index) => (
            <HistoryItem
              key={`${item.bookingId ?? item.rol ?? "h"}-${item.nombreServicio ?? "item"}-${index}`}
              item={item}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1240",
  },

  listContent: {
    gap: 8,
    paddingBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
});