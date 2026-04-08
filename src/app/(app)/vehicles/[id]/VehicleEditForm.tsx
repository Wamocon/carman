"use client";

import { useActionState } from "react";
import type { Vehicle } from "@/types/domain";
import { updateVehicleProfile } from "./actions";

export function VehicleEditForm({ vehicle }: { vehicle: Vehicle }) {
  const [state, formAction, pending] = useActionState(updateVehicleProfile, {
    error: null as string | null,
    success: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="vehicle_id" value={vehicle.id} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-foreground">Marke</label>
          <input id="make" name="make" required defaultValue={vehicle.make} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-foreground">Modell</label>
          <input id="model" name="model" required defaultValue={vehicle.model} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-foreground">Baujahr</label>
          <input id="year" name="year" type="number" min={1900} max={new Date().getFullYear() + 1} required defaultValue={vehicle.year} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="fuel_type" className="block text-sm font-medium text-foreground">Kraftstoff</label>
          <select id="fuel_type" name="fuel_type" required defaultValue={vehicle.fuel_type} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground">
            <option value="petrol">Benzin</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elektro</option>
            <option value="hybrid">Hybrid</option>
            <option value="lpg">LPG</option>
            <option value="cng">CNG</option>
          </select>
        </div>
        <div>
          <label htmlFor="license_plate" className="block text-sm font-medium text-foreground">Kennzeichen</label>
          <input id="license_plate" name="license_plate" required defaultValue={vehicle.license_plate} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="current_mileage" className="block text-sm font-medium text-foreground">Kilometerstand</label>
          <input id="current_mileage" name="current_mileage" type="number" min={0} max={9999999} required defaultValue={vehicle.current_mileage} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-foreground">VIN</label>
          <input id="vin" name="vin" defaultValue={vehicle.vin ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="vehicle_type" className="block text-sm font-medium text-foreground">Fahrzeugtyp</label>
          <input id="vehicle_type" name="vehicle_type" defaultValue={vehicle.vehicle_type ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="body_style" className="block text-sm font-medium text-foreground">Karosserie</label>
          <input id="body_style" name="body_style" defaultValue={vehicle.body_style ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="variant" className="block text-sm font-medium text-foreground">Variante</label>
          <input id="variant" name="variant" defaultValue={vehicle.variant ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-foreground">Getriebe</label>
          <input id="transmission" name="transmission" defaultValue={vehicle.transmission ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="drive_type" className="block text-sm font-medium text-foreground">Antrieb</label>
          <input id="drive_type" name="drive_type" defaultValue={vehicle.drive_type ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="doors" className="block text-sm font-medium text-foreground">Tueren</label>
          <input id="doors" name="doors" type="number" min={1} max={9} defaultValue={vehicle.doors ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="engine_power_kw" className="block text-sm font-medium text-foreground">Leistung kW</label>
          <input id="engine_power_kw" name="engine_power_kw" type="number" min={0} max={2000} defaultValue={vehicle.engine_power_kw ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="engine_displacement_cc" className="block text-sm font-medium text-foreground">Hubraum ccm</label>
          <input id="engine_displacement_cc" name="engine_displacement_cc" type="number" min={0} max={20000} defaultValue={vehicle.engine_displacement_cc ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="purchase_price" className="block text-sm font-medium text-foreground">Kaufpreis</label>
          <input id="purchase_price" name="purchase_price" type="number" min={0} step="0.01" defaultValue={vehicle.purchase_price ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label htmlFor="purchase_date" className="block text-sm font-medium text-foreground">Kaufdatum</label>
          <input id="purchase_date" name="purchase_date" type="date" defaultValue={vehicle.purchase_date ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
        </div>
      </div>

      <div>
        <label htmlFor="engine_description" className="block text-sm font-medium text-foreground">Motorisierung</label>
        <input id="engine_description" name="engine_description" defaultValue={vehicle.engine_description ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
      </div>

      <div>
        <label htmlFor="special_equipment" className="block text-sm font-medium text-foreground">Sonderausstattung</label>
        <textarea id="special_equipment" name="special_equipment" rows={3} defaultValue={vehicle.special_equipment ?? ""} className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground" />
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <button type="submit" disabled={pending} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50">
        {pending ? "Wird gespeichert..." : "Fahrzeugdaten speichern"}
      </button>
    </form>
  );
}
