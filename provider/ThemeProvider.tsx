import React, { createContext, useContext, useMemo } from "react";
import { theme as lightTheme, type Theme } from "../styles/theme";

// Por ahora forzamos light
const ThemeContext = createContext<Theme>(lightTheme);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // const scheme = useColorScheme(); // <- lo usarás cuando agreguemos dark
  const value = useMemo(() => lightTheme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  return useContext(ThemeContext);
}
