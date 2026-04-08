"use client";

import { useActionState, useDeferredValue, useEffect, useState } from "react";
import { createVehicle } from "./actions";
import type { FuelType } from "@/types/domain";
import type { Locale } from "@/lib/preferences";

interface CatalogMake {
  id: number;
  name: string;
}

interface CatalogModel {
  id: number;
  name: string;
}

interface CatalogDecodeResult {
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

interface VehicleFormValues {
  vin: string;
  make: string;
  model: string;
  year: string;
  fuelType: FuelType;
  vehicleType: string;
  bodyStyle: string;
  variant: string;
  engineDescription: string;
  transmission: string;
  driveType: string;
  doors: string;
  enginePowerKw: string;
  engineDisplacementCc: string;
  specialEquipment: string;
  purchasePrice: string;
  purchaseDate: string;
  licensePlate: string;
  currentMileage: string;
  catalogSource: string;
}

const MAX_MILEAGE = 9999999;
const MAX_ENGINE_POWER_KW = 2000;
const MAX_ENGINE_DISPLACEMENT_CC = 20000;
const MAX_DOORS = 9;

const INITIAL_FORM_VALUES: VehicleFormValues = {
  vin: "",
  make: "",
  model: "",
  year: "",
  fuelType: "petrol",
  vehicleType: "",
  bodyStyle: "",
  variant: "",
  engineDescription: "",
  transmission: "",
  driveType: "",
  doors: "",
  enginePowerKw: "",
  engineDisplacementCc: "",
  specialEquipment: "",
  purchasePrice: "",
  purchaseDate: "",
  licensePlate: "",
  currentMileage: "",
  catalogSource: "",
};

export function NewVehicleForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState(createVehicle, {
    error: null as string | null,
  });
  const [values, setValues] = useState<VehicleFormValues>(INITIAL_FORM_VALUES);
  const [makeSuggestions, setMakeSuggestions] = useState<CatalogMake[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<CatalogModel[]>([]);
  const [vehicleTypeSuggestions, setVehicleTypeSuggestions] = useState<string[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [vinLookupPending, setVinLookupPending] = useState(false);

  const deferredMakeQuery = useDeferredValue(values.make);
  const deferredModelQuery = useDeferredValue(values.model);
  const maxYear = new Date().getFullYear() + 1;

  const makesLoadError =
    locale === "en" ? "Could not load make suggestions." : "Markenvorschlaege konnten nicht geladen werden.";
  const modelsLoadError =
    locale === "en" ? "Could not load model suggestions." : "Modellvorschlaege konnten nicht geladen werden.";
  const invalidVinText =
    locale === "en" ? "Please enter a VIN with exactly 17 characters." : "Bitte gib eine VIN mit genau 17 Zeichen ein.";
  const decodeErrorText =
    locale === "en" ? "The VIN could not be decoded." : "Die VIN konnte nicht ausgewertet werden.";
  const catalogUnavailableText =
    locale === "en"
      ? "Vehicle catalog is currently unavailable."
      : "Der Fahrzeugkatalog ist aktuell nicht erreichbar.";
  const vinAnalysingText = locale === "en" ? "Analysing VIN..." : "VIN wird analysiert...";
  const vinPrefillText =
    locale === "en" ? "Prefill vehicle from VIN" : "Fahrzeug aus VIN vorbefuellen";

  useEffect(() => {
    const makeQuery = deferredMakeQuery.trim();

    let cancelled = false;

    async function loadMakes() {
      const response = await fetch(
        `/api/vehicle-catalog?resource=makes&q=${encodeURIComponent(makeQuery)}&limit=${makeQuery ? 200 : 5000}&locale=${locale}`,
      );
      const payload = (await response.json()) as { results?: CatalogMake[]; error?: string };

      if (cancelled) return;
      if (!response.ok) {
        setCatalogError(payload.error ?? makesLoadError);
        return;
      }

      setCatalogError(null);
      setMakeSuggestions(payload.results ?? []);
    }

    void loadMakes();

    return () => {
      cancelled = true;
    };
  }, [deferredMakeQuery, locale, makesLoadError]);

  useEffect(() => {
    const make = values.make.trim();
    if (!make) {
      setModelSuggestions([]);
      setVehicleTypeSuggestions([]);
      return;
    }

    let cancelled = false;

    async function loadModelsAndTypes() {
      const [modelsResponse, typesResponse] = await Promise.all([
        fetch(
          `/api/vehicle-catalog?resource=models&make=${encodeURIComponent(make)}&year=${encodeURIComponent(values.year)}&limit=10000&locale=${locale}`,
        ),
        fetch(`/api/vehicle-catalog?resource=vehicle-types&make=${encodeURIComponent(make)}&locale=${locale}`),
      ]);

      const modelsPayload = (await modelsResponse.json()) as { results?: CatalogModel[]; error?: string };
      const typesPayload = (await typesResponse.json()) as { results?: string[]; error?: string };

      if (cancelled) return;

      if (!modelsResponse.ok) {
        setCatalogError(modelsPayload.error ?? modelsLoadError);
      } else {
        setCatalogError(null);
        const results = modelsPayload.results ?? [];
        const query = deferredModelQuery.trim().toLowerCase();
        setModelSuggestions(
          query
            ? results.filter((item) => item.name.toLowerCase().includes(query))
            : results,
        );
      }

      if (typesResponse.ok) {
        setVehicleTypeSuggestions(typesPayload.results ?? []);
      }
    }

    void loadModelsAndTypes();

    return () => {
      cancelled = true;
    };
  }, [values.make, values.year, deferredModelQuery, locale, modelsLoadError]);

  function setField<K extends keyof VehicleFormValues>(field: K, value: VehicleFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function clampInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (!input.value) return;

    const value = Number(input.value);
    if (Number.isNaN(value)) return;

    if (input.max) {
      const max = Number(input.max);
      if (!Number.isNaN(max) && value > max) {
        input.value = String(max);
        setField(input.name as keyof VehicleFormValues, String(max) as never);
      }
    }

    if (input.min) {
      const min = Number(input.min);
      if (!Number.isNaN(min) && value < min) {
        input.value = String(min);
        setField(input.name as keyof VehicleFormValues, String(min) as never);
      }
    }
  }

  async function handleVinLookup() {
    const vin = values.vin.trim().toUpperCase();

    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      setCatalogError(invalidVinText);
      return;
    }

    setVinLookupPending(true);
    setCatalogError(null);

    try {
      const response = await fetch(
        `/api/vehicle-catalog?resource=decode-vin&vin=${encodeURIComponent(vin)}&year=${encodeURIComponent(values.year)}&locale=${locale}`,
      );
      const payload = (await response.json()) as { result?: CatalogDecodeResult | null; error?: string };

      if (!response.ok || !payload.result) {
        setCatalogError(payload.error ?? decodeErrorText);
        return;
      }

      const decoded = payload.result;
      setValues((prev) => ({
        ...prev,
        vin,
        make: decoded.make ?? prev.make,
        model: decoded.model ?? prev.model,
        year: decoded.year ? String(decoded.year) : prev.year,
        fuelType: decoded.fuelType ?? prev.fuelType,
        vehicleType: decoded.vehicleType ?? prev.vehicleType,
        bodyStyle: decoded.bodyStyle ?? prev.bodyStyle,
        variant: decoded.variant ?? prev.variant,
        engineDescription: decoded.engineDescription ?? prev.engineDescription,
        transmission: decoded.transmission ?? prev.transmission,
        driveType: decoded.driveType ?? prev.driveType,
        doors: decoded.doors ? String(decoded.doors) : prev.doors,
        enginePowerKw: decoded.enginePowerKw ? String(decoded.enginePowerKw) : prev.enginePowerKw,
        engineDisplacementCc: decoded.engineDisplacementCc
          ? String(decoded.engineDisplacementCc)
          : prev.engineDisplacementCc,
        catalogSource: decoded.catalogSource ?? prev.catalogSource,
      }));
    } catch {
      setCatalogError(catalogUnavailableText);
    } finally {
      setVinLookupPending(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}
      {catalogError && (
        <div className="rounded-xl border border-amber-300/40 bg-amber-100/70 p-3 text-sm text-amber-900">
          {catalogError}
        </div>
      )}

      <section className="rounded-2xl border border-border/80 bg-card/60 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label htmlFor="vin" className="block text-sm font-medium text-foreground">
              VIN / Fahrgestellnummer (optional)
            </label>
            <input
              id="vin"
              name="vin"
              type="text"
              inputMode="text"
              maxLength={17}
              value={values.vin}
              onChange={(event) => setField("vin", event.target.value.toUpperCase())}
              placeholder="WVWZZZ1JZXW000001"
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 font-mono text-sm text-foreground tracking-[0.08em] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <p className="mt-1 text-xs text-muted">
              Schnellstart: Mit VIN werden Marke, Modell und mehrere technische Details automatisch vorbefuellt, sofern verf?gbar.
            </p>
          </div>
          <button
            type="button"
            onClick={handleVinLookup}
            disabled={vinLookupPending}
            className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand hover:bg-brand/15 disabled:opacity-50"
          >
            {vinLookupPending ? vinAnalysingText : vinPrefillText}
          </button>
        </div>
      </section>

      <input type="hidden" name="catalog_source" value={values.catalogSource} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-foreground">
            Marke
          </label>
          <input
            id="make"
            name="make"
            type="text"
            required
            list="make-suggestions"
            value={values.make}
            onChange={(event) => setField("make", event.target.value)}
            placeholder="z. B. Volkswagen"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <datalist id="make-suggestions">
            {makeSuggestions.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-muted">Marken werden als Vorschlaege geladen, du kannst aber jederzeit frei eingeben.</p>
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-foreground">
            Modell
          </label>
          <input
            id="model"
            name="model"
            type="text"
            required
            list="model-suggestions"
            value={values.model}
            onChange={(event) => setField("model", event.target.value)}
            placeholder="z. B. Golf"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <datalist id="model-suggestions">
            {modelSuggestions.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-muted">Modellvorschlaege werden anhand von Marke und Baujahr verfeinert.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-foreground">
            Baujahr
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            min={1900}
            max={maxYear}
            value={values.year}
            onChange={(event) => setField("year", event.target.value)}
            onInput={clampInput}
            placeholder="2021"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Erlaubter Bereich: 1900 bis {maxYear}</p>
        </div>

        <div>
          <label htmlFor="fuel_type" className="block text-sm font-medium text-foreground">
            Kraftstoff
          </label>
          <select
            id="fuel_type"
            name="fuel_type"
            required
            value={values.fuelType}
            onChange={(event) => setField("fuelType", event.target.value as FuelType)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="petrol">Benzin</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elektro</option>
            <option value="hybrid">Hybrid</option>
            <option value="lpg">LPG</option>
            <option value="cng">CNG</option>
          </select>
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card/50 p-4 md:grid-cols-2">
        <div>
          <label htmlFor="vehicle_type" className="block text-sm font-medium text-foreground">
            Fahrzeugtyp
          </label>
          <input
            id="vehicle_type"
            name="vehicle_type"
            type="text"
            list="vehicle-type-suggestions"
            value={values.vehicleType}
            onChange={(event) => setField("vehicleType", event.target.value)}
            placeholder="z. B. Passenger Car"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <datalist id="vehicle-type-suggestions">
            {vehicleTypeSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="body_style" className="block text-sm font-medium text-foreground">
            Karosserieform
          </label>
          <input
            id="body_style"
            name="body_style"
            type="text"
            value={values.bodyStyle}
            onChange={(event) => setField("bodyStyle", event.target.value)}
            placeholder="z. B. Kombi, Limousine, SUV"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="variant" className="block text-sm font-medium text-foreground">
            Variante / Trim
          </label>
          <input
            id="variant"
            name="variant"
            type="text"
            value={values.variant}
            onChange={(event) => setField("variant", event.target.value)}
            placeholder="z. B. Style 2.0 TDI DSG"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="engine_description" className="block text-sm font-medium text-foreground">
            Motorisierung
          </label>
          <input
            id="engine_description"
            name="engine_description"
            type="text"
            value={values.engineDescription}
            onChange={(event) => setField("engineDescription", event.target.value)}
            placeholder="z. B. 2.0L · 4 cyl · Diesel"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-foreground">
            Getriebe
          </label>
          <input
            id="transmission"
            name="transmission"
            type="text"
            value={values.transmission}
            onChange={(event) => setField("transmission", event.target.value)}
            placeholder="z. B. Automatik"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="drive_type" className="block text-sm font-medium text-foreground">
            Antrieb
          </label>
          <input
            id="drive_type"
            name="drive_type"
            type="text"
            value={values.driveType}
            onChange={(event) => setField("driveType", event.target.value)}
            placeholder="z. B. Front Wheel Drive"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="doors" className="block text-sm font-medium text-foreground">
            Tueren
          </label>
          <input
            id="doors"
            name="doors"
            type="number"
            min={1}
            max={MAX_DOORS}
            value={values.doors}
            onChange={(event) => setField("doors", event.target.value)}
            onInput={clampInput}
            placeholder="5"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="engine_power_kw" className="block text-sm font-medium text-foreground">
            Leistung (kW)
          </label>
          <input
            id="engine_power_kw"
            name="engine_power_kw"
            type="number"
            min={0}
            max={MAX_ENGINE_POWER_KW}
            value={values.enginePowerKw}
            onChange={(event) => setField("enginePowerKw", event.target.value)}
            onInput={clampInput}
            placeholder="110"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Beispiel: 110 kW</p>
        </div>

        <div>
          <label htmlFor="engine_displacement_cc" className="block text-sm font-medium text-foreground">
            Hubraum (ccm)
          </label>
          <input
            id="engine_displacement_cc"
            name="engine_displacement_cc"
            type="number"
            min={0}
            max={MAX_ENGINE_DISPLACEMENT_CC}
            value={values.engineDisplacementCc}
            onChange={(event) => setField("engineDisplacementCc", event.target.value)}
            onInput={clampInput}
            placeholder="1968"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Beispiel: 1.968 ccm</p>
        </div>
      </div>

      <div>
        <label htmlFor="special_equipment" className="block text-sm font-medium text-foreground">
          Sonderausstattung / Besonderheiten
        </label>
        <textarea
          id="special_equipment"
          name="special_equipment"
          rows={3}
          value={values.specialEquipment}
          onChange={(event) => setField("specialEquipment", event.target.value)}
          placeholder="z. B. ACC, Head-up-Display, Panoramadach, Matrix-LED"
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-muted">
          Vollständige Sonderausstattungsdaten wie bei großen Marktplatz-Plattformen sind ohne lizenzierte Datenquelle meist nicht automatisiert verfügbar. Dieses Feld bleibt bewusst als schneller manueller Snapshot erhalten.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="purchase_price" className="block text-sm font-medium text-foreground">
            Kaufpreis (optional)
          </label>
          <input
            id="purchase_price"
            name="purchase_price"
            type="number"
            min={0}
            step="0.01"
            value={values.purchasePrice}
            onChange={(event) => setField("purchasePrice", event.target.value)}
            onInput={clampInput}
            placeholder="18500"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Wird in den übersichten als einmaliger Anschaffungskostenblock angezeigt.</p>
        </div>

        <div>
          <label htmlFor="purchase_date" className="block text-sm font-medium text-foreground">
            Kaufdatum (optional)
          </label>
          <input
            id="purchase_date"
            name="purchase_date"
            type="date"
            value={values.purchaseDate}
            onChange={(event) => setField("purchaseDate", event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="license_plate" className="block text-sm font-medium text-foreground">
            Kennzeichen
          </label>
          <input
            id="license_plate"
            name="license_plate"
            type="text"
            required
            value={values.licensePlate}
            onChange={(event) => setField("licensePlate", event.target.value.toUpperCase())}
            placeholder="B-AB 1234E"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="current_mileage" className="block text-sm font-medium text-foreground">
            Aktueller Kilometerstand
          </label>
          <input
            id="current_mileage"
            name="current_mileage"
            type="number"
            required
            min={0}
            max={MAX_MILEAGE}
            value={values.currentMileage}
            onChange={(event) => setField("currentMileage", event.target.value)}
            onInput={clampInput}
            placeholder="123456"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Maximal 7-stellig, z. B. 123.456 km</p>
        </div>
      </div>

      {values.catalogSource ? (
        <p className="text-xs text-muted">
          Vorbefüllung aktiv. Quelle: <span className="font-medium text-foreground">{values.catalogSource}</span>
        </p>
      ) : null}

      <p className="text-xs text-muted">
        Empfehlung: Wähle zuerst VIN oder Marke und Modell. Danach prüfst du nur noch Details und sparst dir einen großen Teil der manuellen Eingabe.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert..." : "Fahrzeug anlegen"}
      </button>
    </form>
  );
}


