declare namespace NodeJS {
  interface ProcessEnv {
    /** Base URL del backend (ej. http://192.168.1.5:3000). Prioridad sobre el fallback local. */
    EXPO_PUBLIC_API_URL?: string;
  }
}
