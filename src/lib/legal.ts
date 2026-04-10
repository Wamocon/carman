export const LEGAL_LINKS = [
  { href: "/impressum", labelKey: "imprint" },
  { href: "/datenschutz", labelKey: "privacyPolicy" },
  { href: "/agb", labelKey: "termsAndConditions" },
] as const;

export const LEGAL_UPDATED_AT = "April 2026";

export const LEGAL_COMPANY = {
  name: "WAMOCON GmbH",
  street: "Mergenthalerallee 79 - 81",
  postalCode: "65760",
  city: "Eschborn",
  country: "Deutschland",
  phone: "+49 6196 5838311",
  email: "info@wamocon.com",
  managingDirector: "Dipl.-Ing. Waleri Moretz",
  commercialRegister: "Amtsgericht Frankfurt am Main, HRB 123666",
  vatId: "DE344930486",
} as const;

export const LEGAL_PRODUCT = {
  name: "CarMan",
  description:
    "die Verwaltung von Fahrzeugen, laufenden Kosten, Serviceterminen und CSV-Exporten in einer webbasierten Anwendung",
} as const;