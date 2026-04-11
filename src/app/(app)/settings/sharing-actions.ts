"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSharingEnabled(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ sharing_enabled: enabled })
    .eq("id", user.id);

  if (error) {
    return { error: "Einstellung konnte nicht gespeichert werden." };
  }

  revalidatePath("/settings");
  revalidatePath("/gallery");
  return { error: null };
}
