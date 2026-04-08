import { NextResponse } from "next/server";
import {
  localizeDecodeResult,
  localizeVehicleTypes,
  normalizeDecodeResult,
  normalizeMakeResults,
  normalizeModelResults,
  normalizeVehicleTypes,
} from "@/lib/vehicle-catalog";
import type { Locale } from "@/lib/preferences";

const VPIC_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

async function fetchVPIC<T>(path: string): Promise<T> {
  const response = await fetch(`${VPIC_BASE_URL}${path}`, {
    next: { revalidate: 60 * 60 * 24 },
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`vPIC request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");
  const locale = (searchParams.get("locale") === "en" ? "en" : "de") as Locale;

  const text = {
    invalidVin: locale === "en" ? "VIN must be 17 characters long." : "VIN muss genau 17 Zeichen lang sein.",
    unsupported: locale === "en" ? "Unsupported resource." : "Nicht unterstuetzte Ressource.",
    unavailable:
      locale === "en"
        ? "Vehicle catalog service is currently unavailable."
        : "Der Fahrzeugkatalog ist aktuell nicht erreichbar.",
  };

  try {
    if (resource === "makes") {
      const query = (searchParams.get("q") ?? "").trim().toLowerCase();
      const limitParam = Number(searchParams.get("limit") ?? (query ? "100" : "5000"));
      const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 10000) : 100;
      const data = await fetchVPIC<{ Results: Array<Record<string, unknown>> }>("/GetAllMakes?format=json");
      const results = normalizeMakeResults(data.Results)
        .filter((item) => item.name.toLowerCase().includes(query))
        .slice(0, limit);

      return NextResponse.json({ results });
    }

    if (resource === "models") {
      const make = (searchParams.get("make") ?? "").trim();
      const year = (searchParams.get("year") ?? "").trim();
      const limitParam = Number(searchParams.get("limit") ?? "5000");
      const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20000) : 5000;
      if (!make) {
        return NextResponse.json({ results: [] });
      }

      const path = year
        ? `/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`
        : `/GetModelsForMake/${encodeURIComponent(make)}?format=json`;

      const data = await fetchVPIC<{ Results: Array<Record<string, unknown>> }>(path);
      const results = normalizeModelResults(data.Results).slice(0, limit);

      return NextResponse.json({ results });
    }

    if (resource === "vehicle-types") {
      const make = (searchParams.get("make") ?? "").trim();
      if (!make) {
        return NextResponse.json({ results: [] });
      }

      const data = await fetchVPIC<{ Results: Array<Record<string, unknown>> }>(
        `/GetVehicleTypesForMake/${encodeURIComponent(make)}?format=json`,
      );

      return NextResponse.json({ results: localizeVehicleTypes(normalizeVehicleTypes(data.Results), locale) });
    }

    if (resource === "decode-vin") {
      const vin = (searchParams.get("vin") ?? "").trim().toUpperCase();
      const year = (searchParams.get("year") ?? "").trim();

      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return NextResponse.json(
          { error: text.invalidVin },
          { status: 400 },
        );
      }

      const yearQuery = year ? `&modelyear=${encodeURIComponent(year)}` : "";
      const data = await fetchVPIC<{ Results: Array<Record<string, string>> }>(
        `/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json${yearQuery}`,
      );

      const result = localizeDecodeResult(normalizeDecodeResult(data.Results[0]), locale);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: text.unsupported }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: text.unavailable },
      { status: 502 },
    );
  }
}

