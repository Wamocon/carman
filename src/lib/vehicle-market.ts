import type { AcquisitionSubtype, AcquisitionType, Vehicle } from "@/types/domain";

interface SelectOption {
  value: string;
  label: string;
}

const KW_TO_PS = 1.35962;

const VEHICLE_TYPE_OPTIONS: SelectOption[] = [
  { value: "car", label: "Pkw" },
  { value: "suv", label: "SUV/Geländewagen" },
  { value: "van", label: "Van/Kleinbus" },
  { value: "estate", label: "Kombi" },
  { value: "small", label: "Kleinwagen" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Cabrio/Roadster" },
  { value: "transporter", label: "Transporter" },
  { value: "pickup", label: "Pick-up" },
  { value: "other", label: "Sonstiges" },
];

const BODY_STYLE_OPTIONS: SelectOption[] = [
  { value: "small", label: "Kleinwagen" },
  { value: "sedan", label: "Limousine" },
  { value: "estate", label: "Kombi" },
  { value: "suv", label: "SUV" },
  { value: "crossover", label: "Crossover" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Cabrio" },
  { value: "van", label: "Van/Kleinbus" },
  { value: "transporter", label: "Transporter" },
  { value: "pickup", label: "Pick-up" },
  { value: "other", label: "Sonstiges" },
];

const TRANSMISSION_OPTIONS: SelectOption[] = [
  { value: "manual", label: "Schaltgetriebe" },
  { value: "automatic", label: "Automatik" },
  { value: "semi_auto", label: "Halbautomatik" },
  { value: "cvt", label: "CVT" },
  { value: "other", label: "Sonstiges" },
];

const DRIVE_TYPE_OPTIONS: SelectOption[] = [
  { value: "front", label: "Frontantrieb" },
  { value: "rear", label: "Heckantrieb" },
  { value: "all", label: "Allrad" },
  { value: "other", label: "Sonstiges" },
];

const DOORS_OPTIONS: SelectOption[] = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6+" },
];

const ACQUISITION_TYPE_OPTIONS: Array<{ value: AcquisitionType; label: string }> = [
  { value: "purchase", label: "Gekauft" },
  { value: "finance", label: "Finanziert" },
  { value: "lease", label: "Geleast" },
];

const ACQUISITION_SUBTYPE_OPTIONS: Record<AcquisitionType, Array<{ value: AcquisitionSubtype; label: string }>> = {
  purchase: [
    { value: "cash", label: "Barzahlung" },
    { value: "dealer", label: "Händlerfinanzierung direkt beim Kauf" },
  ],
  finance: [
    { value: "classic_loan", label: "Klassischer Ratenkredit" },
    { value: "balloon", label: "Ballonfinanzierung" },
    { value: "three_way", label: "Drei-Wege-Finanzierung" },
  ],
  lease: [
    { value: "kilometerleasing", label: "Kilometerleasing" },
    { value: "restwertleasing", label: "Restwertleasing" },
  ],
};

const VEHICLE_TYPE_SET = new Set(VEHICLE_TYPE_OPTIONS.map((option) => option.value));
const BODY_STYLE_SET = new Set(BODY_STYLE_OPTIONS.map((option) => option.value));
const TRANSMISSION_SET = new Set(TRANSMISSION_OPTIONS.map((option) => option.value));
const DRIVE_TYPE_SET = new Set(DRIVE_TYPE_OPTIONS.map((option) => option.value));
const ACQUISITION_TYPE_SET = new Set(ACQUISITION_TYPE_OPTIONS.map((option) => option.value));
const ACQUISITION_SUBTYPE_SET = new Set(
  Object.values(ACQUISITION_SUBTYPE_OPTIONS).flatMap((options) => options.map((option) => option.value)),
);

export const STANDARD_EQUIPMENT: ReadonlyArray<{ category: string; items: readonly string[] }> = [
  {
    category: "Navigation & Multimedia",
    items: ["Navigationssystem", "Apple CarPlay / Android Auto", "Digitales Cockpit", "Head-up-Display"],
  },
  {
    category: "Komfort",
    items: [
      "Klimaanlage",
      "Klimaautomatik",
      "Sitzheizung vorne",
      "Lenkradheizung",
      "Standheizung",
      "Elektrische Heckklappe",
      "Elektrische Sitzverstellung",
    ],
  },
  {
    category: "Fahrassistenz",
    items: [
      "Adaptiver Tempomat (ACC)",
      "Spurhalteassistent",
      "Totwinkelassistent",
      "Notbremsassistent",
      "Einparkhilfe hinten",
      "Einparkhilfe vorne",
      "Rückfahrkamera",
      "360°-Kamera",
    ],
  },
  {
    category: "Licht & Sicht",
    items: ["LED-Scheinwerfer", "Matrix-LED-Scheinwerfer", "Privacy-Verglasung", "Wärmedämm-Verglasung"],
  },
  {
    category: "Exterieur",
    items: ["Panorama-/Schiebedach", "Dachreling", "Anhängerkupplung (AHK)"],
  },
  {
    category: "Sonstiges",
    items: ["Sportpaket", "Ambientebeleuchtung", "Nichtraucher-Fahrzeug", "Winterreifen (separat)", "Ganzjahresreifen"],
  },
];

const ACQUISITION_LABELS: Record<AcquisitionType, string> = {
  purchase: "Kauf",
  finance: "Finanzierung",
  lease: "Leasing",
};

function parsePositiveMoney(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parsePositiveInteger(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function calculateAcquisitionCost(vehicle: Pick<Vehicle, "acquisition_type" | "purchase_price" | "down_payment" | "monthly_payment" | "term_months" | "final_payment">): number {
  if (vehicle.acquisition_type === "purchase") {
    return vehicle.purchase_price ?? 0;
  }

  const downPayment = vehicle.down_payment ?? 0;
  const monthlyPayment = vehicle.monthly_payment ?? 0;
  const termMonths = vehicle.term_months ?? 0;
  const finalPayment = vehicle.final_payment ?? 0;

  return downPayment + monthlyPayment * termMonths + finalPayment;
}

function convertKwToPs(kw: number): number {
  return Math.round(kw * KW_TO_PS);
}

function convertPsToKw(ps: number): number {
  return Math.round(ps / KW_TO_PS);
}

export {
  ACQUISITION_LABELS,
  ACQUISITION_SUBTYPE_OPTIONS,
  ACQUISITION_SUBTYPE_SET,
  ACQUISITION_TYPE_OPTIONS,
  ACQUISITION_TYPE_SET,
  BODY_STYLE_OPTIONS,
  BODY_STYLE_SET,
  DOORS_OPTIONS,
  DRIVE_TYPE_OPTIONS,
  DRIVE_TYPE_SET,
  TRANSMISSION_OPTIONS,
  TRANSMISSION_SET,
  VEHICLE_TYPE_OPTIONS,
  VEHICLE_TYPE_SET,
  calculateAcquisitionCost,
  convertKwToPs,
  convertPsToKw,
  parsePositiveInteger,
  parsePositiveMoney,
};
