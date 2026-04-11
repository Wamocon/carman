"use client";

import { useActionState, useDeferredValue, useEffect, useState } from "react";
import {
  ACQUISITION_SUBTYPE_OPTIONS,
  ACQUISITION_TYPE_OPTIONS,
  BODY_STYLE_OPTIONS,
  DOORS_OPTIONS,
  DRIVE_TYPE_OPTIONS,
  STANDARD_EQUIPMENT,
  TRANSMISSION_OPTIONS,
  convertKwToPs,
} from "@/lib/vehicle-market";
import type { Locale } from "@/lib/preferences";
import type { AcquisitionType, FuelType } from "@/types/domain";
import { createVehicle } from "./actions";

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
  variant?: string;
  engineDescription?: string;
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
  bodyStyle: string;
  variant: string;
  engineDescription: string;
  transmission: string;
  driveType: string;
  doors: string;
  enginePowerKw: string;
  engineDisplacementCc: string;
  equipmentFreeText: string;
  acquisitionType: AcquisitionType;
  acquisitionSubtype: string;
  downPayment: string;
  monthlyPayment: string;
  termMonths: string;
  finalPayment: string;
  contractStartDate: string;
  purchasePrice: string;
  purchaseDate: string;
  licensePlate: string;
  currentMileage: string;
  catalogSource: string;
}

const MAX_MILEAGE = 9999999;
const MAX_ENGINE_POWER_KW = 2000;
const MAX_ENGINE_POWER_PS = 3000;
const MAX_ENGINE_DISPLACEMENT_CC = 20000;

const INITIAL_FORM_VALUES: VehicleFormValues = {
  vin: "",
  make: "",
  model: "",
  year: "",
  fuelType: "petrol",
  bodyStyle: "",
  variant: "",
  engineDescription: "",
  transmission: "",
  driveType: "",
  doors: "",
  enginePowerKw: "",
  engineDisplacementCc: "",
  equipmentFreeText: "",
  acquisitionType: "purchase",
  acquisitionSubtype: "cash",
  downPayment: "",
  monthlyPayment: "",
  termMonths: "",
  finalPayment: "",
  contractStartDate: "",
  purchasePrice: "",
  purchaseDate: "",
  licensePlate: "",
  currentMileage: "",
  catalogSource: "",
};

function getYearValidationMessage(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Bitte ein Baujahr eingeben.";
  if (!/^\d{4}$/.test(trimmed)) return "Bitte ein vierstelliges Baujahr eingeben.";
  const year = Number.parseInt(trimmed, 10);
  const currentYear = new Date().getFullYear();
  if (year < 1886) return "Das Baujahr liegt vor der automobilen Serienproduktion.";
  if (year > currentYear + 2) return "Das Baujahr liegt unplausibel weit in der Zukunft.";
  return null;
}

export function NewVehicleForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState(createVehicle, {
    error: null as string | null,
  });
  const [values, setValues] = useState<VehicleFormValues>(INITIAL_FORM_VALUES);
  const [makeSuggestions, setMakeSuggestions] = useState<CatalogMake[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<CatalogModel[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [vinLookupPending, setVinLookupPending] = useState(false);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [powerUnit, setPowerUnit] = useState<"kW" | "PS">("kW");
  const [powerPsValue, setPowerPsValue] = useState("");

  const deferredMakeQuery = useDeferredValue(values.make);
  const deferredModelQuery = useDeferredValue(values.model);

  const makesLoadError =
    locale === "en" ? "Could not load make suggestions." : "Markenvorschläge konnten nicht geladen werden.";
  const modelsLoadError =
    locale === "en" ? "Could not load model suggestions." : "Modellvorschläge konnten nicht geladen werden.";
  const invalidVinText =
    locale === "en" ? "Please enter a VIN with exactly 17 characters." : "Bitte gib eine VIN mit genau 17 Zeichen ein.";
  const decodeErrorText =
    locale === "en" ? "The VIN could not be decoded." : "Die VIN konnte nicht ausgewertet werden.";
  const catalogUnavailableText =
    locale === "en"
      ? "Vehicle catalog is currently unavailable."
      : "Der Fahrzeugkatalog ist aktuell nicht erreichbar.";
  const vinAnalysingText = locale === "en" ? "Analysing VIN..." : "VIN wird analysiert...";
  const vinPrefillText = locale === "en" ? "Prefill vehicle from VIN" : "Fahrzeug aus VIN vorbefüllen";

  const activeSubtypeOptions = ACQUISITION_SUBTYPE_OPTIONS[values.acquisitionType];

  useEffect(() => {
    const defaultSubtype = ACQUISITION_SUBTYPE_OPTIONS[values.acquisitionType][0]?.value ?? "";
    if (!activeSubtypeOptions.some((option) => option.value === values.acquisitionSubtype)) {
      setValues((prev) => ({ ...prev, acquisitionSubtype: defaultSubtype }));
    }
  }, [activeSubtypeOptions, values.acquisitionSubtype, values.acquisitionType]);

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
      return;
    }

    let cancelled = false;

    async function loadModels() {
      const modelsResponse = await fetch(
        `/api/vehicle-catalog?resource=models&make=${encodeURIComponent(make)}&year=${encodeURIComponent(values.year)}&limit=10000&locale=${locale}`,
      );
      const modelsPayload = (await modelsResponse.json()) as { results?: CatalogModel[]; error?: string };
      if (cancelled) return;
      if (!modelsResponse.ok) {
        setCatalogError(modelsPayload.error ?? modelsLoadError);
      } else {
        setCatalogError(null);
        const results = modelsPayload.results ?? [];
        const query = deferredModelQuery.trim().toLowerCase();
        setModelSuggestions(
          query ? results.filter((item) => item.name.toLowerCase().includes(query)) : results,
        );
      }
    }

    void loadModels();
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
        variant: decoded.variant ?? prev.variant,
        engineDescription: decoded.engineDescription ?? prev.engineDescription,
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

  function toggleEquipment(item: string) {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  }

  function getPowerDisplayValue(): string {
    if (powerUnit === "kW") {
      return values.enginePowerKw;
    }
    return powerPsValue;
  }

  function handlePowerChange(inputValue: string) {
    if (powerUnit === "kW") {
      setField("enginePowerKw", inputValue);
      if (!inputValue) {
        setPowerPsValue("");
        return;
      }
      const kw = parseFloat(inputValue);
      if (!Number.isNaN(kw)) {
        setPowerPsValue(String(convertKwToPs(kw)));
      }
    } else {
      // Keep PS exactly as entered by the user.
      setField("enginePowerKw", "");
      setPowerPsValue(inputValue);
    }
  }

  const combinedEquipment = [...selectedEquipment, values.equipmentFreeText.trim()]
    .filter(Boolean)
    .join(", ");

  const yearValidationMessage = getYearValidationMessage(values.year);
  const visibleMakes = makeSuggestions.slice(0, 80);
  const visibleModels = modelSuggestions.slice(0, 120);

  const inputClass =
    "mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
  const selectClass = inputClass;

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

      {/* Hidden fields */}
      <input type="hidden" name="special_equipment" value={combinedEquipment} />
      <input type="hidden" name="catalog_source" value={values.catalogSource} />
      <input type="hidden" name="engine_power_kw" value={values.enginePowerKw} />
      <input type="hidden" name="engine_power_ps" value={powerPsValue} />

      {/* VIN lookup */}
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
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 font-mono text-sm tracking-[0.08em] text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <p className="mt-1 text-xs text-muted">
              Schnellstart: Mit VIN werden Marke, Modell und technische Details automatisch vorbefüllt.
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

      {/* Pflichtdaten */}
      <section className="rounded-2xl border border-border/70 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Pflichtdaten</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">

          {/* Marke – custom combobox */}
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-foreground">
              Marke
            </label>
            <div className="relative mt-1">
              <input
                id="make"
                name="make"
                type="text"
                required
                autoComplete="off"
                value={values.make}
                onChange={(event) => {
                  setField("make", event.target.value);
                  setShowMakeSuggestions(true);
                }}
                onFocus={() => setShowMakeSuggestions(true)}
                onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 150)}
                placeholder="z. B. Volkswagen"
                className="block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              {showMakeSuggestions && visibleMakes.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                  {visibleMakes.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-foreground/5"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setField("make", item.name);
                          setShowMakeSuggestions(false);
                        }}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Modell – custom combobox */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-foreground">
              Modell
            </label>
            <div className="relative mt-1">
              <input
                id="model"
                name="model"
                type="text"
                required
                autoComplete="off"
                value={values.model}
                onChange={(event) => {
                  setField("model", event.target.value);
                  setShowModelSuggestions(true);
                }}
                onFocus={() => setShowModelSuggestions(true)}
                onBlur={() => setTimeout(() => setShowModelSuggestions(false), 150)}
                placeholder="z. B. Golf"
                className="block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              {showModelSuggestions && visibleModels.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                  {visibleModels.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-foreground/5"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setField("model", item.name);
                          setShowModelSuggestions(false);
                        }}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Variante – direkt nach Modell */}
          <div>
            <label htmlFor="variant" className="block text-sm font-medium text-foreground">
              Variante / Ausstattungslinie
            </label>
            <input
              id="variant"
              name="variant"
              type="text"
              value={values.variant}
              onChange={(event) => setField("variant", event.target.value)}
              placeholder="z. B. Style 2.0 TDI DSG"
              className={inputClass}
            />
          </div>

          {/* Baujahr */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-foreground">
              Baujahr
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              value={values.year}
              onChange={(event) => setField("year", event.target.value)}
              placeholder="2021"
              className={inputClass}
            />
            {values.year && yearValidationMessage ? (
              <p className="mt-1 text-xs text-danger">{yearValidationMessage}</p>
            ) : null}
          </div>

          {/* Kraftstoff */}
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
              className={selectClass}
            >
              <option value="petrol">Benzin</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Elektro</option>
              <option value="hybrid">Hybrid</option>
              <option value="lpg">LPG</option>
              <option value="cng">CNG</option>
            </select>
          </div>

          {/* Kennzeichen */}
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
              className={inputClass}
            />
          </div>

          {/* Kilometerstand */}
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
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Fahrzeugdaten */}
      <section className="rounded-2xl border border-border/70 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Fahrzeugdaten</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">

          {/* Fahrzeugtyp / Karosserie – zusammengefasst */}
          <div>
            <label htmlFor="body_style" className="block text-sm font-medium text-foreground">
              Fahrzeugtyp / Karosserie
            </label>
            <select
              id="body_style"
              name="body_style"
              value={values.bodyStyle}
              onChange={(event) => setField("bodyStyle", event.target.value)}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {BODY_STYLE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motorisierung */}
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
              placeholder="z. B. 2.0 TDI"
              className={inputClass}
            />
          </div>

          {/* Getriebe */}
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-foreground">
              Getriebe
            </label>
            <select
              id="transmission"
              name="transmission"
              value={values.transmission}
              onChange={(event) => setField("transmission", event.target.value)}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {TRANSMISSION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Antrieb */}
          <div>
            <label htmlFor="drive_type" className="block text-sm font-medium text-foreground">
              Antrieb
            </label>
            <select
              id="drive_type"
              name="drive_type"
              value={values.driveType}
              onChange={(event) => setField("driveType", event.target.value)}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {DRIVE_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Türen */}
          <div>
            <label htmlFor="doors" className="block text-sm font-medium text-foreground">
              Türen
            </label>
            <select
              id="doors"
              name="doors"
              value={values.doors}
              onChange={(event) => setField("doors", event.target.value)}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {DOORS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Leistung mit kW/PS-Umschaltung */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="engine_power_display" className="block text-sm font-medium text-foreground">
                Leistung
              </label>
              <div className="flex overflow-hidden rounded-lg border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setPowerUnit("kW")}
                  className={`px-2.5 py-1 font-medium transition ${
                    powerUnit === "kW" ? "bg-brand text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  kW
                </button>
                <button
                  type="button"
                  onClick={() => setPowerUnit("PS")}
                  className={`px-2.5 py-1 font-medium transition ${
                    powerUnit === "PS" ? "bg-brand text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  PS
                </button>
              </div>
            </div>
            <input
              id="engine_power_display"
              type="number"
              min={0}
              max={powerUnit === "kW" ? MAX_ENGINE_POWER_KW : MAX_ENGINE_POWER_PS}
              value={getPowerDisplayValue()}
              onChange={(event) => handlePowerChange(event.target.value)}
              placeholder={powerUnit === "kW" ? "110" : "150"}
              className={inputClass}
            />
            {values.enginePowerKw && powerUnit === "PS" && (
              <p className="mt-1 text-xs text-muted">≈ {values.enginePowerKw} kW</p>
            )}
            {values.enginePowerKw && powerUnit === "kW" && (
              <p className="mt-1 text-xs text-muted">
                ≈ {convertKwToPs(parseFloat(values.enginePowerKw))} PS
              </p>
            )}
          </div>

          {/* Hubraum */}
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
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Erwerb und Anschaffungskosten */}
      <section className="rounded-2xl border border-border/70 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Erwerb und Anschaffungskosten</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="acquisition_type" className="block text-sm font-medium text-foreground">
              Erwerbsart
            </label>
            <select
              id="acquisition_type"
              name="acquisition_type"
              required
              value={values.acquisitionType}
              onChange={(event) => setField("acquisitionType", event.target.value as AcquisitionType)}
              className={selectClass}
            >
              {ACQUISITION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="acquisition_subtype" className="block text-sm font-medium text-foreground">
              Erwerbsoption
            </label>
            <select
              id="acquisition_subtype"
              name="acquisition_subtype"
              required
              value={values.acquisitionSubtype}
              onChange={(event) => setField("acquisitionSubtype", event.target.value)}
              className={selectClass}
            >
              {activeSubtypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
              className={inputClass}
            />
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
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="down_payment" className="block text-sm font-medium text-foreground">
              Anzahlung (optional)
            </label>
            <input
              id="down_payment"
              name="down_payment"
              type="number"
              min={0}
              step="0.01"
              value={values.downPayment}
              onChange={(event) => setField("downPayment", event.target.value)}
              onInput={clampInput}
              placeholder="2500"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="monthly_payment" className="block text-sm font-medium text-foreground">
              Monatsrate
            </label>
            <input
              id="monthly_payment"
              name="monthly_payment"
              type="number"
              min={0}
              step="0.01"
              value={values.monthlyPayment}
              onChange={(event) => setField("monthlyPayment", event.target.value)}
              onInput={clampInput}
              placeholder={values.acquisitionType === "purchase" ? "optional" : "299"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="term_months" className="block text-sm font-medium text-foreground">
              Laufzeit in Monaten
            </label>
            <input
              id="term_months"
              name="term_months"
              type="number"
              min={1}
              value={values.termMonths}
              onChange={(event) => setField("termMonths", event.target.value)}
              onInput={clampInput}
              placeholder={values.acquisitionType === "purchase" ? "optional" : "36"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="final_payment" className="block text-sm font-medium text-foreground">
              Schlussrate (optional)
            </label>
            <input
              id="final_payment"
              name="final_payment"
              type="number"
              min={0}
              step="0.01"
              value={values.finalPayment}
              onChange={(event) => setField("finalPayment", event.target.value)}
              onInput={clampInput}
              placeholder="5000"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contract_start_date" className="block text-sm font-medium text-foreground">
              Vertragsstart (optional)
            </label>
            <input
              id="contract_start_date"
              name="contract_start_date"
              type="date"
              value={values.contractStartDate}
              onChange={(event) => setField("contractStartDate", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Sonderausstattung und Besonderheiten */}
      <section className="rounded-2xl border border-border/70 bg-card/50 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Sonderausstattung und Besonderheiten</p>
        <div className="mt-3 space-y-4">
          {STANDARD_EQUIPMENT.map((category) => (
            <div key={category.category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                {category.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => {
                  const checked = selectedEquipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        checked
                          ? "border-brand/40 bg-brand/10 text-brand"
                          : "border-border bg-card text-foreground/70 hover:bg-foreground/5"
                      }`}
                    >
                      {checked ? "✓ " : ""}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <label htmlFor="equipment_free_text" className="block text-xs font-medium text-muted">
              Weitere Ausstattung (Freitext)
            </label>
            <textarea
              id="equipment_free_text"
              rows={2}
              value={values.equipmentFreeText}
              onChange={(event) => setField("equipmentFreeText", event.target.value)}
              placeholder="z. B. Sportauspuff, Tieferlegung, Sonderfarbe ..."
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
      </section>

      {values.catalogSource ? (
        <p className="text-xs text-muted">
          Vorbefüllung aktiv. Quelle:{" "}
          <span className="font-medium text-foreground">{values.catalogSource}</span>
        </p>
      ) : null}

      <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-xs text-muted">
        Fahrzeugpapiere (Zulassungsbescheinigung, Versicherung, TÜV-Bericht) können nach dem Anlegen
        unter Stammdaten hochgeladen werden.
      </div>

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
