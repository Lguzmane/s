// Palette: base morado + fondo claro
export const colors = {
  //  Colores principales
  primary: "#413b75",       // MORADO 
  onPrimary: "#FFFFFF",

  textPrimary: "#1A1A1A",
  textSecondary: "#4B5563",   // un gris más oscuro y legible

  //  Fondo general (blanco)
  background: "#FFFFFF",
  onBackground: "#413b75",     // títulos morados

  //  Superficies y secciones
  surface: "#FFFFFF",
  onSurface: "#1A1A1A",

  // gris suave para tarjetas o bloques
  surfaceVariant: "#edebf5",

  //  Bordes y detalles neutros
  border: "#E2E2E5",

  // 👇 ANTES era #F5F3F8 (casi blanco)
  //    Ahora lo usamos como COLOR DE TEXTO SUAVE
  muted: "#6B7280",           // gris medio (se ve bien sobre blanco)

  divider: "#E2E2E5",

  //  Estados (igual que antes)
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  onStatus: "#FFFFFF",
} as const;

export type Colors = typeof colors;
