"use client";

import { useActionState, useState } from "react";
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
import type { AcquisitionSubtype, AcquisitionType, Vehicle } from "@/types/domain";
import { updateVehicleProfile } from "./actions";

const ALL_STANDARD_ITEMS = STANDARD_EQUIPMENT.flatMap((cat) => cat.items);
const MAX_POWER_PS = 3000;

function parseEquipment(stored: string): { checked: string[]; freeText: string } {
  const parts = stored
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const checked = parts.filter((p) => ALL_STANDARD_ITEMS.includes(p));
  const freeText = parts
    .filter((p) => !ALL_STANDARD_ITEMS.includes(p))
    .join(", ");
  return { checked, freeText };
}

const inputClass =
  "mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const selectClass = inputClass;

export function VehicleEditForm({ vehicle }: { vehicle: Vehicle }) {
  const [state, formAction, pending] = useActionState(updateVehicleProfile, {
    error: null as string | null,
    success: null as string | null,
  });

  const [activeAcquisitionType, setActiveAcquisitionType] = useState<AcquisitionType>(
    vehicle.acquisition_type ?? "purchase",
  );
  const subtypeOptions = ACQUISITION_SUBTYPE_OPTIONS[activeAcquisitionType];
  const [acquisitionSubtypeValue, setAcquisitionSubtypeValue] = useState<AcquisitionSubtype>(
    vehicle.acquisition_subtype ?? subtypeOptions[0]?.value ?? "",
  );

  const { checked: initialChecked, freeText: initialFreeText } = parseEquipment(
    vehicle.special_equipment ?? "",
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialChecked);
  const [equipmentFreeText, setEquipmentFreeText] = useState(initialFreeText);

  const [powerUnit, setPowerUnit] = useState<"kW" | "PS">(
    vehicle.engine_power_ps && !vehicle.engine_power_kw ? "PS" : "kW",
  );
  const [powerKwValue, setPowerKwValue] = useState(vehicle.engine_power_kw?.toString() ?? "");
  const [powerPsValue, setPowerPsValue] = useState(
    vehicle.engine_power_ps?.toString() ?? (vehicle.engine_power_kw ? String(convertKwToPs(vehicle.engine_power_kw)) : ""),
  );

  function toggleEquipment(item: string) {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  }

  function getPowerDisplayValue(): string {
    if (powerUnit === "kW") {
      return powerKwValue;
    }
    return powerPsValue;
  }

  function handlePowerChange(inputValue: string) {
    if (powerUnit === "kW") {
      setPowerKwValue(inputValue);
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
      setPowerKwValue("");
      setPowerPsValue(inputValue);
    }
  }

  function changeAcquisitionType(type: AcquisitionType) {
    setActiveAcquisitionType(type);
    const firstSubtype = ACQUISITION_SUBTYPE_OPTIONS[type][0]?.value ?? "cash";
    setAcquisitionSubtypeValue(firstSubtype);
  }

  const combinedEquipment = [...selectedEquipment, equipmentFreeText.trim()]
    .filter(Boolean)
    .join(", ");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="vehicle_id" value={vehicle.id} />
      <input type="hidden" name="special_equipment" value={combinedEquipment} />
      <input type="hidden" name="engine_power_kw" value={powerKwValue} />
      <input type="hidden" name="engine_power_ps" value={powerPsValue} />
      <input type="hidden" name="acquisition_type" value={activeAcquisitionType} />

      {/* Pflichtdaten */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Pflichtdaten</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-foreground">
              Marke
            </label>
            <input id="make" name="make" required defaultValue={vehicle.make} className={inputClass} />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-foreground">
              Modell
            </label>
            <input id="model" name="model" required defaultValue={vehicle.model} className={inputClass} />
          </div>
          <div>
            <label htmlFor="variant" className="block text-sm font-medium text-foreground">
              Variante / Ausstattungslinie
            </label>
            <input
              id="variant"
              name="variant"
              defaultValue={vehicle.variant ?? ""}
              placeholder="z. B. Style 2.0 TDI DSG"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-foreground">
              Baujahr
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              defaultValue={vehicle.year}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="fuel_type" className="block text-sm font-medium text-foreground">
              Kraftstoff
            </label>
            <select
              id="fuel_type"
              name="fuel_type"
              required
              defaultValue={vehicle.fuel_type}
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
          <div>
            <label htmlFor="license_plate" className="block text-sm font-medium text-foreground">
              Kennzeichen
            </label>
            <input
              id="license_plate"
              name="license_plate"
              required
              defaultValue={vehicle.license_plate}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="current_mileage" className="block text-sm font-medium text-foreground">
              Kilometerstand
            </label>
            <input
              id="current_mileage"
              name="current_mileage"
              type="number"
              min={0}
              max={9999999}
              required
              defaultValue={vehicle.current_mileage}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Fahrzeugdaten */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Fahrzeugdaten</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="vin" className="block text-sm font-medium text-foreground">
              VIN
            </label>
            <input
              id="vin"
              name="vin"
              defaultValue={vehicle.vin ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 font-mono text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="body_style" className="block text-sm font-medium text-foreground">
              Fahrzeugtyp / Karosserie
            </label>
            <select
              id="body_style"
              name="body_style"
              defaultValue={vehicle.body_style ?? ""}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {BODY_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="engine_description" className="block text-sm font-medium text-foreground">
              Motorisierung
            </label>
            <input
              id="engine_description"
              name="engine_description"
              defaultValue={vehicle.engine_description ?? ""}
              placeholder="z. B. 2.0 TDI"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-foreground">
              Getriebe
            </label>
            <select
              id="transmission"
              name="transmission"
              defaultValue={vehicle.transmission ?? ""}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {TRANSMISSION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="drive_type" className="block text-sm font-medium text-foreground">
              Antrieb
            </label>
            <select
              id="drive_type"
              name="drive_type"
              defaultValue={vehicle.drive_type ?? ""}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {DRIVE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="doors" className="block text-sm font-medium text-foreground">
              Türen
            </label>
            <select
              id="doors"
              name="doors"
              defaultValue={vehicle.doors?.toString() ?? ""}
              className={selectClass}
            >
              <option value="">Bitte auswählen</option>
              {DOORS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
              max={powerUnit === "kW" ? 2000 : MAX_POWER_PS}
              value={getPowerDisplayValue()}
              onChange={(event) => handlePowerChange(event.target.value)}
              placeholder={powerUnit === "kW" ? "110" : "150"}
              className={inputClass}
            />
            {powerKwValue && powerUnit === "PS" && (
              <p className="mt-1 text-xs text-muted">≈ {powerKwValue} kW</p>
            )}
            {powerKwValue && powerUnit === "kW" && (
              <p className="mt-1 text-xs text-muted">
                ≈ {convertKwToPs(parseFloat(powerKwValue))} PS
              </p>
            )}
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
              max={20000}
              defaultValue={vehicle.engine_displacement_cc ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Erwerb und Anschaffungskosten */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Erwerb und Anschaffungskosten</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACQUISITION_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => changeAcquisitionType(option.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                activeAcquisitionType === option.value
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-border bg-card text-foreground hover:bg-foreground/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="acquisition_subtype" className="block text-sm font-medium text-foreground">
              Erwerbsoption
            </label>
            <select
              id="acquisition_subtype"
              name="acquisition_subtype"
              value={acquisitionSubtypeValue}
              onChange={(event) => setAcquisitionSubtypeValue(event.target.value as AcquisitionSubtype)}
              className={selectClass}
            >
              {subtypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {activeAcquisitionType === "purchase" ? (
            <>
              <div>
                <label htmlFor="purchase_price" className="block text-sm font-medium text-foreground">
                  Kaufpreis
                </label>
                <input
                  id="purchase_price"
                  name="purchase_price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={vehicle.purchase_price ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="purchase_date" className="block text-sm font-medium text-foreground">
                  Kaufdatum
                </label>
                <input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  defaultValue={vehicle.purchase_date ?? ""}
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="down_payment" className="block text-sm font-medium text-foreground">
                  Anzahlung
                </label>
                <input
                  id="down_payment"
                  name="down_payment"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={vehicle.down_payment ?? ""}
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
                  defaultValue={vehicle.monthly_payment ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="term_months" className="block text-sm font-medium text-foreground">
                  Laufzeit (Monate)
                </label>
                <input
                  id="term_months"
                  name="term_months"
                  type="number"
                  min={1}
                  defaultValue={vehicle.term_months ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="final_payment" className="block text-sm font-medium text-foreground">
                  Schlussrate
                </label>
                <input
                  id="final_payment"
                  name="final_payment"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={vehicle.final_payment ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="contract_start_date" className="block text-sm font-medium text-foreground">
                  Vertragsstart
                </label>
                <input
                  id="contract_start_date"
                  name="contract_start_date"
                  type="date"
                  defaultValue={vehicle.contract_start_date ?? ""}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sonderausstattung und Besonderheiten */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
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
              value={equipmentFreeText}
              onChange={(event) => setEquipmentFreeText(event.target.value)}
              placeholder="z. B. Sportauspuff, Tieferlegung, Sonderfarbe ..."
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert..." : "Fahrzeugdaten speichern"}
      </button>
    </form>
  );
}
