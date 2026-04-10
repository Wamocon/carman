// ---------------------------------------------------------------------------
// CarMan — Domain Types (V1)
// ---------------------------------------------------------------------------

// ---- User & Subscription --------------------------------------------------

type SubscriptionTier = "free" | "pro";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  driver_first_name: string | null;
  driver_last_name: string | null;
  driver_birth_date: string | null;
  driver_license_country: string | null;
  driver_license_issue_date: string | null;
  driver_license_class: string | null;
  driver_profile_completed: boolean;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

// ---- Vehicle --------------------------------------------------------------

type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "lpg" | "cng";
type AcquisitionType = "purchase" | "finance" | "lease";
type VehicleStatus = "owned" | "sold";
type AcquisitionSubtype =
  | "cash"
  | "dealer"
  | "classic_loan"
  | "balloon"
  | "three_way"
  | "kilometerleasing"
  | "restwertleasing";

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
  engine_power_ps: number | null;
  engine_displacement_cc: number | null;
  special_equipment: string | null;
  catalog_source: string | null;
  acquisition_type: AcquisitionType;
  acquisition_subtype: AcquisitionSubtype | null;
  down_payment: number | null;
  monthly_payment: number | null;
  term_months: number | null;
  final_payment: number | null;
  contract_start_date: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  status: VehicleStatus;
  sold_at: string | null;
  sale_cost_entry_id: string | null;
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
  engine_power_ps?: number | null;
  engine_displacement_cc?: number | null;
  special_equipment?: string | null;
  catalog_source?: string | null;
  acquisition_type?: AcquisitionType;
  acquisition_subtype?: AcquisitionSubtype | null;
  down_payment?: number | null;
  monthly_payment?: number | null;
  term_months?: number | null;
  final_payment?: number | null;
  contract_start_date?: string | null;
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
  is_vehicle_sale: boolean;
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

// ---- Upgrade Request -------------------------------------------------------

type UpgradeRequestStatus = "pending" | "approved" | "rejected";

interface UpgradeRequest {
  id: string;
  user_id: string;
  billing_interval: "month" | "year";
  status: UpgradeRequestStatus;
  created_at: string;
  resolved_at: string | null;
}

// ---- Exports ---------------------------------------------------------------

export type {
  SubscriptionTier,
  UserProfile,
  UpgradeRequestStatus,
  UpgradeRequest,
  FuelType,
  AcquisitionType,
  VehicleStatus,
  AcquisitionSubtype,
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


