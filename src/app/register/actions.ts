"use server";

import { createClient } from "@/lib/supabase/server";

export async function register(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;

  if (!email || !password || !displayName) {
    return { error: "Bitte alle Felder ausfällen.", success: false };
  }

  if (password.length < 6) {
    return { error: "Das Passwort muss mindestens 6 Zeichen lang sein.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: "Registrierung fehlgeschlagen. Bitte versuche es erneut.", success: false };
  }

  return { error: null, success: true };
}


