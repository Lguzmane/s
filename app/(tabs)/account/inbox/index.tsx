// app/inbox/index.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    SafeAreaView,
    Text,
    View,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { messageService, Conversation } from "../../../../services/messageService";

export default function InboxScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response);
    } catch (error) {
      console.log('Error al cargar conversaciones:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (contactoId: number) => {
    router.push({
      pathname: "./[id]",
      params: { id: contactoId.toString() },
    });
  };

  const getFullName = (contacto: Conversation['contacto']) => {
    return `${contacto.nombre} ${contacto.apellidoPaterno}`;
  };

  const formatLastMessageDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy · ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer · ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return date.toLocaleDateString('es-CL', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0891B2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!conversations.length) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Bandeja de entrada</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aún no tienes mensajes</Text>
            <Text style={styles.emptySubtitle}>
              Cuando reserves un servicio, verás aquí los mensajes con tus profesionales.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Bandeja de entrada</Text>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.contacto.id.toString()}
          renderItem={({ item }) => {
            const fullName = getFullName(item.contacto);
            
            return (
              <Pressable
                onPress={() => handleOpenChat(item.contacto.id)}
                style={styles.conversationCard}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.conversationContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleText} numberOfLines={1}>
                      {fullName}
                    </Text>
                    <Text style={styles.dateText}>
                      {formatLastMessageDate(item.ultimaInteraccion)}
                    </Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.lastMessageText} numberOfLines={1}>
                      {item.ultimoMensaje?.contenido || 'Sin mensajes aún'}
                    </Text>
                    
                    {item.mensajesNoLeidos > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>
                          {item.mensajesNoLeidos}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1E1240",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#F3F4F6",
  },

  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 22,
    letterSpacing: -0.3,
    marginHorizontal: -20,
    marginTop: -44,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  listContent: {
    paddingBottom: 28,
  },

  conversationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1E1240",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(101, 247, 247, 0.18)",
  },

  avatarText: {
    color: "#65f7f7",
    fontSize: 20,
    fontWeight: "800",
  },

  conversationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 10,
  },

  titleText: {
    flex: 1,
    color: "#1E1240",
    fontSize: 15,
    fontWeight: "800",
  },

  dateText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  lastMessageText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 13.5,
    fontWeight: "500",
    marginRight: 10,
  },

  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#14B8A6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },

  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  separator: {
    height: 12,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  emptyTitle: {
    color: "#1E1240",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
  },
});