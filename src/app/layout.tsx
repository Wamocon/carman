import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { getPreferencesFromCookies } from "@/lib/preferences.server";
import { isDarkTheme } from "@/lib/preferences";
import "./globals.css";

const geistSans = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarMan",
  description:
    "CarMan haelt Fahrzeugkosten, Wartungen und Servicetermine an einem Ort klar und planbar.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, locale } = await getPreferencesFromCookies();
  const darkTheme = isDarkTheme(theme);

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${darkTheme ? "dark" : ""}`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

