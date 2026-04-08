export const THEME_COOKIE = "carman_theme";
export const LOCALE_COOKIE = "carman_locale";

export type Theme = "light" | "dark";
export type Locale = "de" | "en";

export function resolveTheme(value?: string): Theme {
  return value === "dark" ? "dark" : "light";
}

export function resolveLocale(value?: string): Locale {
  return value === "en" ? "en" : "de";
}
