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
  vin: string | null;
  make: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  vehicle_type: string | null;
  body_style: string | null;
  variant: string | null;
  engine_description: string | null;
  transmission: string | null;
  drive_type: string | null;
  doors: number | null;
  engine_power_kw: number | null;
  engine_displacement_cc: number | null;
  special_equipment: string | null;
  catalog_source: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  license_plate: string;
  current_mileage: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface VehicleInsert {
  vin?: string | null;
  make: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  vehicle_type?: string | null;
  body_style?: string | null;
  variant?: string | null;
  engine_description?: string | null;
  transmission?: string | null;
  drive_type?: string | null;
  doors?: number | null;
  engine_power_kw?: number | null;
  engine_displacement_cc?: number | null;
  special_equipment?: string | null;
  catalog_source?: string | null;
  purchase_price?: number | null;
  purchase_date?: string | null;
  license_plate: string;
  current_mileage: number;
  image_url?: string | null;
}

interface VehicleComment {
  id: string;
  vehicle_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface VehicleCommentInsert {
  vehicle_id: string;
  body: string;
}

interface VehicleImage {
  id: string;
  vehicle_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  caption: string | null;
  is_primary: boolean;
  created_at: string;
}

interface VehicleImageInsert {
  vehicle_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  caption?: string | null;
  is_primary?: boolean;
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
  reminder_id: string | null;
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
  reminder_id?: string | null;
  category: CostCategory;
  title: string;
  amount: number;
  date: string;
  mileage?: number | null;
  liters?: number | null;
  price_per_liter?: number | null;
  notes?: string | null;
}

interface CostComment {
  id: string;
  cost_entry_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface CostCommentInsert {
  cost_entry_id: string;
  body: string;
}

interface CostInvoice {
  id: string;
  cost_entry_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  invoice_number: string | null;
  invoice_date: string | null;
  note: string | null;
  created_at: string;
}

interface CostInvoiceInsert {
  cost_entry_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  invoice_number?: string | null;
  invoice_date?: string | null;
  note?: string | null;
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
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ReminderInsert {
  vehicle_id: string;
  title: string;
  reminder_type: ReminderType;
  due_date?: string | null;
  due_mileage?: number | null;
  notes?: string | null;
  completed_at?: string | null;
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
  VehicleComment,
  VehicleCommentInsert,
  VehicleImage,
  VehicleImageInsert,
  CostCategory,
  CostEntry,
  CostEntryInsert,
  CostComment,
  CostCommentInsert,
  CostInvoice,
  CostInvoiceInsert,
  ReminderType,
  Reminder,
  ReminderInsert,
  MonthlyCostSummary,
  VehicleStats,
};


