//components/profile/ProfileHeader.tsx
import React from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../styles/theme";
import RatingStars from "../ui/RatingStars";

type Props = {
  editableData: any;
  isEditing: boolean;
  handleChange: (name: string, value: string) => void;
  handleEditProfile: () => void;
  handleSaveProfile: () => void;
  isOwnProfile?: boolean;
};

const DEFAULT_PHOTO = "https://via.placeholder.com/120.png?text=+Perfil";

export default function ProfileHeader({
  editableData = {},
  isEditing,
  handleChange,
  handleEditProfile,
  handleSaveProfile,
  isOwnProfile = true,
}: Props) {
  const {
    nombre = "",
    apellidoPaterno = "",
    apellidoMaterno = "",
    comuna = "",
    region = "",
    sitio_web = "",
    fotoPerfil = DEFAULT_PHOTO,
    rol = "Cliente",
    rating = 0,
    proxima_fecha = "",
  } = editableData || {};

  const nombreCompleto =
    [nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ") ||
    "Usuario";

  const openSite = () => {
    if (!sitio_web) return;
    const url = /^https?:\/\//i.test(sitio_web) ? sitio_web : `https://${sitio_web}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.card, styles.cardBorder, styles.cardPadding]}>
      {isOwnProfile && (
        <View style={styles.editButtonWrap}>
          {!isEditing ? (
            <Pressable
              onPress={handleEditProfile}
              style={[styles.button, styles.buttonPrimary]}
            >
              <Text style={styles.buttonIcon}>✎</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSaveProfile}
              style={[styles.button, styles.buttonSuccess]}
            >
              <Text style={styles.buttonIcon}>✓</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Cabecera: foto + nombre */}
      <View style={styles.row}>
        <Image
          source={{ uri: fotoPerfil || DEFAULT_PHOTO }}
          style={styles.avatar}
          resizeMode="cover"
        />

        <View style={styles.flex1}>
          {isEditing ? (
            <>
              <TextInput
                placeholder="Nombre"
                placeholderTextColor={theme.colors.muted}
                value={nombre}
                onChangeText={(v) => handleChange("nombre", v)}
                style={[styles.input, styles.inputSpacingSm]}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <View style={[styles.row, styles.gapSm]}>
                <TextInput
                  placeholder="Apellido paterno"
                  placeholderTextColor={theme.colors.muted}
                  value={apellidoPaterno}
                  onChangeText={(v) => handleChange("apellidoPaterno", v)}
                  style={[styles.input, styles.flex1]}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <TextInput
                  placeholder="Apellido materno"
                  placeholderTextColor={theme.colors.muted}
                  value={apellidoMaterno}
                  onChangeText={(v) => handleChange("apellidoMaterno", v)}
                  style={[styles.input, styles.flex1]}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{nombreCompleto}</Text>
              {rol === "Profesional" ? (
                <View style={styles.mtXs}>
                  <RatingStars rating={Number(rating) || 0} size={17} />
                </View>
              ) : null}
            </>
          )}
        </View>
      </View>

      {/* Ubicación / Próxima fecha / Sitio */}
      <View style={styles.mtMd}>
        {isEditing ? (
          <>
            <View style={[styles.row, styles.gapSm, styles.mbSm]}>
              <TextInput
                placeholder="Comuna"
                placeholderTextColor={theme.colors.muted}
                value={comuna}
                onChangeText={(v) => handleChange("comuna", v)}
                style={[styles.input, styles.flex1]}
                autoCapitalize="words"
                returnKeyType="next"
              />
              <TextInput
                placeholder="Región"
                placeholderTextColor={theme.colors.muted}
                value={region}
                onChangeText={(v) => handleChange("region", v)}
                style={[styles.input, styles.flex1]}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <TextInput
              placeholder="Sitio web (https://...)"
              placeholderTextColor={theme.colors.muted}
              value={sitio_web}
              onChangeText={(v) => handleChange("sitio_web", v)}
              autoCapitalize="none"
              style={styles.input}
              returnKeyType="done"
            />
          </>
        ) : (
          <>
            {(comuna || region) ? (
              <Text style={styles.locationText}>
                {comuna ? comuna : ""}
                {comuna && region ? ", " : ""}
                {region ? region : ""}
              </Text>
            ) : null}

            {proxima_fecha ? (
              <Text style={styles.infoText}>
                Próxima fecha disponible:{" "}
                {new Date(proxima_fecha).toLocaleDateString("es-CL")}
              </Text>
            ) : null}

            {sitio_web ? (
              <Pressable
                onPress={openSite}
                style={styles.mtXs}
                accessibilityRole="link"
              >
                <Text style={styles.linkText}>
                  {sitio_web.replace(/^https?:\/\//, "")}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: "visible",
    position: "relative",
  },

  cardBorder: {
    borderWidth: 0,
    borderColor: "transparent",
  },

  cardPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  flex1: {
    flex: 1,
    justifyContent: "center",
    minHeight: 112,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
    borderWidth: 0,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1240",
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 4,
    paddingRight: 26,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(30, 18, 64, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: "500",
    color: "#1E1240",
  },

  inputSpacingSm: {
    marginBottom: 8,
  },

  gapSm: {
    gap: 8,
  },

  mtXs: {
    marginTop: 6,
  },

  mtMd: {
    marginTop: 12,
  },

  mbSm: {
    marginBottom: 8,
  },

  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(30, 18, 64, 0.72)",
    letterSpacing: -0.2,
    marginBottom: 4,
  },

  infoText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(30, 18, 64, 0.72)",
    lineHeight: 18,
    letterSpacing: -0.2,
  },

  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14B8A6",
    textDecorationLine: "underline",
    letterSpacing: -0.2,
  },

  button: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    minHeight: 0,
    flexShrink: 0,
  },

  buttonPrimary: {
    backgroundColor: "#14B8A6",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  buttonSuccess: {
    backgroundColor: "#14B8A6",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  editButtonWrap: {
    position: "absolute",
    top: -2,
    right: -2,
    zIndex: 10,
  },

  buttonIcon: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 10,
  },
});