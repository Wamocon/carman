"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleReminder(reminderId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("reminders")
    .update({ is_completed: isCompleted })
    .eq("id", reminderId)
    .eq("user_id", user.id);

  revalidatePath("/reminders");
}
