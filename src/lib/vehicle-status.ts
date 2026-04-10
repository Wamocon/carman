import type { VehicleStatus } from "@/types/domain";

export const VEHICLE_STATUS = {
  owned: "owned",
  sold: "sold",
} as const satisfies Record<VehicleStatus, VehicleStatus>;

export const DEFAULT_VEHICLE_STATUS = VEHICLE_STATUS.owned;
export const DEFAULT_VEHICLE_STATUS_FILTER = "owned" as const;

export type VehicleStatusFilter = "owned" | "sold" | "all";

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  owned: "In Besitz",
  sold: "Verkauft",
};

export function isVehicleStatus(value: string | undefined): value is VehicleStatus {
  return value === VEHICLE_STATUS.owned || value === VEHICLE_STATUS.sold;
}

export function parseVehicleStatusFilter(value: string | undefined): VehicleStatusFilter {
  if (value === "all" || value === VEHICLE_STATUS.sold) {
    return value;
  }

  return DEFAULT_VEHICLE_STATUS_FILTER;
}
