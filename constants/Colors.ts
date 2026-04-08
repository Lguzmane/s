//  Paleta base
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const accentColor = '#ff4081';
const errorColor = '#e63946';
const successColor = '#4caf50';
const warningColor = '#ffb300';

export type Theme = 'light' | 'dark';

//  Esquema de colores completo
const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#cccccc',
    tabIconSelected: tintColorLight,
    icon: '#222222',
    border: '#e0e0e0',
    shadow: '#d1d1d1',
    accent: accentColor,
    error: errorColor,
    success: successColor,
    warning: warningColor,
    card: '#f9f9f9',
    placeholder: '#999999',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: '#888888',
    tabIconSelected: tintColorDark,
    icon: '#ffffff',
    border: '#333333',
    shadow: '#000000',
    accent: accentColor,
    error: errorColor,
    success: successColor,
    warning: warningColor,
    card: '#121212',
    placeholder: '#bbbbbb',
  },
};

//  Exportación por defecto
export default Colors;