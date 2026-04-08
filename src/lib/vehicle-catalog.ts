import type { FuelType } from "@/types/domain";
import type { Locale } from "@/lib/preferences";

export interface VehicleCatalogMake {
  id: number;
  name: string;
}

export interface VehicleCatalogModel {
  id: number;
  name: string;
}

export interface VehicleCatalogDecodeResult {
  make?: string;
  model?: string;
  year?: number;
  fuelType?: FuelType;
  vehicleType?: string;
  bodyStyle?: string;
  variant?: string;
  engineDescription?: string;
  transmission?: string;
  driveType?: string;
  doors?: number;
  enginePowerKw?: number;
  engineDisplacementCc?: number;
  catalogSource?: string;
}

const DE_TERM_MAP: Record<string, string> = {
  "PASSENGER CAR": "Pkw",
  "MULTIPURPOSE PASSENGER VEHICLE (MPV)": "Mehrzweckfahrzeug (MPV)",
  TRUCK: "Lkw",
  BUS: "Bus",
  MOTORCYCLE: "Motorrad",
  VAN: "Van",
  "SPORT UTILITY VEHICLE (SUV)/MULTIPURPOSE VEHICLE (MPV)": "SUV/Mehrzweckfahrzeug",
  "SPORT UTILITY VEHICLE": "SUV",
  "FRONT-WHEEL DRIVE": "Frontantrieb",
  "REAR-WHEEL DRIVE": "Heckantrieb",
  "ALL-WHEEL DRIVE": "Allradantrieb",
  "FOUR-WHEEL DRIVE": "Allradantrieb",
  AUTOMATIC: "Automatik",
  MANUAL: "Schaltgetriebe",
  "MANUAL/STANDARD": "Schaltgetriebe",
  "CONTINUOUSLY VARIABLE TRANSMISSION (CVT)": "CVT",
  SEDAN: "Limousine",
  HATCHBACK: "Schraegheck",
  COUPE: "Coupe",
  CONVERTIBLE: "Cabrio",
  WAGON: "Kombi",
  CUV: "Crossover",
  PETROL: "Benzin",
  GASOLINE: "Benzin",
  DIESEL: "Diesel",
  ELECTRIC: "Elektro",
  HYBRID: "Hybrid",
};

function toGermanTerm(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const direct = DE_TERM_MAP[trimmed.toUpperCase()];
  if (direct) return direct;

  return trimmed
    .replace(/front-wheel drive/gi, "Frontantrieb")
    .replace(/rear-wheel drive/gi, "Heckantrieb")
    .replace(/all-wheel drive|four-wheel drive/gi, "Allradantrieb")
    .replace(/automatic/gi, "Automatik")
    .replace(/manual\/standard|manual/gi, "Schaltgetriebe")
    .replace(/continuously variable transmission \(cvt\)/gi, "CVT")
    .replace(/cyl/gi, "Zyl.")
    .replace(/gasoline/gi, "Benzin")
    .replace(/petrol/gi, "Benzin")
    .replace(/electric/gi, "Elektro");
}

export function localizeCatalogText(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  if (locale === "en") return value;
  return toGermanTerm(value) ?? value;
}

interface VPICListItem {
  Make_ID?: number;
  MakeId?: number;
  Make_Name?: string;
  MakeName?: string;
  Model_ID?: number;
  ModelId?: number;
  Model_Name?: string;
  ModelName?: string;
  VehicleTypeName?: string;
}

interface VPICDecodeRow {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  FuelTypePrimary?: string;
  FuelTypeSecondary?: string;
  VehicleType?: string;
  BodyClass?: string;
  Series?: string;
  Trim?: string;
  EngineModel?: string;
  EngineCylinders?: string;
  DisplacementL?: string;
  EngineKW?: string;
  TransmissionStyle?: string;
  DriveType?: string;
  Doors?: string;
  ElectrificationLevel?: string;
}

export function normalizeMakeResults(items: VPICListItem[]): VehicleCatalogMake[] {
  const unique = new Map<string, VehicleCatalogMake>();

  for (const item of items) {
    const name = (item.Make_Name ?? item.MakeName ?? "").trim();
    const id = item.Make_ID ?? item.MakeId ?? 0;
    if (!name) continue;
    unique.set(name.toLowerCase(), { id, name });
  }

  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function normalizeModelResults(items: VPICListItem[]): VehicleCatalogModel[] {
  const unique = new Map<string, VehicleCatalogModel>();

  for (const item of items) {
    const name = (item.Model_Name ?? item.ModelName ?? "").trim();
    const id = item.Model_ID ?? item.ModelId ?? 0;
    if (!name) continue;
    unique.set(name.toLowerCase(), { id, name });
  }

  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function normalizeVehicleTypes(items: VPICListItem[]): string[] {
  return Array.from(
    new Set(
      items
        .map((item) => (item.VehicleTypeName ?? "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function deriveFuelType(row: VPICDecodeRow): FuelType | undefined {
  const primary = (row.FuelTypePrimary ?? "").toLowerCase();
  const secondary = (row.FuelTypeSecondary ?? "").toLowerCase();
  const electrification = (row.ElectrificationLevel ?? "").toLowerCase();

  if (primary.includes("diesel")) return "diesel";
  if (primary.includes("electric")) return "electric";
  if (primary.includes("natural gas") || primary.includes("cng")) return "cng";
  if (primary.includes("liquefied petroleum") || primary.includes("lpg") || primary.includes("propane")) return "lpg";
  if (electrification.includes("hybrid") || secondary.includes("electric")) return "hybrid";
  if (primary.includes("gasoline") || primary.includes("petrol")) return "petrol";

  return undefined;
}

function buildEngineDescription(row: VPICDecodeRow): string | undefined {
  const parts: string[] = [];

  if (row.EngineModel) parts.push(row.EngineModel);
  if (row.DisplacementL) parts.push(`${row.DisplacementL}L`);
  if (row.EngineCylinders) parts.push(`${row.EngineCylinders} cyl`);
  if (row.FuelTypePrimary) parts.push(row.FuelTypePrimary);

  if (parts.length === 0) return undefined;
  return parts.join(" · ");
}

export function localizeVehicleTypes(types: string[], locale: Locale): string[] {
  if (locale === "en") return types;

  return types.map((value) => toGermanTerm(value) ?? value);
}

export function normalizeDecodeResult(row?: VPICDecodeRow): VehicleCatalogDecodeResult | null {
  if (!row) return null;

  const displacementL = parseNumber(row.DisplacementL);
  const displacementCc = displacementL !== undefined ? Math.round(displacementL * 1000) : undefined;
  const powerKw = parseNumber(row.EngineKW);
  const doors = parseNumber(row.Doors);
  const series = (row.Series ?? "").trim();
  const trim = (row.Trim ?? "").trim();
  const variant = [series, trim].filter(Boolean).join(" / ") || undefined;

  return {
    make: row.Make?.trim() || undefined,
    model: row.Model?.trim() || undefined,
    year: parseNumber(row.ModelYear),
    fuelType: deriveFuelType(row),
    vehicleType: row.VehicleType?.trim() || undefined,
    bodyStyle: row.BodyClass?.trim() || undefined,
    variant,
    engineDescription: buildEngineDescription(row),
    transmission: row.TransmissionStyle?.trim() || undefined,
    driveType: row.DriveType?.trim() || undefined,
    doors,
    enginePowerKw: powerKw,
    engineDisplacementCc: displacementCc,
    catalogSource: "NHTSA vPIC",
  };
}

export function localizeDecodeResult(
  result: VehicleCatalogDecodeResult | null,
  locale: Locale,
): VehicleCatalogDecodeResult | null {
  if (!result || locale === "en") return result;

  return {
    ...result,
    vehicleType: toGermanTerm(result.vehicleType) ?? result.vehicleType,
    bodyStyle: toGermanTerm(result.bodyStyle) ?? result.bodyStyle,
    transmission: toGermanTerm(result.transmission) ?? result.transmission,
    driveType: toGermanTerm(result.driveType) ?? result.driveType,
    engineDescription: toGermanTerm(result.engineDescription) ?? result.engineDescription,
  };
}


