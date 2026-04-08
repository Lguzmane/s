import type { TextStyle } from "react-native";

type Role = "display" | "h1" | "h2" | "subtitle" | "body" | "caption" | "overline";

export const typography = {
  family: undefined as TextStyle["fontFamily"], // sistema por defecto
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  roles: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" } as TextStyle,
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "700" } as TextStyle,
    h2: { fontSize: 24, lineHeight: 32, fontWeight: "600" } as TextStyle,
    subtitle: { fontSize: 18, lineHeight: 24, fontWeight: "600" } as TextStyle,
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" } as TextStyle,
    caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" } as TextStyle,
    overline: { fontSize: 11, lineHeight: 14, fontWeight: "600" } as TextStyle,
  } as Record<Role, TextStyle>,
} as const;

export type Typography = typeof typography;
export type TextRole = Role;
