"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const displayName = (formData.get("display_name") as string)?.trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut.", success: false };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}
