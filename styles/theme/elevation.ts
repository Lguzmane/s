import { Platform, type ViewStyle } from "react-native";

export type ElevationLevel = 0 | 1 | 2 | 3;

function shadow(iOS: ViewStyle, android: ViewStyle): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: iOS,
    android: android,
    default: android,
  }) as ViewStyle;
}

export const elevationStyles: Record<ElevationLevel, ViewStyle> = {
  0: { ...shadow({}, { elevation: 0 }) },
  1: {
    ...shadow(
      { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      { elevation: 2 }
    ),
  },
  2: {
    ...shadow(
      { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      { elevation: 4 }
    ),
  },
  3: {
    ...shadow(
      { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
      { elevation: 8 }
    ),
  },
};
