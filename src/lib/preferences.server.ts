import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  THEME_COOKIE,
  resolveLocale,
  resolveTheme,
  type Locale,
  type Theme,
} from "@/lib/preferences";

export async function getThemeFromCookies(): Promise<Theme> {
  const cookieStore = await cookies();
  return resolveTheme(cookieStore.get(THEME_COOKIE)?.value);
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function getPreferencesFromCookies(): Promise<{ theme: Theme; locale: Locale }> {
  const cookieStore = await cookies();

  return {
    theme: resolveTheme(cookieStore.get(THEME_COOKIE)?.value),
    locale: resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value),
  };
}

