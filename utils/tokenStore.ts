// utils/tokenStore.ts
let accessToken: string | null = null;

export const tokenStore = {
  setToken: (token: string) => {
    accessToken = token;
    console.log('[TokenStore] ✅ Token seteado en memoria');
  },

  getToken: () => {
    return accessToken;
  },

  clear: () => {
    accessToken = null;
    console.log('[TokenStore] 🧹 Token limpiado');
  }
};