export const THEME_COOKIE = "carman_theme";
export const LOCALE_COOKIE = "carman_locale";

export const THEMES = [
  "standardDark",
  "standardLight",
] as const;

export type Theme = (typeof THEMES)[number];
export type Locale = "de" | "en";
export type ThemeMode = "light" | "dark";

export const DEFAULT_DARK_THEME: Theme = "standardDark";
export const DEFAULT_LIGHT_THEME: Theme = "standardLight";
export const DARK_THEMES = ["standardDark"] as const;
export const LIGHT_THEMES = ["standardLight"] as const;

export interface ThemeOption {
  id: Theme;
  mode: ThemeMode;
  previewBackground: string;
  previewAccent: string;
  previewBorder: string;
  category?: "default" | "signature" | "easterEgg";
}

export const themeOptions: Record<Theme, ThemeOption> = {
  standardDark: {
    id: "standardDark",
    mode: "dark",
    previewBackground: "linear-gradient(145deg, #0b1118 0%, #18222d 50%, #304152 100%)",
    previewAccent: "#d6e2f0",
    previewBorder: "rgba(214, 226, 240, 0.4)",
    category: "default",
  },
  standardLight: {
    id: "standardLight",
    mode: "light",
    previewBackground: "linear-gradient(145deg, #ffffff 0%, #eef4fa 56%, #dde8f2 100%)",
    previewAccent: "#335f86",
    previewBorder: "rgba(51, 95, 134, 0.22)",
    category: "default",
  },
};

export function resolveTheme(value?: string): Theme {
  if (value === "dark") return DEFAULT_DARK_THEME;
  if (value === "light") return DEFAULT_LIGHT_THEME;

  return THEMES.includes(value as Theme) ? (value as Theme) : DEFAULT_DARK_THEME;
}

export function resolveLocale(value?: string): Locale {
  return value === "en" ? "en" : "de";
}

export function isDarkTheme(theme: Theme): boolean {
  return themeOptions[theme].mode === "dark";
}

export function getThemeMode(theme: Theme): ThemeMode {
  return themeOptions[theme].mode;
}

export function getDefaultThemeForMode(mode: ThemeMode): Theme {
  return mode === "dark" ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
}

