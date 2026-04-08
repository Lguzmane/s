// app/(tabs)/index.tsx
import { Redirect } from "expo-router";

export default function TabsIndex() {
  // desactiva el index redirigiendo silenciosamente al Home real
  return <Redirect href="/(tabs)/home" />;
}