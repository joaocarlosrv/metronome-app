export const COLORS = {
  bg: '#3d5068',
  bg2: '#344559',
  bg3: '#2e3d50',
  panel: '#3a4f65',
  accent: '#5bc8dc',
  accentDim: 'rgba(91, 200, 220, 0.25)',
  text: '#c8daea',
  text2: '#8aa3bb',
  text3: '#6a8299',
  poly1: '#5bc8dc',
  poly2: '#c8a96a',
  white: '#ffffff',
  tick: 'rgba(255, 255, 255, 0.10)',
};

export const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.bg,
    tint: COLORS.accent,
    icon: COLORS.text2,
    tabIconDefault: COLORS.text3,
    tabIconSelected: COLORS.accent,
  },
  dark: {
    text: COLORS.text,
    background: COLORS.bg3,
    tint: COLORS.accent,
    icon: COLORS.text2,
    tabIconDefault: COLORS.text3,
    tabIconSelected: COLORS.accent,
  },
} as const;

export const FONTS = {
  thin: 'Nunito_200ExtraLight',
  light: 'Nunito_300Light',
  regular: 'Nunito_400Regular',
  semi: 'Nunito_600SemiBold',
};

export const SOUNDS = [
  { id: 'click', label: 'Click' },
  { id: 'ping', label: 'Ping' },
  { id: 'stick', label: 'Stick' },
  { id: 'woodblock', label: 'Wooden Block' },
  { id: 'drum', label: 'Drum' },
];

export const BPM_MIN = 30;
export const BPM_MAX = 300;
