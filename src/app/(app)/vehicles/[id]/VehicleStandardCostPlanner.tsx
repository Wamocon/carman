"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVehicleStandardCostsForPeriods } from "./actions";
import type { FuelType } from "@/types/domain";

export function VehicleStandardCostPlanner({
  vehicleId,
  fuelType,
}: {
  vehicleId: string;
  fuelType: FuelType;
}) {
  const [consumptionPer100Km, setConsumptionPer100Km] = useState("");
  const [distancePerMonthKm, setDistancePerMonthKm] = useState("");
  const [energyPricePerUnit, setEnergyPricePerUnit] = useState("");
  const [baseDate, setBaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unit = fuelType === "electric" ? "kWh" : "L";

  const toNumber = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
  };

  const consumption = toNumber(consumptionPer100Km);
  const distance = toNumber(distancePerMonthKm);
  const energyPrice = toNumber(energyPricePerUnit);

  const hasValidInputs = consumption !== null && consumption > 0 && distance !== null && energyPrice !== null;

  const calculations = useMemo(() => {
    if (!hasValidInputs || consumption === null || distance === null || energyPrice === null) {
      return {
        costPer100Km: 0,
        month: 0,
        quarter: 0,
        year: 0,
      };
    }

    const month = (distance / 100) * consumption * energyPrice;
    return {
      costPer100Km: consumption * energyPrice,
      month,
      quarter: month * 3,
      year: month * 12,
    };
  }, [consumption, distance, energyPrice, hasValidInputs]);

  const handleCreateEntries = () => {
    setResultMessage(null);
    setErrorMessage(null);

    if (!hasValidInputs) {
      setErrorMessage("Bitte gueltige Standardwerte eingeben.");
      return;
    }

    const formData = new FormData();
    formData.append("vehicle_id", vehicleId);
    formData.append("date", baseDate);
    formData.append("consumption_per_100km", String(consumption));
    formData.append("distance_per_month_km", String(distance));
    formData.append("energy_price_per_unit", String(energyPrice));
    formData.append("period", period);

    startTransition(async () => {
      const result = await createVehicleStandardCostsForPeriods(formData);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      setResultMessage(result.message ?? "Standardkosten wurden gespeichert.");
      router.refresh();
    });
  };

  return (
    <section className="section-shell space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Intelligenter Standard-Kostenrechner</h2>
        <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-strong">
          Gut zu wissen
        </span>
      </div>

      <p className="text-sm text-muted">
        Der Rechner zeigt typische Kosten auf Basis deines Fahrprofils und kann diese direkt als Einträge für ausgewählte Zeiträume anlegen.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="standard_consumption" className="block text-sm font-medium text-foreground">
            Standard-Verbrauch ({unit}/100 km)
          </label>
          <input
            id="standard_consumption"
            type="number"
            min={0}
            max={999.999}
            step="0.01"
            value={consumptionPer100Km}
            onChange={(event) => setConsumptionPer100Km(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="standard_distance" className="block text-sm font-medium text-foreground">
            Standard-Strecke (km/Monat)
          </label>
          <input
            id="standard_distance"
            type="number"
            min={0}
            max={1000000}
            step="1"
            value={distancePerMonthKm}
            onChange={(event) => setDistancePerMonthKm(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="standard_energy_price" className="block text-sm font-medium text-foreground">
            Standard-Energiepreis (EUR/{unit})
          </label>
          <input
            id="standard_energy_price"
            type="number"
            min={0}
            max={999.999}
            step="0.001"
            value={energyPricePerUnit}
            onChange={(event) => setEnergyPricePerUnit(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card/70 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Kosten pro 100 km</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{calculations.costPer100Km.toFixed(2)} EUR</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/70 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Monat / Quartal</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{calculations.month.toFixed(2)} / {calculations.quarter.toFixed(2)} EUR</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/70 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Jahr</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{calculations.year.toFixed(2)} EUR</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label htmlFor="standard_base_date" className="block text-sm font-medium text-foreground">
            Buchungsdatum für die übernahme
          </label>
          <input
            id="standard_base_date"
            type="date"
            value={baseDate}
            onChange={(event) => setBaseDate(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="period"
              checked={period === "month"}
              onChange={() => setPeriod("month")}
            />
            Monat
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="period"
              checked={period === "quarter"}
              onChange={() => setPeriod("quarter")}
            />
            Quartal
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="period"
              checked={period === "year"}
              onChange={() => setPeriod("year")}
            />
            Jahr
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCreateEntries}
          disabled={!hasValidInputs || isPending}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Werte werden übernommen..." : "Standardkosten für Zeiträume setzen"}
        </button>
      </div>

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
      {resultMessage && <p className="text-sm text-success">{resultMessage}</p>}
    </section>
  );
}
