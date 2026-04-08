//app/(tabs)/account/notifications/index.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { notificationService, Notification } from '../../../../services/notificationService';
import { AuthContext } from '../../../../context/AuthContext';
import { theme } from "../../../../styles/theme";

export default function NotificationsScreen() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotificationPress = async (item: Notification) => {
    await handleMarkAsRead(item.id);
    
    // Navegar según el tipo de notificación
    if (item.metadata?.bookingId) {
      router.push({
        pathname: '/(tabs)/account/history',
        params: { id: item.metadata.bookingId }
      });
    } else if (item.metadata?.servicioId) {
      router.push({
        pathname: '/(tabs)/service/[id]',
        params: { id: item.metadata.servicioId }
      });
    } else if (item.metadata?.remitenteId) {
      router.push({
        pathname: '/(tabs)/account/inbox/[id]',
        params: { id: item.metadata.remitenteId }
      });
    } else if (item.metadata?.profesionalId) {
      router.push({
        pathname: '/(tabs)/account/profile',
        params: { userId: item.metadata.profesionalId }
      });
    } else if (item.tipo === 'pago') {
      router.push('/(tabs)/account/payments');
    } else if (item.tipo === 'promocion') {
      router.push('/(tabs)/home');
    }
  };

  const loadNotifications = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const response = await notificationService.getMyNotifications(pageNum, 20);
      
      const newNotifications = response.notificaciones || [];
      
      setNotifications(prev => 
        refresh || pageNum === 1 ? newNotifications : [...prev, ...newNotifications]
      );
      
      setHasMore(pageNum < (response.pagination?.pages || 1));
      setPage(pageNum);
      
      const countResponse = await notificationService.getUnreadCount();
      setUnreadCount(countResponse?.count || 0);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      loadNotifications(page + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications(1, true);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications(1, true);
    }, [])
  );

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => 
          n.id === id ? { ...n, leida: true, fechaLeida: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await notificationService.markAllAsRead();
              setNotifications(prev =>
                prev.map(n => ({ ...n, leida: true, fechaLeida: new Date().toISOString() }))
              );
              setUnreadCount(0);
            } catch (error) {
              Alert.alert('Error', 'No se pudieron marcar las notificaciones');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              const deleted = notifications.find(n => n.id === id);
              setNotifications(prev => prev.filter(n => n.id !== id));
              if (deleted && !deleted.leida) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          }
        }
      ]
    );
  };

  const getNotificationIcon = (tipo: string | null) => {
    switch (tipo) {
      case 'reserva':
        return '📅';
      case 'mensaje':
        return '💬';
      case 'pago':
        return '💰';
      case 'review':
        return '⭐';
      case 'sistema':
        return '⚙️';
      case 'promocion':
        return '🎁';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `Hace ${minutes} min`;
      }
      return `Hace ${hours} h`;
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `Hace ${days} días`;
    } else {
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.leida && styles.cardUnread]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconEmoji}>{getNotificationIcon(item.tipo)}</Text>
        </View>
      </View>
      
      <View style={styles.cardCenter}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={styles.cardMeta}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <Text style={styles.cardBody} numberOfLines={2}>
          {item.mensaje}
        </Text>
      </View>

      {!item.leida && (
        <View style={styles.cardRight}>
          <View style={styles.unreadDot} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (notifications.length === 0) return null;
    
    return (
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={[styles.headerPill, { marginLeft: 8 }]}>
              <Text style={styles.headerPillText}>{unreadCount} nuevas</Text>
            </View>
          )}
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.iconBtnText}>✓✓</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconWrap}>
        <Text style={styles.emptyIcon}>🔔</Text>
      </View>
      <Text style={styles.emptyTitle}>Sin notificaciones</Text>
      <Text style={styles.emptyText}>
        Cuando tengas notificaciones, aparecerán aquí
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.screen, styles.centerScreen]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => String(item.id)}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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

  centerScreen: {
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },

  listContent: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },

  headerRow: {
    marginHorizontal: -20,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 22,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  headerPill: {
    backgroundColor: "rgba(101, 247, 247, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(101, 247, 247, 0.28)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  headerPillText: {
    color: "#65f7f7",
    fontSize: 12,
    fontWeight: "700",
  },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  cardUnread: {
    backgroundColor: "#F7FBFF",
    borderColor: "rgba(20, 184, 166, 0.10)",
  },

  cardLeft: {
    marginRight: 12,
    paddingTop: 1,
  },

  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(30, 18, 64, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconEmoji: {
    fontSize: 16,
  },

  cardCenter: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    flex: 1,
    color: "#1E1240",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 10,
  },

  cardMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },

  cardBody: {
    color: "#6B7280",
    fontSize: 13.5,
    fontWeight: "500",
    lineHeight: 19,
    marginTop: 5,
  },

  cardRight: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 6,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#14B8A6",
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
    paddingBottom: 40,
  },

  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(30, 18, 64, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyIcon: {
    fontSize: 20,
  },

  emptyTitle: {
    color: "#1E1240",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 240,
  },

  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
});