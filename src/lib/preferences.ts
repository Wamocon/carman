export const THEME_COOKIE = "carman_theme";
export const LOCALE_COOKIE = "carman_locale";

export const THEMES = [
  "standardDark",
  "standardLight",
  "petrol",
  "electric",
  "graphite",
  "copper",
  "alpine",
  "sage",
  "sunrise",
  "pearl",
  "mostWanted",
] as const;

export type Theme = (typeof THEMES)[number];
export type Locale = "de" | "en";
export type ThemeMode = "light" | "dark";

export const DEFAULT_DARK_THEME: Theme = "standardDark";
export const DEFAULT_LIGHT_THEME: Theme = "standardLight";
export const DARK_THEMES = ["standardDark", "petrol", "electric", "graphite", "copper", "mostWanted"] as const;
export const LIGHT_THEMES = ["standardLight", "alpine", "sage", "sunrise", "pearl"] as const;

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
  petrol: {
    id: "petrol",
    mode: "dark",
    previewBackground: "linear-gradient(145deg, #0a2832 0%, #0f4356 52%, #1c6e74 100%)",
    previewAccent: "#9fe6dc",
    previewBorder: "rgba(159, 230, 220, 0.55)",
  },
  electric: {
    id: "electric",
    mode: "dark",
    previewBackground: "linear-gradient(145deg, #071825 0%, #0d3a67 45%, #00c8ff 100%)",
    previewAccent: "#b8f6ff",
    previewBorder: "rgba(123, 237, 255, 0.65)",
  },
  graphite: {
    id: "graphite",
    mode: "dark",
    previewBackground: "linear-gradient(145deg, #14181e 0%, #242d36 50%, #4a5560 100%)",
    previewAccent: "#d8dee7",
    previewBorder: "rgba(216, 222, 231, 0.4)",
  },
  copper: {
    id: "copper",
    mode: "dark",
    previewBackground: "linear-gradient(145deg, #221717 0%, #55332c 52%, #d28a53 100%)",
    previewAccent: "#ffd7b0",
    previewBorder: "rgba(255, 190, 124, 0.55)",
  },
  mostWanted: {
    id: "mostWanted",
    mode: "dark",
    previewBackground: "linear-gradient(145deg, #0a0a0d 0%, #242127 48%, #b88a1b 100%)",
    previewAccent: "#ffd761",
    previewBorder: "rgba(255, 215, 97, 0.62)",
    category: "easterEgg",
  },
  alpine: {
    id: "alpine",
    mode: "light",
    previewBackground: "linear-gradient(145deg, #ebf4fb 0%, #d8e6f1 48%, #b5d9f6 100%)",
    previewAccent: "#245f9c",
    previewBorder: "rgba(36, 95, 156, 0.22)",
  },
  sage: {
    id: "sage",
    mode: "light",
    previewBackground: "linear-gradient(145deg, #f5fbf5 0%, #dbeadf 48%, #bdd3be 100%)",
    previewAccent: "#476f55",
    previewBorder: "rgba(71, 111, 85, 0.24)",
  },
  sunrise: {
    id: "sunrise",
    mode: "light",
    previewBackground: "linear-gradient(145deg, #fff8ee 0%, #ffe4c9 52%, #ffc6a4 100%)",
    previewAccent: "#b85a37",
    previewBorder: "rgba(184, 90, 55, 0.22)",
  },
  pearl: {
    id: "pearl",
    mode: "light",
    previewBackground: "linear-gradient(145deg, #fffefe 0%, #f2ecf5 48%, #d8d3df 100%)",
    previewAccent: "#655b82",
    previewBorder: "rgba(101, 91, 130, 0.2)",
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

