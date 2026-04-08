//components/forms/RegisterForm.tsx 
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import clData from "../../assets/data/regions/cl.json";
import servicesData from "../../assets/data/services.json";
import { AuthContext } from "../../context/AuthContext";

type RegionJSON = {
  nombre: string;
  comunas: string[];
};

type ServiciosJSON = {
  categorias?: { nombre: string }[];
  categororias?: { nombre: string }[]; // fallback por si viene mal escrito
};

export default function RegisterForm() {
  const { register, isLoading } = useContext(AuthContext);

  // Tipos explícitos para evitar que TS trate los JSON como {}
  const regiones: string[] = (clData as any).regiones.map(
    (r: RegionJSON) => r.nombre
  );

  const servicios = servicesData as unknown as ServiciosJSON;
  const categorias: string[] = servicios.categororias
    ? servicios.categororias.map((cat) => cat.nombre)
    : (servicios.categorias ?? []).map((cat) => cat.nombre);

  const [comunasDisponibles, setComunasDisponibles] = useState<string[]>([]);
  const [showRegionList, setShowRegionList] = useState(false);
  const [showComunaList, setShowComunaList] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    rut: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    region: "",
    comuna: "",
    tipoUsuario: "Cliente",
    experiencia: "",
    certificaciones: "",
    categoria: "",
    otraCategoria: "",
  });
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  // Estado para el cartel de éxito
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (name: string, value: string) => {
    if (name === "region") {
      const regionSeleccionada = (clData as any).regiones.find(
        (r: RegionJSON) => r.nombre === value
      );
      setComunasDisponibles(regionSeleccionada ? regionSeleccionada.comunas : []);
      setFormData((prev) => ({ ...prev, region: value, comuna: "" }));
      setShowComunaList(false);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleInterest = (cat: string) => {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async () => {
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      email,
      telefono,
      password,
      confirmPassword,
      region,
      comuna,
      categoria,
      otraCategoria,
      tipoUsuario,
      rut,
    } = formData;

    // Validaciones
    if (
      !nombre ||
      !apellidoPaterno ||
      !apellidoMaterno ||
      !email ||
      !telefono ||
      !password ||
      !confirmPassword ||
      !region ||
      !comuna
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (!email.includes("@")) {
      setError("El correo electrónico no es válido.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (tipoUsuario === "Profesional" && categoria === "") {
      setError("Selecciona una categoría de servicio.");
      return;
    }
    if (tipoUsuario === "Profesional" && categoria === "Otra" && !otraCategoria.trim()) {
      setError("Especifica tu categoría de servicio.");
      return;
    }

    setError("");
    setLocalLoading(true);

    const categoriaFinal = categoria === "Otra" ? otraCategoria : categoria;
    
    const datosFinales = {
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: apellidoMaterno.trim(),
      rut: rut?.trim() || undefined,
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      password: password,
      confirmPassword: confirmPassword,
      region: region.trim(),
      comuna: comuna.trim(),
      tipoUsuario: tipoUsuario,
      ...(tipoUsuario === "Profesional" && {
        categoria: categoriaFinal.trim(),
        experiencia: formData.experiencia.trim() || undefined,
        certificaciones: formData.certificaciones.trim() || undefined,
      }),
    };

    console.log("📤 Enviando datos:", JSON.stringify(datosFinales, null, 2));

    try {
      await register(datosFinales);
      
      // Mostrar cartel de éxito antes de redirigir
      setShowSuccess(true);
      
      // Esperar 2 segundos para que el usuario lea el mensaje
      setTimeout(() => {
        setShowSuccess(false);
        router.replace("/(tabs)/home");
      }, 2000);
      
    } catch (err: any) {
      console.log("🔥 Error completo:", err);
      
      let errorMessage = "Error en el registro.";
      
      if (err.message) {
        if (err.message.includes("email")) {
          errorMessage = "El correo electrónico ya está registrado.";
        } else if (err.message.includes("password")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
        } else if (err.message.includes("rut")) {
          errorMessage = "El RUT ingresado no es válido.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = localLoading || isLoading;

  return (
    <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
      {!!error && (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* CARTEL DE ÉXITO */}
      {showSuccess && (
        <View style={[styles.errorBox, { backgroundColor: "#65F7F7" }]}>
          <Text style={[styles.errorText, { color: "#1E1240" }]}>
            ✅ ¡Registro exitoso! Bienvenido/a.
          </Text>
        </View>
      )}

      {/* Nombres */}
      <View style={styles.row}>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#6B7280"
          value={formData.nombre}
          onChangeText={(v) => handleChange("nombre", v)}
          style={[styles.input, styles.flex]}
          autoCapitalize="words"
          returnKeyType="next"
          editable={!isButtonLoading}
        />
        <TextInput
          placeholder="Apellido Paterno"
          placeholderTextColor="#6B7280"
          value={formData.apellidoPaterno}
          onChangeText={(v) => handleChange("apellidoPaterno", v)}
          style={[styles.input, styles.flex]}
          autoCapitalize="words"
          returnKeyType="next"
          editable={!isButtonLoading}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          placeholder="Apellido Materno"
          placeholderTextColor="#6B7280"
          value={formData.apellidoMaterno}
          onChangeText={(v) => handleChange("apellidoMaterno", v)}
          style={[styles.input, styles.flex]}
          autoCapitalize="words"
          returnKeyType="next"
          editable={!isButtonLoading}
        />
        <TextInput
          placeholder="RUT"
          placeholderTextColor="#6B7280"
          value={formData.rut}
          onChangeText={(v) => handleChange("rut", v)}
          style={[styles.input, styles.flex]}
          autoCapitalize="characters"
          returnKeyType="next"
          editable={!isButtonLoading}
        />
      </View>

      <TextInput
        placeholder="Correo Electrónico"
        placeholderTextColor="#6B7280"
        value={formData.email}
        onChangeText={(v) => handleChange("email", v)}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
        autoComplete="email"
        style={[styles.input, styles.inputSpacing]}
        returnKeyType="next"
        editable={!isButtonLoading}
      />

      <TextInput
        placeholder="Teléfono"
        placeholderTextColor="#6B7280"
        value={formData.telefono}
        onChangeText={(v) => handleChange("telefono", v)}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        style={[styles.input, styles.inputSpacing]}
        returnKeyType="next"
        editable={!isButtonLoading}
      />

      <View style={styles.row}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#6B7280"
          value={formData.password}
          onChangeText={(v) => handleChange("password", v)}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          style={[styles.input, styles.flex]}
          returnKeyType="next"
          editable={!isButtonLoading}
        />
        <TextInput
          placeholder="Confirmar Contraseña"
          placeholderTextColor="#6B7280"
          value={formData.confirmPassword}
          onChangeText={(v) => handleChange("confirmPassword", v)}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          style={[styles.input, styles.flex]}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!isButtonLoading}
        />
      </View>

      {/* Región - desplegable */}
      <View style={[styles.section, styles.sectionSpacing]}>
        <Text style={styles.sectionLabel}>Región</Text>

        <View style={styles.selectWrapper}>
          <Pressable
            style={styles.select}
            onPress={() => setShowRegionList((prev) => !prev)}
            disabled={isButtonLoading}
          >
            <Text
              style={
                formData.region ? styles.selectValue : styles.selectPlaceholder
              }
            >
              {formData.region || "Selecciona una región"}
            </Text>
          </Pressable>

          {showRegionList && !isButtonLoading && (
            <View style={styles.selectDropdown}>
              {regiones.map((r) => (
                <Pressable
                  key={`region-${r}`}
                  style={styles.selectOption}
                  onPress={() => {
                    handleChange("region", r);
                    setShowRegionList(false);
                    setShowComunaList(false);
                  }}
                >
                  <Text style={styles.selectOptionLabel}>{r}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Comuna - desplegable */}
      <View style={[styles.section, styles.sectionSpacing]}>
        <Text style={styles.sectionLabel}>Comuna</Text>

        <View style={styles.selectWrapper}>
          <Pressable
            style={[
              styles.select,
              comunasDisponibles.length === 0 && styles.selectDisabled,
            ]}
            onPress={() => {
              if (comunasDisponibles.length > 0) {
                setShowComunaList((prev) => !prev);
              }
            }}
            disabled={isButtonLoading}
          >
            <Text
              style={
                formData.comuna ? styles.selectValue : styles.selectPlaceholder
              }
            >
              {comunasDisponibles.length === 0
                ? "Selecciona una región primero"
                : formData.comuna || "Selecciona una comuna"}
            </Text>
          </Pressable>

          {showComunaList && comunasDisponibles.length > 0 && !isButtonLoading && (
            <View style={styles.selectDropdown}>
              {comunasDisponibles.map((c) => (
                <Pressable
                  key={`comuna-${c}`}
                  style={styles.selectOption}
                  onPress={() => {
                    handleChange("comuna", c);
                    setShowComunaList(false);
                  }}
                >
                  <Text style={styles.selectOptionLabel}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Tipo de usuario */}
      <View style={[styles.section, styles.sectionSpacing]}>
        <Text style={styles.sectionLabel}>Tipo de Usuario</Text>
        <View style={styles.chipsWrap}>
          {["Cliente", "Profesional"].map((tipo: string, i: number) => {
            const selected = formData.tipoUsuario === tipo;
            return (
              <Pressable
                key={`tipo-${i}`}
                onPress={() => handleChange("tipoUsuario", tipo)}
                style={[
                  styles.optionItem,
                  selected && styles.optionItemSelected,
                ]}
                disabled={isButtonLoading}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {tipo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Categorías (Profesional) */}
      {formData.tipoUsuario === "Profesional" && (
        <View style={[styles.section, styles.sectionSpacing]}>
          <Text style={styles.sectionLabel}>Categoría de servicio</Text>

          <View style={styles.chipsWrap}>
            {categorias.map((cat: string, i: number) => {
              const selected = formData.categoria === cat;
              return (
                <Pressable
                  key={`cat-${i}`}
                  onPress={() => handleChange("categoria", cat)}
                  style={[
                    styles.optionItem,
                    selected && styles.optionItemSelected,
                  ]}
                  disabled={isButtonLoading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => handleChange("categoria", "Otra")}
              style={[
                styles.optionItem,
                formData.categoria === "Otra" && styles.optionItemSelected,
              ]}
              disabled={isButtonLoading}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.categoria === "Otra" && styles.optionTextSelected,
                ]}
              >
                Otra
              </Text>
            </Pressable>
          </View>

          {formData.categoria === "Otra" && (
            <TextInput
              placeholder="Especifica tu categoría"
              placeholderTextColor="#6B7280"
              value={formData.otraCategoria}
              onChangeText={(v) => handleChange("otraCategoria", v)}
              style={[styles.input, styles.inputTopSpacing]}
              editable={!isButtonLoading}
            />
          )}
        </View>
      )}

      {/* Categorías de interés (multiselect, para cualquier tipo de usuario) */}
      <View style={[styles.section, styles.sectionSpacing]}>
        <Text style={styles.sectionLabel}>Categorías de interés</Text>
        <Text style={styles.hintText}>
          Selecciona una o varias categorías que te interesen.
        </Text>

        <View style={styles.chipsWrap}>
          {categorias.map((cat) => {
            const selected = selectedInterests.includes(cat);
            return (
              <Pressable
                key={`interest-${cat}`}
                onPress={() => toggleInterest(cat)}
                style={[
                  styles.optionItem,
                  selected && styles.optionItemSelected,
                ]}
                disabled={isButtonLoading}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Botón */}
      <Pressable
        onPress={handleSubmit}
        disabled={isButtonLoading}
        style={[
          styles.button,
          isButtonLoading ? styles.buttonDisabled : styles.buttonPrimary,
        ]}
      >
        {isButtonLoading ? (
          <ActivityIndicator color="#1E1240" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1240",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardContent: {
    paddingBottom: 48,
  },

  errorBox: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
    marginBottom: 16,
  },
  flex: {
    flex: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  inputSpacing: {
    marginBottom: 16,
  },
  inputTopSpacing: {
    marginTop: 16,
  },

  section: {
    marginTop: 16,
  },
  sectionSpacing: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#65F7F7",
    marginBottom: 4,
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#65F7F7",
    backgroundColor: "#FFFFFF",
  },
  optionItemSelected: {
    backgroundColor: "#65F7F7",
    borderColor: "#65F7F7",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1E1240",
  },
  optionTextSelected: {
    color: "#1E1240",
    fontWeight: "600",
  },

  selectWrapper: {
    position: "relative",
    zIndex: 10,
  },
  select: {
    borderWidth: 1,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  selectDisabled: {
    opacity: 0.5,
  },
  selectPlaceholder: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },
  selectValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  selectDropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#65F7F7",
    backgroundColor: "#FFFFFF",
    maxHeight: 220,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 20,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  selectOptionLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },

  button: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#65F7F7",
  },
  buttonDisabled: {
    backgroundColor: "#65F7F7",
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
  },
});