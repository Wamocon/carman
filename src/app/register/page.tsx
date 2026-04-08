import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Registrieren — Smart Car Manager",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Registrieren</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Erstelle ein neues Konto
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-foreground/60">
          Schon ein Konto?{" "}
          <a href="/login" className="font-medium text-blue-600 hover:underline">
            Anmelden
          </a>
        </p>
      </div>
    </main>
  );
}
