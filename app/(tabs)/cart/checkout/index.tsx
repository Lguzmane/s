// app/checkout/index.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../../../context/CartContext";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { theme } from "../../../../styles/theme";

type MetodoPago = "efectivo" | "tarjeta" | "wallet";

export default function CheckoutScreen() {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [walletBalance, setWalletBalance] = useState(0);
  
  // Estado para tarjeta (solo si se necesita)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // Tomar el bookingId del primer item del carrito
  const bookingId = cartItems[0]?.bookingId;
  const subtotal = cartItems.reduce((sum, item) => sum + (item.precio || 0), 0);
  const total = subtotal;

  useEffect(() => {
    // Cargar saldo de la billetera si el usuario está logueado
    const loadWalletBalance = async () => {
      try {
        const response = await api.get('/api/wallet/balance');
        setWalletBalance(response.data.balance || 0);
      } catch (error) {
        console.error('Error loading wallet balance:', error);
      }
    };

    if (user) {
      loadWalletBalance();
    }
  }, [user]);

  const validarTarjeta = () => {
    if (cardNumber.replace(/\s/g, "").length < 13) {
      Alert.alert("Error", "Número de tarjeta inválido");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      Alert.alert("Error", "Formato de vencimiento inválido (MM/YY)");
      return false;
    }
    if (cvc.length < 3) {
      Alert.alert("Error", "CVC inválido");
      return false;
    }
    if (!cardHolder.trim()) {
      Alert.alert("Error", "Nombre del titular requerido");
      return false;
    }
    return true;
  };

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePagar = async () => {
    if (!user) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para continuar");
      router.push("/auth/login");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Carrito vacío", "No hay servicios para pagar");
      router.push("/(tabs)/cart");
      return;
    }

    if (!bookingId) {
      Alert.alert("Error", "No se encontró la reserva asociada");
      return;
    }

    // Validar según método de pago
    if (metodoPago === "tarjeta" && !validarTarjeta()) {
      return;
    }

    if (metodoPago === "wallet" && walletBalance < total) {
      Alert.alert(
        "Saldo insuficiente", 
        `Tu saldo actual es ${formatCLP(walletBalance)}. ¿Quieres recargar?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Recargar", onPress: () => router.push("/(tabs)/account/payments") }
        ]
      );
      return;
    }

    try {
      setLoading(true);

      // Simular proceso de pago
      // NOTA: El pago ya fue creado en bookingController.createBooking
      // Solo limpiamos el carrito y confirmamos la reserva
      
      // Limpiar carrito
      clearCart();

      // Mostrar resultado con Alert
      Alert.alert(
        "¡Pago exitoso!",
        `Tu pago de ${formatCLP(total)} se ha realizado correctamente.`,
        [
          { 
            text: "Ver mis reservas", 
            onPress: () => router.push("/(tabs)/account/history")
          },
          { 
            text: "Seguir comprando", 
            onPress: () => router.push("/(tabs)/home"),
            style: "cancel"
          }
        ]
      );

    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      Alert.alert(
        "Error", 
        error?.message || "No se pudo procesar el pago"
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <Ionicons name="cart-outline" size={64} color={theme.colors.muted} />
        <Text style={styles.emptyText}>No hay servicios para pagar</Text>
        <Pressable onPress={() => router.push("/(tabs)/home")} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Ir al inicio</Text>
        </Pressable>
      </View>
    );
  }

  if (!bookingId) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.emptyText}>Error en la reserva</Text>
        <Text style={styles.emptyText}>No se encontró la información de la reserva</Text>
        <Pressable onPress={() => router.push("/(tabs)/cart")} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Volver al carrito</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Resumen de compra */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de compra</Text>
          <View style={styles.card}>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.itemPrice}>{formatCLP(item.precio || 0)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>{formatCLP(total)}</Text>
            </View>
          </View>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          
          {/* Efectivo */}
          <Pressable
            onPress={() => setMetodoPago("efectivo")}
            style={[styles.paymentOption, metodoPago === "efectivo" && styles.paymentOptionSelected]}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color={metodoPago === "efectivo" ? theme.colors.primary : theme.colors.onSurface} 
              />
              <View>
                <Text style={styles.paymentOptionTitle}>Efectivo</Text>
                <Text style={styles.paymentOptionSub}>Paga al profesional</Text>
              </View>
            </View>
            {metodoPago === "efectivo" && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </Pressable>

          {/* Billetera SMarket */}
          <Pressable
            onPress={() => setMetodoPago("wallet")}
            style={[styles.paymentOption, metodoPago === "wallet" && styles.paymentOptionSelected]}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons 
                name="wallet-outline" 
                size={24} 
                color={metodoPago === "wallet" ? theme.colors.primary : theme.colors.onSurface} 
              />
              <View>
                <Text style={styles.paymentOptionTitle}>SMarket Cash</Text>
                <Text style={styles.paymentOptionSub}>
                  Saldo: {formatCLP(walletBalance)}
                </Text>
              </View>
            </View>
            {metodoPago === "wallet" && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </Pressable>

          {/* Tarjeta de crédito/débito */}
          <Pressable
            onPress={() => setMetodoPago("tarjeta")}
            style={[styles.paymentOption, metodoPago === "tarjeta" && styles.paymentOptionSelected]}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={metodoPago === "tarjeta" ? theme.colors.primary : theme.colors.onSurface} 
              />
              <View>
                <Text style={styles.paymentOptionTitle}>Tarjeta</Text>
                <Text style={styles.paymentOptionSub}>Crédito o débito</Text>
              </View>
            </View>
            {metodoPago === "tarjeta" && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </Pressable>

          {/* Formulario de tarjeta (solo si se selecciona) */}
          {metodoPago === "tarjeta" && (
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="Número de tarjeta"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
              <TextInput
                style={styles.input}
                placeholder="Titular de la tarjeta"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  keyboardType="number-pad"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVC"
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          )}
        </View>

        {/* Botón de pago */}
        <Pressable
          onPress={handlePagar}
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pagar {formatCLP(total)}
            </Text>
          )}
        </Pressable>

        {/* Términos y condiciones */}
        <Text style={styles.termsText}>
          Al pagar aceptas nuestros términos y condiciones
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    padding: theme.spacing.xs,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    fontWeight: "500",
  },

  section: {
    marginBottom: theme.spacing.xl,
  },

  sectionTitle: {
    fontSize: 15,
    color: "#1E1240",
    marginBottom: 12,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },

  profesionalName: {
    fontSize: 14,
    color: "#1E1240",
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },

  itemName: {
    fontSize: 14,
    color: "#1E1240",
    flex: 1,
    fontWeight: "500",
  },

  itemPrice: {
    fontSize: 14,
    color: "#1E1240",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(17, 24, 39, 0.08)",
    marginVertical: theme.spacing.md,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalText: {
    fontSize: 15,
    color: "#1E1240",
    fontWeight: "700",
  },

  totalAmount: {
    fontSize: 18,
    color: "#14B8A6",
    fontWeight: "800",
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.05)",
    marginBottom: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },

  paymentOptionSelected: {
    borderColor: "#14B8A6",
    borderWidth: 2,
  },

  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  paymentOptionTitle: {
    fontSize: 14,
    color: "#1E1240",
    fontWeight: "700",
  },

  paymentOptionSub: {
    fontSize: 12,
    color: "#6B7280",
    opacity: 0.9,
    marginTop: 2,
    fontWeight: "500",
  },

  cardForm: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.10)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1E1240",
    backgroundColor: "#FFFFFF",
    marginBottom: theme.spacing.sm,
    fontSize: 14,
    fontWeight: "500",
  },

  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },

  halfInput: {
    flex: 1,
  },

  payButton: {
    backgroundColor: "#14B8A6",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },

  payButtonDisabled: {
    opacity: 0.5,
  },

  payButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  termsText: {
    fontSize: 12,
    color: "#6B7280",
    opacity: 0.75,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    fontWeight: "500",
  },

  primaryBtn: {
    backgroundColor: "#14B8A6",
    borderRadius: 18,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },

  primaryBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});