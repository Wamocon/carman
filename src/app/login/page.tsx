import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Anmelden — Smart Car Manager",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;

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
          <h1 className="text-2xl font-bold text-foreground">Anmelden</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Melde dich bei Smart Car Manager an
          </p>
        </div>

        <LoginForm error={searchParams.error} />

        <p className="text-center text-sm text-foreground/60">
          Noch kein Konto?{" "}
          <a href="/register" className="font-medium text-blue-600 hover:underline">
            Registrieren
          </a>
        </p>
      </div>
    </main>
  );
}
