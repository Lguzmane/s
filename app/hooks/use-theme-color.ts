import { useColorScheme } from "../../components/useColorScheme";
import Colors from "../../constants/Colors";

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(
  props: ThemeProps,
  colorName: keyof (typeof Colors)["light"]
) {
  const theme: "light" | "dark" = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}
