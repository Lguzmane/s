//components/profile/ProfessionalInfo.tsx
import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../styles/theme";

type Props = {
  editableData: Record<string, any>;
  isEditing: boolean;
  handleChange: (name: string, value: string) => void;
  accordionOpen: Record<string, boolean>;
  toggleAccordion: (key: string) => void;
};

export default function ProfessionalInfo({
  editableData = {},
  isEditing,
  handleChange,
  accordionOpen,
  toggleAccordion,
}: Props) {
  const sections = ["certificaciones", "experiencia", "condiciones", "contacto"];

  return (
    <View style={[styles.card, styles.cardBorder, styles.cardPadding, styles.mbMd]}>
      <Text style={styles.title}>Trabajo</Text>

      {sections.map((key) => (
        <View key={key} style={styles.section}>
          <Pressable onPress={() => toggleAccordion(key)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {key === "condiciones"
                ? "Condiciones del Servicio"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <Text style={styles.sectionIcon}>{accordionOpen[key] ? "−" : "+"}</Text>
          </Pressable>

          {accordionOpen[key] && (
            <View style={styles.sectionBody}>
              {key === "contacto" ? (
                <>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Email:</Text>
                    {isEditing ? (
                      <TextInput
                        keyboardType="email-address"
                        value={editableData.email || ""}
                        onChangeText={(v) => handleChange("email", v)}
                        placeholder="Ingresa tu correo..."
                        placeholderTextColor={theme.colors.muted}
                        style={[styles.input, styles.mtXs]}
                        autoCapitalize="none"
                      />
                    ) : (
                      <Pressable
                        onPress={() =>
                          editableData.email &&
                          Linking.openURL(`mailto:${editableData.email}`)
                        }
                      >
                        <Text style={[styles.linkText, styles.mtXs]}>
                          {editableData.email || "No disponible"}
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Teléfono:</Text>
                    {isEditing ? (
                      <TextInput
                        keyboardType="phone-pad"
                        value={editableData.telefono || ""}
                        onChangeText={(v) => handleChange("telefono", v)}
                        placeholder="Ingresa tu número..."
                        placeholderTextColor={theme.colors.muted}
                        style={[styles.input, styles.mtXs]}
                      />
                    ) : (
                      <Pressable
                        onPress={() =>
                          editableData.telefono &&
                          Linking.openURL(`tel:${editableData.telefono}`)
                        }
                      >
                        <Text style={[styles.linkText, styles.mtXs]}>
                          {editableData.telefono || "No disponible"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </>
              ) : isEditing ? (
                <TextInput
                  multiline
                  value={editableData[key] || ""}
                  onChangeText={(v) => handleChange(key, v)}
                  placeholder={`Ingresa tus ${key}...`}
                  placeholderTextColor={theme.colors.muted}
                  style={styles.textarea}
                />
              ) : (
                <Text style={styles.bodyText}>
                  {editableData[key] || `No hay ${key} registradas.`}
                </Text>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  cardBorder: {
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.06)",
  },

  cardPadding: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  mbMd: {
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.3,
    marginBottom: 8,
  },

  section: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    overflow: "hidden",
  },

  sectionHeader: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
  },

  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1E1240",
    letterSpacing: -0.2,
    paddingRight: 12,
  },

  sectionIcon: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "700",
    color: "#14B8A6",
    marginTop: -2,
  },

  sectionBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  field: {
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(30, 18, 64, 0.72)",
    letterSpacing: -0.2,
  },

  bodyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(30, 18, 64, 0.78)",
    lineHeight: 21,
    letterSpacing: -0.2,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.10)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "500",
    color: "#1E1240",
  },

  textarea: {
    minHeight: 118,
    textAlignVertical: "top",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.10)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "500",
    color: "#1E1240",
    lineHeight: 20,
  },

  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14B8A6",
    letterSpacing: -0.2,
    textDecorationLine: "underline",
  },

  mtXs: {
    marginTop: 8,
  },
});