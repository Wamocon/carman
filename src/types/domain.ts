// ---------------------------------------------------------------------------
// CarMan — Domain Types (V1)
// ---------------------------------------------------------------------------

// ---- User & Subscription --------------------------------------------------

type SubscriptionTier = "free" | "pro";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

// ---- Vehicle --------------------------------------------------------------

type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "lpg" | "cng";

interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  license_plate: string;
  current_mileage: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface VehicleInsert {
  make: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  license_plate: string;
  current_mileage: number;
  image_url?: string | null;
}

// ---- Cost Entry (fuel, repair, other) -------------------------------------

type CostCategory =
  | "fuel"
  | "maintenance"
  | "repair"
  | "insurance"
  | "tax"
  | "leasing"
  | "parking"
  | "other";

interface CostEntry {
  id: string;
  vehicle_id: string;
  user_id: string;
  category: CostCategory;
  title: string;
  amount: number;
  date: string;
  mileage: number | null;
  // fuel-specific
  liters: number | null;
  price_per_liter: number | null;
  // general
  notes: string | null;
  created_at: string;
}

interface CostEntryInsert {
  vehicle_id: string;
  category: CostCategory;
  title: string;
  amount: number;
  date: string;
  mileage?: number | null;
  liters?: number | null;
  price_per_liter?: number | null;
  notes?: string | null;
}

// ---- Reminder -------------------------------------------------------------

type ReminderType = "date" | "mileage" | "both";

interface Reminder {
  id: string;
  vehicle_id: string;
  user_id: string;
  title: string;
  reminder_type: ReminderType;
  due_date: string | null;
  due_mileage: number | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
}

interface ReminderInsert {
  vehicle_id: string;
  title: string;
  reminder_type: ReminderType;
  due_date?: string | null;
  due_mileage?: number | null;
  notes?: string | null;
}

// ---- Dashboard aggregates -------------------------------------------------

interface MonthlyCostSummary {
  month: string; // YYYY-MM
  total: number;
  fuel: number;
  maintenance: number;
  repair: number;
  fixed: number; // insurance + tax + leasing
  other: number;
}

interface VehicleStats {
  total_costs: number;
  avg_consumption: number | null; // L/100km
  total_distance: number | null;
  upcoming_reminders: number;
}

// ---- Exports ---------------------------------------------------------------

export type {
  SubscriptionTier,
  UserProfile,
  FuelType,
  Vehicle,
  VehicleInsert,
  CostCategory,
  CostEntry,
  CostEntryInsert,
  ReminderType,
  Reminder,
  ReminderInsert,
  MonthlyCostSummary,
  VehicleStats,
};
