import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const wp = (percent: number) => (width * percent) / 100;
export const hp = (percent: number) => (height * percent) / 100;

// Breakpoints lógicos (teléfono/tablet simple)
export const isTablet = () => Math.min(width, height) >= 600;
