import { colors, type Colors } from "./colors.light";
import { elevationStyles, type ElevationLevel } from "./elevation";
import { layout, type Layout } from "./layout";
import { radii, type Radii } from "./radii";
import { spacing, type Spacing } from "./spacing";
import { typography, type Typography } from "./typography";
import { makeVariants } from "./variants";

export type Theme = {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  radii: Radii;
  elevation: typeof elevationStyles;
  layout: Layout;
  variants: ReturnType<typeof makeVariants>;
  scheme: "light"; // listo para ampliar a "dark" en el futuro
};

export const theme: Theme = {
  colors,
  spacing,
  typography,
  radii,
  elevation: elevationStyles,
  layout,
  variants: makeVariants(colors, spacing, radii, typography, layout),
  scheme: "light",
};

export type { ElevationLevel };

