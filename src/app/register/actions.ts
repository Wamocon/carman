"use server";

import { parseDriverProfileFromFormData } from "@/lib/driver-profile";
import { createClient } from "@/lib/supabase/server";

export async function register(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = ((formData.get("password") as string) ?? "").trim();
  const displayName = ((formData.get("display_name") as string) ?? "").trim();

  if (!email || !password || !displayName) {
    return { error: "Bitte alle Pflichtfelder ausfüllen.", success: false };
  }

  if (password.length < 6) {
    return { error: "Das Passwort muss mindestens 6 Zeichen lang sein.", success: false };
  }

  const { fields: driverProfile, error: driverProfileError } = parseDriverProfileFromFormData(formData);
  if (driverProfileError) {
    return { error: driverProfileError, success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        driver_first_name: driverProfile.driver_first_name,
        driver_last_name: driverProfile.driver_last_name,
        driver_birth_date: driverProfile.driver_birth_date,
        driver_license_country: driverProfile.driver_license_country,
        driver_license_issue_date: driverProfile.driver_license_issue_date,
        driver_license_class: driverProfile.driver_license_class,
      },
    },
  });

  if (error) {
    return { error: "Registrierung fehlgeschlagen. Bitte versuche es erneut.", success: false };
  }

  return { error: null, success: true };
}


