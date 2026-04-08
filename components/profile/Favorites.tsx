//app/components/profile/Favorites.tsx
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import ProviderCard from "../cards/ProviderCard";
import { favoriteService } from "../../services/favoriteService";

type Provider = {
  id: number | string;
  nombre: string;
  fotoPerfil?: string;
  categoria?: string;
  rating?: number;
  comuna?: string;
};

export default function Favorites() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getMyFavorites();
      
      const transformedProviders: Provider[] = data.map((fav: any) => ({
        id: fav.profesionalId,
        nombre: fav.profesionalNombre || "Profesional",
        fotoPerfil: fav.fotoPerfil,
        categoria: fav.categoria,
        rating: fav.rating,
        comuna: fav.comuna,
      }));
      
      setProviders(transformedProviders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar favoritos");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", minHeight: 200 },
        ]}
      >
        <ActivityIndicator size="large" color="#65F7F7" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", minHeight: 200 },
        ]}
      >
        <Text style={[styles.emptyText, { color: "#65F7F7" }]}>{error}</Text>
      </View>
    );
  }

  if (providers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          No tienes proveedores favoritos aún.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          compact
          provider={{
            id: provider.id,
            nombre: provider.nombre,
            foto: provider.fotoPerfil,
            categoria: provider.categoria,
            rating: provider.rating,
            ubicacion: provider.comuna ?? "",
            portafolio: [],
            cantidadOpiniones: 0,
            lugarAtencion: [],
            destacado: false,
            isFavorite: true,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
});