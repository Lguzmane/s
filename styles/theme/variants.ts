import type { TextStyle, ViewStyle } from "react-native";
import type { Colors } from "./colors.light";
import type { Layout } from "./layout";
import type { Radii } from "./radii";
import type { Spacing } from "./spacing";
import type { Typography } from "./typography";

export type TextVariants = {
  title: TextStyle;
  section: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  muted: TextStyle;
  caption: TextStyle;
};

export type ButtonVariant = { container: ViewStyle; label: TextStyle };
export type ButtonVariants = { primary: ButtonVariant; secondary: ButtonVariant; ghost: ButtonVariant };

export type BadgeVariant = { container: ViewStyle; label: TextStyle };
export type BadgeVariants = { default: BadgeVariant };

export function makeVariants(
  colors: Colors,
  spacing: Spacing,
  radii: Radii,
  typography: Typography,
  _layout: Layout
) {
  const TextVariants: TextVariants = {
    title: { ...typography.roles.h1, color: colors.onBackground },
    section: { ...typography.roles.h2, color: colors.onBackground },
    subtitle: { ...typography.roles.subtitle, color: colors.onBackground },
    body: { ...typography.roles.body, color: colors.onBackground },
    muted: { ...typography.roles.body, color: colors.muted },
    caption: { ...typography.roles.caption, color: colors.onBackground },
  };

  const ButtonVariants: ButtonVariants = {
    primary: {
      container: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
      },
      label: { ...typography.roles.subtitle, color: colors.onPrimary, textAlign: "center" },
    },
    secondary: {
      container: {
        backgroundColor: colors.surface,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
      },
      label: { ...typography.roles.subtitle, color: colors.onSurface, textAlign: "center" },
    },
    ghost: {
      container: {
        backgroundColor: "transparent",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
      },
      label: { ...typography.roles.subtitle, color: colors.onBackground, textAlign: "center" },
    },
  };

  const BadgeVariants: BadgeVariants = {
    default: {
      container: {
        backgroundColor: colors.surfaceVariant,
        borderRadius: radii.pill,
        paddingHorizontal: _layout.chip.paddingH,
        paddingVertical: _layout.chip.paddingV,
      },
      label: { ...typography.roles.caption, color: colors.onSurface },
    },
  };

  return { TextVariants, ButtonVariants, BadgeVariants };
}
