"use server";

import { revalidatePath } from "next/cache";
import { parseDriverProfileFromFormData } from "@/lib/driver-profile";
import { createClient } from "@/lib/supabase/server";
import type { BillingInterval } from "@/lib/subscription";

export async function updateProfile(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const displayName = (formData.get("display_name") as string)?.trim();
  const { fields: driverProfile, error: driverProfileError } = parseDriverProfileFromFormData(formData);

  if (driverProfileError) {
    return { error: driverProfileError, success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      driver_first_name: driverProfile.driver_first_name,
      driver_last_name: driverProfile.driver_last_name,
      driver_birth_date: driverProfile.driver_birth_date,
      driver_license_country: driverProfile.driver_license_country,
      driver_license_issue_date: driverProfile.driver_license_issue_date,
      driver_license_class: driverProfile.driver_license_class,
      driver_profile_completed: driverProfile.driver_profile_completed,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut.", success: false };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}

export async function requestUpgrade(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const billingInterval = (formData.get("billing_interval") as string) || "month";
  if (billingInterval !== "month" && billingInterval !== "year") {
    return { error: "Ungültiger Tarif.", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier === "pro") {
    return { error: "Du nutzt bereits CarMan Pro.", success: false };
  }

  const { error } = await supabase.from("upgrade_requests").insert({
    user_id: user.id,
    billing_interval: billingInterval as BillingInterval,
    status: "pending",
  });

  if (error) {
    return { error: "Fehler beim Senden der Anfrage. Bitte versuche es erneut.", success: false };
  }

  revalidatePath("/settings");
  return { error: null, success: true };
}

