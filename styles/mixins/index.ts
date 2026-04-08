import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const mixins = {
  row: (align: ViewStyle["alignItems"] = "center", justify: ViewStyle["justifyContent"] = "flex-start"): ViewStyle =>
    ({ flexDirection: "row", alignItems: align, justifyContent: justify }),
  column: (align: ViewStyle["alignItems"] = "stretch", justify: ViewStyle["justifyContent"] = "flex-start"): ViewStyle =>
    ({ flexDirection: "column", alignItems: align, justifyContent: justify }),
  center: (): ViewStyle => ({ alignItems: "center", justifyContent: "center" }),
  between: (): ViewStyle => ({ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }),
  absoluteFill: StyleSheet.absoluteFillObject as ViewStyle,
  rounded: (key: keyof typeof theme.radii): ViewStyle => ({ borderRadius: theme.radii[key] }),
  pad: (key: keyof typeof theme.spacing): ViewStyle => ({ padding: theme.spacing[key] }),
  padH: (key: keyof typeof theme.spacing): ViewStyle => ({ paddingHorizontal: theme.spacing[key] }),
  padV: (key: keyof typeof theme.spacing): ViewStyle => ({ paddingVertical: theme.spacing[key] }),
};
