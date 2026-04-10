import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/Icons";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/types/domain";
import { VehicleEditForm } from "../VehicleEditForm";

export const metadata = {
  title: "Fahrzeugdaten bearbeiten — CarMan",
};

export default async function VehicleEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !vehicle) {
    redirect("/vehicles");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <Link
          href={`/vehicles/${id}?tab=details`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Zurück zu den Fahrzeugdetails
        </Link>
        <h1 className="heading-display mt-3 text-3xl font-semibold text-foreground">
          Fahrzeugdaten bearbeiten
        </h1>
      </section>

      <section className="section-shell p-5 sm:p-6">
        <VehicleEditForm vehicle={vehicle as Vehicle} />
      </section>
    </div>
  );
}
