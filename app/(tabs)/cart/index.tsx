// app/(tabs)/cart/index.tsx
import { router, type Href } from "expo-router";
import React, { useMemo, useState, useContext } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useCart } from "../../../context/CartContext";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";
import { theme } from "../../../styles/theme";

export default function CartScreen() {
  const { user } = useContext(AuthContext);
  const cartCtx = useCart();
  const [loading, setLoading] = useState(false);
  const [validandoCupon, setValidandoCupon] = useState(false);

  const cartItems = Array.isArray(cartCtx?.cartItems) ? cartCtx.cartItems : [];
  const removeFromCart = cartCtx?.removeFromCart ?? (() => {});
  const { getProfesionalInfo } = useCart();
  const profesionalInfo = getProfesionalInfo();

  const safeNumber = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const [descuento, setDescuento] = useState(0);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<any>(null);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + safeNumber(item?.precio), 0),
    [cartItems]
  );
  const total = useMemo(() => Math.max(0, subtotal - descuento), [subtotal, descuento]);

  const handleAplicarCupon = async () => {
    const code = codigoCupon.trim().toUpperCase();
    if (!code) {
      Alert.alert("Error", "Ingresa un código de cupón");
      return;
    }

    try {
      setValidandoCupon(true);

      const response = await api.post("/api/coupon/validate", {
        codigo: code,
        monto: subtotal,
        usuarioId: user?.id,
      });

      if (response.data.success) {
        setDescuento(response.data.data.descuento);
        setCuponAplicado(response.data.data);
        Alert.alert(
          "Cupón aplicado",
          `Descuento de $${response.data.data.descuento.toLocaleString("es-CL")} aplicado 🎉`
        );
      }
    } catch (error: any) {
      console.error("Error validando cupón:", error);
      setDescuento(0);
      setCuponAplicado(null);

      const mensaje = error.response?.data?.message || "El cupón no es válido o ha expirado";
      Alert.alert("Cupón inválido", mensaje);
    } finally {
      setValidandoCupon(false);
    }
  };

  const handlePagar = () => {
    if (!user) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para continuar");
      router.push("/auth/login" as Href);
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Carrito vacío", "Agrega servicios al carrito primero");
      return;
    }

    router.push("/checkout" as Href);
  };

  const quitarCupon = () => {
    setDescuento(0);
    setCuponAplicado(null);
    setCodigoCupon("");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Carrito de Compras</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Tu carrito está vacío 🛒</Text>
      ) : (
        <>
          {profesionalInfo.id && (
            <View style={[styles.couponCard, { marginTop: 0, marginBottom: theme.spacing.sm }]}>
              <Text style={styles.couponTitle}>Profesional</Text>
              <Text style={styles.summaryText}>{profesionalInfo.nombre}</Text>
            </View>
          )}

          {cartItems.map((item, i) => (
            <View key={item.bookingId ?? item.id ?? `item-${i}`} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.nombre ?? "Servicio"}</Text>
                <Text style={styles.itemPrice}>
                  ${safeNumber(item.precio).toLocaleString("es-CL")}
                </Text>
                {item.bookingId && (
                  <Text style={styles.summaryText}>
                    Reserva ID: {item.bookingId}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => removeFromCart(item.bookingId ?? item.id)}
                style={styles.removeBtn}
                disabled={loading}
              >
                <Text style={styles.removeBtnLabel}>Eliminar</Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.couponCard}>
            <Text style={styles.couponTitle}>Cupón de descuento</Text>
            <View style={styles.couponRow}>
              <TextInput
                placeholder="Ingresa tu cupón"
                placeholderTextColor={theme.colors.onPrimary + "B3"}
                value={codigoCupon}
                onChangeText={setCodigoCupon}
                style={styles.input}
                autoCapitalize="characters"
                returnKeyType="done"
                editable={!validandoCupon && !cuponAplicado}
              />
              {validandoCupon ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : cuponAplicado ? (
                <Pressable
                  onPress={quitarCupon}
                  style={styles.applyBtn}
                >
                  <Text style={styles.applyBtnLabel}>Quitar</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleAplicarCupon}
                  style={styles.applyBtn}
                  disabled={!codigoCupon.trim()}
                >
                  <Text style={styles.applyBtnLabel}>Aplicar</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Subtotal</Text>
              <Text style={styles.summaryText}>${subtotal.toLocaleString("es-CL")}</Text>
            </View>

            {descuento > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Descuento</Text>
                <Text style={styles.summaryText}>-${descuento.toLocaleString("es-CL")}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>TOTAL</Text>
              <Text style={styles.totalText}>${total.toLocaleString("es-CL")}</Text>
            </View>
          </View>

          <Pressable
            onPress={handlePagar}
            style={[styles.payBtn, loading && { opacity: 0.5 }]}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payBtnLabel}>Pagar ahora</Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 22,
    letterSpacing: -0.4,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: "#1E1240",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  empty: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    paddingVertical: 28,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  couponCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginTop: 14,
  },

  couponTitle: {
    color: "#1E1240",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },

  itemRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  itemLeft: {
    flex: 1,
  },

  itemName: {
    color: "#1E1240",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },

  itemPrice: {
    color: "#14B8A6",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },

  removeBtn: {
    backgroundColor: "rgba(30, 18, 64, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  removeBtnLabel: {
    color: "#1E1240",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#1E1240",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(101, 247, 247, 0.18)",
  },

  applyBtn: {
    backgroundColor: "#14B8A6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 84,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  applyBtnLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  summary: {
    backgroundColor: "#1E1240",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(101, 247, 247, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 16,
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(101, 247, 247, 0.18)",
  },

  totalText: {
    color: "#65f7f7",
    fontSize: 18,
    fontWeight: "800",
  },

  payBtn: {
    backgroundColor: "#14B8A6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },

  payBtnLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});