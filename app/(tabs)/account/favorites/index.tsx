// app/favorites/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { favoriteService, ServiceFavorite as ApiFavoriteItem } from '../../../../services/favoriteService';
import ServiceCard from '../../../../components/cards/ServiceCard';

type TransformedFavorite = {
  id: string | number;
  servicio: {
    id: string | number;
    nombre: string;
    descripcion?: string;
    precio?: number;
    imagen?: string;
    rating?: number;
    categoria?: string;
  };
  createdAt: string;
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<TransformedFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async (refresh = false) => {
    try {
      if (!refresh) setLoading(true);
      const data = await favoriteService.getMyFavorites();

      const transformed: TransformedFavorite[] = data.map((item: ApiFavoriteItem) => ({
        id: item.id,
        servicio: {
          id: item.id,
          nombre: item.nombre,
          descripcion: item.descripcion,
          precio: item.precio,
          imagen: item.imagenes?.[0],
          rating: item.rating || 0
        },
        createdAt: ""
      }));

      setFavorites(transformed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites(true);
  };

  const handleToggleFavorite = async (servicioId: string) => {
    try {
      await favoriteService.toggleFavorite(servicioId);
      loadFavorites(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar de favoritos');
    }
  };

  const renderItem = ({ item }: { item: TransformedFavorite }) => (
    <ServiceCard
      service={{
        id: item.servicio.id,
        nombre: item.servicio.nombre,
        descripcion: item.servicio.descripcion,
        precio: item.servicio.precio || 0,
        imagen: item.servicio.imagen,
        rating: item.servicio.rating
      }}
      showFavorite={true}
      isFavorite={true}
      onToggleFavorite={handleToggleFavorite}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No tienes favoritos</Text>
      <Text style={styles.emptyText}>
        Explora servicios y guarda tus favoritos para encontrarlos fácilmente después.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Favoritos</Text>
        </View>

        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#14B8A6']}
              tintColor="#14B8A6"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
    backgroundColor: "#F3F4F6",
  },

  header: {},

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 22,
    letterSpacing: -0.3,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  listContent: {
    paddingBottom: 28,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1240',
    marginBottom: 10,
    letterSpacing: -0.2,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 320,
  },
});