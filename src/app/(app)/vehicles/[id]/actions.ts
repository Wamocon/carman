"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Fehler beim Löschen. Bitte versuche es erneut." };
  }

  return { error: null };
}
