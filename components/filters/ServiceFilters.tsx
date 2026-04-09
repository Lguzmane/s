// components/filters/ServiceFilters.tsx
import Fuse from "fuse.js";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  View,
  findNodeHandle,
} from "react-native";
import clData from "../../assets/data/regions/cl.json";
import serviciosData from "../../assets/data/services.json";

export type Filters = {
  servicio: string;
  comuna: string;
  lugar: string;
  fecha: string;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  showOnly?: Array<keyof Filters>; // ["servicio", "comuna", "lugar", "fecha"]
  /** Si es true, enfoca el primer campo visible (servicio o comuna) al montar */
  autoFocus?: boolean;
};

// Tipos JSON
type Categoria = { nombre: string; servicios: string[] };
type ServiciosJSON = { categorias: Categoria[] };
type CLRegion = { nombre: string; comunas: string[] };
type CLJSON = { regiones: CLRegion[] };

// Únicos + ordenados
const uniqSorted = (arr: string[]) =>
  Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

type AnchorRect = { x: number; y: number; width: number; height: number };

// ⬇️ handle expuesto al padre
export type ServiceFiltersHandle = {
  focusFirst: () => void;
};

// Helper de sombra/elevación cross-platform (exportado para reuso)
export const elevate = (level: number) =>
  Platform.select({
    android: { elevation: level },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: Math.max(1, Math.min(level, 8)) },
      shadowRadius: Math.max(2, Math.round(level * 1.25)),
    },
    default: {},
  }) as object;

const ServiceFilters = forwardRef<ServiceFiltersHandle, Props>(function ServiceFilters(
  { filters, setFilters, showOnly = [], autoFocus = false },
  ref
) {
  // Datos tipados desde JSON
  const { categorias } = serviciosData as unknown as ServiciosJSON;
  const allServicios = useMemo(
    () => uniqSorted(categorias.flatMap((cat) => cat.servicios || [])),
    [categorias]
  );

  const { regiones } = clData as unknown as CLJSON;
  const allComunas = useMemo(
    () => uniqSorted(regiones.flatMap((r) => r.comunas || [])),
    [regiones]
  );

  const shouldShow = (field: keyof Filters) =>
    showOnly.length === 0 || showOnly.includes(field);

  // ------- Autocomplete para servicio y comuna
  const useAutocomplete = (
    value: string,
    options: string[],
    name: keyof Filters
  ) => {
    const [input, setInput] = useState(value || "");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setInput(value || "");
    }, [value]);

    const fuse = useMemo(
      () =>
        new Fuse(options, {
          threshold: 0.3,
          ignoreLocation: true,
          distance: 100,
        }),
      [options]
    );

    const runSearch = (text: string) => {
      if (!text.trim()) {
        setSuggestions([]);
        return;
      }
      const results = fuse.search(text);
      setSuggestions(results.map((r) => r.item));
    };

    const handleChange = (text: string) => {
      setInput(text);
      setFilters((prev) => ({ ...prev, [name]: text }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runSearch(text);
        setOpen(true);
      }, 100);
    };

    const handleSelect = (option: string) => {
      setInput(option);
      setFilters((prev) => ({ ...prev, [name]: option }));
      setOpen(false);
    };

    const SuggestionsList = () =>
      open && suggestions.length > 0 ? (
        <View style={[styles.suggestions, elevate(6)]}>
          {suggestions.slice(0, 8).map((item, index) => (
            <Pressable
              key={`${name}-${item}-${index}`}
              onPress={() => handleSelect(item)}
              style={styles.suggestionItem}
              accessibilityRole="button"
              accessibilityLabel={`Sugerencia: ${item}`}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null;

    return { input, handleChange, SuggestionsList, setOpen };
  };

  const servicio = useAutocomplete(filters.servicio, allServicios, "servicio");
  const comuna = useAutocomplete(filters.comuna, allComunas, "comuna");

  // ------- Refs para autofocus controlado
  const servicioInputRef = useRef<TextInput>(null);
  const comunaInputRef = useRef<TextInput>(null);

  // 🔸 Método para que el padre pueda forzar el foco
  const focusFirst = () => {
    const focusServicio = shouldShow("servicio");
    const focusComuna = !focusServicio && shouldShow("comuna");
    if (focusServicio) {
      servicioInputRef.current?.focus();
      servicio.setOpen(true);
    } else if (focusComuna) {
      comunaInputRef.current?.focus();
      comuna.setOpen(true);
    }
  };

  // Exponer focusFirst() al padre
  useImperativeHandle(ref, () => ({ focusFirst }), [filters]);

  // Foco automático opcional al montar (útil si no llamas al método desde afuera)
  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => focusFirst(), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // ------- Dropdowns con Modal (para flotar sobre todo)
  const [openSelect, setOpenSelect] = useState<null | "lugar" | "fecha">(null);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);

  // Refs a los triggers (Pressable -> View)
  const triggerLugarRef = useRef<View>(null);
  const triggerFechaRef = useRef<View>(null);

  // 🔧 FIX DE TIPOS: aceptar RefObject<View | null>
  const measureAnchor = (refEl: React.RefObject<View | null>) => {
    const node = findNodeHandle(refEl.current);
    if (!node) return;
    UIManager.measureInWindow(node, (x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  };

  const openLugar = () => {
    measureAnchor(triggerLugarRef);
    setOpenSelect("lugar");
  };
  const openFecha = () => {
    measureAnchor(triggerFechaRef);
    setOpenSelect("fecha");
  };
  const closeDropdown = () => {
    setOpenSelect(null);
    setAnchorRect(null);
  };

  const handleSelectChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const lugarOptions = ["", "online", "domicilio", "local"];
  const fechaOptions = ["", "hoy", "3dias", "cualquier"];

  const formatFechaLabel = (value: string) => {
    if (!value) return "Cualquiera";
    if (value === "3dias") return "Próx. 3 días";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <View style={styles.container}>
      {/* Servicio */}
      {shouldShow("servicio") && (
        <View style={styles.field}>
          <TextInput
            ref={servicioInputRef}
            placeholder="¿Qué servicio buscas?"
            placeholderTextColor="#6B7280"
            value={servicio.input}
            onChangeText={servicio.handleChange}
            onBlur={() => servicio.setOpen(false)}
            onFocus={() => servicio.setOpen(true)}
            style={styles.input}
            selectionColor="#1E1240"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={!!autoFocus}
            accessibilityLabel="Campo servicio"
          />
          {servicio.SuggestionsList()}
        </View>
      )}

      {/* Comuna */}
      {shouldShow("comuna") && (
        <View style={styles.field}>
          <TextInput
            ref={comunaInputRef}
            placeholder="Comuna"
            placeholderTextColor="#6B7280"
            value={comuna.input}
            onChangeText={comuna.handleChange}
            onBlur={() => comuna.setOpen(false)}
            onFocus={() => comuna.setOpen(true)}
            style={styles.input}
            selectionColor="#1E1240"
            autoCapitalize="words"
            autoFocus={!!autoFocus && !shouldShow("servicio")}
            accessibilityLabel="Campo comuna"
          />
          {comuna.SuggestionsList()}
        </View>
      )}

      {/* Selects en fila: Lugar y Fecha (rectángulos iguales) */}
      <View style={styles.row}>
        {/* Lugar */}
        {shouldShow("lugar") && (
          <View style={styles.selectField}>
            <Pressable
              ref={triggerLugarRef}
              onPress={openLugar}
              style={styles.selectInput}
              accessibilityRole="button"
              accessibilityLabel="Lugar de atención"
              accessibilityState={{ expanded: openSelect === "lugar" }}
            >
              <Text style={styles.selectText}>
                {filters.lugar
                  ? filters.lugar.charAt(0).toUpperCase() + filters.lugar.slice(1)
                  : "Lugar de atención"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Fecha */}
        {shouldShow("fecha") && (
          <View style={styles.selectField}>
            <Pressable
              ref={triggerFechaRef}
              onPress={openFecha}
              style={styles.selectInput}
              accessibilityRole="button"
              accessibilityLabel="Fechas disponibles"
              accessibilityState={{ expanded: openSelect === "fecha" }}
            >
              <Text style={styles.selectText}>
                {filters.fecha ? formatFechaLabel(filters.fecha) : "Fechas disponibles"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* MODAL DROPDOWN — flota sobre todo */}
      <Modal visible={!!openSelect} transparent animationType="fade" onRequestClose={closeDropdown}>
        {/* Capa que cierra al tocar fuera */}
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        {/* Contenedor absoluto posicionado bajo el trigger */}
        {anchorRect && (
          <View
            pointerEvents="box-none"
            style={[
              styles.modalAbsoluteContainer,
              {
                top: anchorRect.y + anchorRect.height,
                left: anchorRect.x,
                width: anchorRect.width,
              },
            ]}
          >
            <View style={[styles.dropdownPanel, elevate(8)]}>
              {(openSelect === "lugar" ? lugarOptions : fechaOptions).map((opt, i) => {
                const selected =
                  openSelect === "lugar" ? filters.lugar === opt : filters.fecha === opt;
                const label =
                  openSelect === "lugar"
                    ? opt === ""
                      ? "Cualquiera"
                      : opt.charAt(0).toUpperCase() + opt.slice(1)
                    : opt === ""
                    ? "Cualquiera"
                    : opt === "3dias"
                    ? "Próx. 3 días"
                    : opt.charAt(0).toUpperCase() + opt.slice(1);

                return (
                  <Pressable
                    key={`${openSelect}-${i}`}
                    onPress={() => {
                      handleSelectChange(openSelect!, opt);
                      closeDropdown();
                    }}
                    style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${openSelect}: ${label}`}
                  >
                    <Text style={[styles.dropdownText, selected && styles.dropdownTextSelected]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
});

export default ServiceFilters;

const styles = StyleSheet.create({
  // CONTENEDOR
  container: {
    gap: 8,
    position: "relative",
    zIndex: 50,
  },

  // INPUTS (Servicio / Comuna)
  field: {
    position: "relative",
    zIndex: 100,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#111827",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    textAlignVertical: "center",
  },

  // SUGERENCIAS (autocomplete) — overlay dentro del propio campo
  suggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F9FAFB",
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 180,
    overflow: "hidden",
    zIndex: 10000,
    ...elevate(16),
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F9FAFB",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },

  // FILA DE SELECTS
  row: {
    flexDirection: "row",
    gap: 8,
    zIndex: 1,
  },

  // SELECTS (Lugar / Fecha)
  selectField: {
    flex: 1,
  },
  selectInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#65F7F7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
  },
  selectText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },

  // MODAL — capa oscura clickeable para cerrar
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  // MODAL — contenedor absoluto donde se inserta el panel (anclado bajo el trigger)
  modalAbsoluteContainer: {
    position: "absolute",
    zIndex: 9999,
    ...elevate(8),
  },

  // Panel de opciones dentro del modal
  dropdownPanel: {
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F9FAFB",
    borderRadius: 12,
    maxHeight: 260,
    overflow: "hidden",
    zIndex: 9999,
    ...elevate(8),
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F9FAFB",
  },
  dropdownItemSelected: {
    backgroundColor: "#F9FAFB",
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111827",
  },
  dropdownTextSelected: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1240",
  },

  // (Opcional) chips si los reutilizas en otras vistas
  optionItem: {
    alignSelf: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#65F7F7",
  },
  optionItemSelected: {
    backgroundColor: "#1E1240",
    borderColor: "#1E1240",
  },
  optionText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#111827",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
});