//app/inbox/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { messageService, Message as ApiMessage } from "../../../../services/messageService";
import { AuthContext } from "../../../../context/AuthContext";

type UIMessage = {
  id: number;
  from: "user" | "provider";
  text: string;
  timeLabel: string;
};

export default function InboxChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [contacto, setContacto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const contactoId = parseInt(id);

  useEffect(() => {
    if (contactoId && user?.id) {
      loadMessages(1, true);
    }
  }, [contactoId, user?.id]);

  const loadMessages = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setMessages([]);
      } else {
        setLoadingMore(true);
      }

      const response = await messageService.getMessagesWithContact(contactoId, pageNum, 50);
      
      const { contacto: contactoData, mensajes, pagination } = response;
      
      if (reset) {
        setContacto(contactoData);
      }
      
      const uiMessages: UIMessage[] = mensajes.map((msg: ApiMessage) => ({
        id: msg.id,
        from: msg.remitenteId === user?.id ? "user" : "provider",
        text: msg.contenido,
        timeLabel: new Date(msg.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
      
      setMessages(prev => reset ? uiMessages : [...prev, ...uiMessages]);
      setPage(pageNum);
      setHasMore(pagination.hasMore);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      if (reset) {
        Alert.alert('Error', 'No se pudieron cargar los mensajes');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMore) {
      loadMessages(page + 1);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !user?.id) return;
    
    try {
      setSending(true);
      const sentMessage = await messageService.sendMessage(contactoId, newMessage.trim());
      
      const newUIMessage: UIMessage = {
        id: sentMessage.id,
        from: "user",
        text: sentMessage.contenido,
        timeLabel: new Date(sentMessage.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setMessages(prev => [newUIMessage, ...prev]);
      setNewMessage('');
      
      // Scroll al inicio para ver el mensaje nuevo
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    Alert.alert(
      'Eliminar mensaje',
      '¿Estás seguro de eliminar este mensaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await messageService.deleteMessage(messageId);
              setMessages(prev => prev.filter(msg => msg.id !== messageId));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el mensaje');
            }
          }
        }
      ]
    );
  };

  const getFullName = () => {
    if (!contacto) return '';
    return `${contacto.nombre} ${contacto.apellidoPaterno}`;
  };

  const renderMessage = ({ item }: { item: UIMessage }) => {
    const isUser = item.from === "user";

    return (
      <TouchableOpacity
        onLongPress={() => isUser && handleDeleteMessage(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowProvider,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.messageBubbleUser : styles.messageBubbleProvider,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                !isUser && styles.messageTextProvider,
              ]}
            >
              {item.text}
            </Text>
            <Text style={styles.messageTime}>{item.timeLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#0891B2" />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0891B2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.providerName}>Chat con {getFullName()}</Text>
      </View>

      {/* TARJETA DE DETALLES - ELIMINADA */}
      {/* Los detalles de reserva deben venir de otro endpoint */}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 }) ?? 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#9CA3AF"
            editable={!sending}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && { opacity: 0.5 }
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Text style={styles.sendButtonLabel}>
              {sending ? '...' : 'Enviar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1E1240",
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 24,
    color: "#0891B2",
  },

  providerName: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  chatContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },

  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  messageRowUser: {
    justifyContent: "flex-end",
  },

  messageRowProvider: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  messageBubbleUser: {
    backgroundColor: "#14B8A6",
    borderBottomRightRadius: 6,
  },

  messageBubbleProvider: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
  },

  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },

  messageTextProvider: {
    color: "#1E1240",
  },

  messageTime: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.78)",
    alignSelf: "flex-end",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(17, 24, 39, 0.06)",
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.10)",
  },

  sendButton: {
    backgroundColor: "#14B8A6",
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  sendButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});