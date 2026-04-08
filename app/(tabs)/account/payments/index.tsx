//app/payments/index.tsx 
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { theme } from "../../../../styles/theme";
import { getMyPayments, formatCLP, Payment } from "../../../../services/paymentService";
import AsyncStorage from '@react-native-async-storage/async-storage';

type PaymentStatus = "retenido" | "liberado" | "cancelado";

export default function PaymentsScreen() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState(0);

  // Form tarjeta (solo UI local, no afecta pago transaccional)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [cvc, setCvc] = useState("");

  // Toggles y valores para descuento / referidos
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    loadPayments();
    loadUserBalance();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userPayments = await getMyPayments(user.rol === 'Profesional' ? 'profesional' : 'cliente');
        setPayments(userPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Si el usuario tiene campo saldo, lo cargamos
        setBalance(user.saldo || 0);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const addFunds = () => {
    Alert.alert(
      "Agregar fondos",
      "Selecciona el monto a recargar",
      [
        { text: "$5,000", onPress: () => handleAddFunds(5000) },
        { text: "$10,000", onPress: () => handleAddFunds(10000) },
        { text: "$20,000", onPress: () => handleAddFunds(20000) },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleAddFunds = async (amount: number) => {
    try {
      setLoading(true);
      // Aquí iría la lógica de recarga de billetera
      Alert.alert("Éxito", `Se agregaron ${formatCLP(amount)} a tu billetera`);
      setBalance(prev => prev + amount);
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar fondos");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setCardHolder("");
    setExpiry("");
    setCvc("");
  };

  const handleSaveMethod = async () => {
    if (cardNumber.replace(/\s/g, "").length < 13) {
      Alert.alert("Revisa tu tarjeta", "El número parece inválido.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      Alert.alert("Revisa el vencimiento", "Usa el formato MM/YY.");
      return;
    }
    if (cvc.length < 3) {
      Alert.alert("Revisa el CVC", "Debe tener 3 o 4 dígitos.");
      return;
    }

    try {
      setLoading(true);
      // Aquí iría la llamada al backend para guardar el método de pago
      Alert.alert("Método agregado", "Tu tarjeta ha sido guardada correctamente");
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el método de pago");
    } finally {
      setLoading(false);
    }
  };

  const submitDiscount = () => {
    if (!discountCode.trim()) {
      Alert.alert("Código vacío", "Escribe tu código de descuento.");
      return;
    }
    Alert.alert("Código aplicado", `Se aplicó: ${discountCode}`);
    setDiscountCode("");
    setShowDiscountForm(false);
  };

  const submitReferral = () => {
    if (!referralCode.trim()) {
      Alert.alert("Código vacío", "Escribe tu código de referido.");
      return;
    }
    Alert.alert("Código enviado", `Gracias por referir: ${referralCode}`);
    setReferralCode("");
    setShowReferralForm(false);
  };

  const getRecentPayments = () => {
    return payments.slice(0, 3);
  };

  const getPaymentStatusColor = (estado: PaymentStatus): string => {
    const colors = {
      retenido: '#FFA000',
      liberado: '#4CAF50',
      cancelado: '#757575'
    };
    return colors[estado] || '#757575';
  };

  const getPaymentStatusIcon = (estado: PaymentStatus): keyof typeof Ionicons.glyphMap => {
    const icons = {
      retenido: 'time-outline',
      liberado: 'checkmark-circle',
      cancelado: 'close-circle'
    } as const;
    return icons[estado];
  };

  if (loading && payments.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#F3F4F6" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* ====== Título ====== */}
        <Text style={styles.title}>Billetera</Text>

        {/* ====== SMarket Cash ====== */}
        <View style={styles.cashCard}>
          <View style={styles.cashHeader}>
            <Text style={styles.cashTitle}>SMarket Cash</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurface} />
          </View>

          <Text style={styles.cashAmount}>{formatCLP(balance)}</Text>
          <View style={styles.cashRow}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.colors.onSurface} />
            <Text style={styles.cashHint}>La recarga automática está desactivada</Text>
          </View>

          <Pressable onPress={addFunds} style={styles.primaryBtn} disabled={loading}>
            <Ionicons name="add" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.primaryBtnText}>Agregar fondos</Text>
          </Pressable>
        </View>

        {/* ====== Métodos de pago ====== */}
        <Text style={styles.sectionLabel}>Métodos de pago</Text>

        {/* Grupo tipo card con filas */}
        <View style={styles.cardGroup}>
          {/* Fila fija: Efectivo */}
          <View style={[styles.listItem, styles.firstItem]}>
            <View style={styles.iconBoxCash}>
              <Ionicons name="cash-outline" size={22} color="#14B8A6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Efectivo</Text>
              <Text style={styles.rowSub}>Paga directamente al profesional</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
          </View>

          {/* Fila: Agregar método de pago */}
          <Pressable
            onPress={() => setShowAddForm(true)}
            style={[styles.listItem, styles.lastItem]}
            android_ripple={{ color: theme.colors.border }}
          >
            <View style={styles.iconBoxGold}>
              <Ionicons name="card-outline" size={22} color="#D4A017" />
            </View>
            <Text style={styles.rowTitle}>Agregar un método de pago</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurface} />
          </Pressable>
        </View>

        {/* ====== Transacciones recientes ====== */}
        {payments.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Transacciones recientes</Text>
            <View style={styles.cardGroup}>
              {getRecentPayments().map((payment, index) => (
                <View
                  key={payment.id}
                  style={[
                    styles.listItem,
                    index === 0 ? styles.firstItem : null,
                    index === getRecentPayments().length - 1 ? styles.lastItem : null,
                  ]}
                >
                  <View style={styles.iconBox}>
                    <Ionicons
                      name={getPaymentStatusIcon(payment.estado as PaymentStatus)}
                      size={22}
                      color={getPaymentStatusColor(payment.estado as PaymentStatus)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {payment.booking?.servicio?.nombre || 'Pago'}
                    </Text>
                    <Text style={styles.rowSub}>
                      {new Date(payment.createdAt).toLocaleDateString('es-CL')}
                    </Text>
                  </View>
                  <Text style={[styles.amount, {
                    color: payment.estado === 'liberado' ? theme.colors.primary :
                      payment.estado === 'retenido' ? '#FFA000' : '#757575'
                  }]}>
                    {formatCLP(payment.monto)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ====== Descuentos ====== */}
        <Text style={styles.sectionLabel}>Descuentos</Text>
        <Pressable
          onPress={() => setShowDiscountForm((v) => !v)}
          style={styles.rowItem}
        >
          <View style={styles.rowLeft}>
            <View style={styles.iconBoxPink}>
              <Ionicons name="pricetag-outline" size={20} color="#EC4899" />
            </View>
            <Text style={styles.rowText}>Agregar código de descuento</Text>
          </View>
          <Ionicons
            name={showDiscountForm ? "chevron-up" : "chevron-forward"}
            size={18}
            color={theme.colors.onSurface}
          />
        </Pressable>

        {showDiscountForm && (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.sm,
              paddingBottom: theme.spacing.lg,
            }}
          >
            <TextInput
              value={discountCode}
              onChangeText={setDiscountCode}
              placeholder="INGRESA-TU-CODIGO"
              style={styles.input}
              autoCapitalize="characters"
            />
            <Pressable onPress={submitDiscount} style={[styles.primaryBtnFull, { marginTop: theme.spacing.sm }]}>
              <Text style={styles.primaryBtnFullText}>Aplicar</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.separator} />

        {/* ====== Referidos ====== */}
        <Text style={styles.sectionLabel}>Referidos</Text>
        <Pressable
          onPress={() => setShowReferralForm((v) => !v)}
          style={styles.rowItem}
        >
          <View style={styles.rowLeft}>
            <View style={styles.iconBoxPink}>
              <Ionicons name="gift-outline" size={20} color="#EC4899" />
            </View>
            <Text style={styles.rowText}>Agregar código de referido</Text>
          </View>
          <Ionicons
            name={showReferralForm ? "chevron-up" : "chevron-forward"}
            size={18}
            color={theme.colors.onSurface}
          />
        </Pressable>

        {showReferralForm && (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.sm,
              paddingBottom: theme.spacing.lg,
            }}
          >
            <TextInput
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="CÓDIGO-REFERIDO"
              style={styles.input}
              autoCapitalize="characters"
            />
            <Pressable onPress={submitReferral} style={[styles.primaryBtnFull, { marginTop: theme.spacing.sm }]}>
              <Text style={styles.primaryBtnFullText}>Agregar</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>

      {/* ====== Modal: Agregar método (UI local, no afecta pago transaccional) ====== */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddForm(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.sheet}>
            {/* Header del sheet */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Nuevo método de pago</Text>
              <Pressable onPress={() => setShowAddForm(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.colors.onSurface} />
              </Pressable>
            </View>

            {/* Campos */}
            <View style={styles.field}>
              <Text style={styles.label}>Número de tarjeta</Text>
              <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                style={styles.input}
                maxLength={19}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Titular</Text>
              <TextInput
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Nombre y apellido"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row2}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Vencimiento</Text>
                <TextInput
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  style={styles.input}
                  maxLength={5}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>CVC</Text>
                <TextInput
                  value={cvc}
                  onChangeText={setCvc}
                  placeholder="CVC"
                  keyboardType="number-pad"
                  style={styles.input}
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <Pressable onPress={handleSaveMethod} style={styles.primaryBtnFull} disabled={loading}>
              <Text style={styles.primaryBtnFullText}>Guardar método</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
    paddingBottom: 0,
  },

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

  cashCard: {
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
    marginBottom: 18,
  },

  cashHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cashTitle: {
    color: "#65f7f7",
    fontSize: 16,
    fontWeight: "800",
  },

  cashAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.4,
  },

  cashRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },

  cashHint: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  primaryBtn: {
    backgroundColor: "#14B8A6",
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  sectionLabel: {
    color: "#1E1240",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
    marginTop: 2,
  },

  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 18,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },

  firstItem: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  lastItem: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(30, 18, 64, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxCash: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(20, 184, 166, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxGold: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(212, 160, 23, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxPink: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(236, 72, 153, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  rowTitle: {
    color: "#1E1240",
    fontSize: 15,
    fontWeight: "700",
  },

  rowSub: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  amount: {
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  rowItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 10,
  },

  rowText: {
    color: "#1E1240",
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#FFFFFF",
    color: "#1E1240",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.10)",
  },

  primaryBtnFull: {
    backgroundColor: "#14B8A6",
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryBtnFullText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  separator: {
    height: 6,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sheetTitle: {
    color: "#1E1240",
    fontSize: 18,
    fontWeight: "800",
  },

  field: {
    marginBottom: 14,
  },

  label: {
    color: "#1E1240",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  row2: {
    flexDirection: "row",
    gap: 12,
  },
});