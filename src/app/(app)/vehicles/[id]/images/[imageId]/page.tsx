import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/Icons";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Vehicle, VehicleImage } from "@/types/domain";
import { FocalPointEditor } from "../../FocalPointEditor";
import { OwnerImageMetaForm } from "./OwnerImageMetaForm";

export async function generateMetadata(props: {
  params: Promise<{ id: string; imageId: string }>;
}) {
  const { id, imageId } = await props.params;
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("make, model")
    .eq("id", id)
    .single();

  const { data: image } = await supabase
    .from("vehicle_images")
    .select("caption, file_name")
    .eq("id", imageId)
    .single();

  const title = image?.caption ?? image?.file_name ?? "Bild";
  const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : "Fahrzeug";

  return {
    title: `${title} — ${vehicleName} — CarMan`,
  };
}

export default async function OwnerImageDetailPage(props: {
  params: Promise<{ id: string; imageId: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const { id: vehicleId, imageId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, user_id")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (!vehicle) {
    redirect(`/vehicles/${vehicleId}?tab=media`);
  }

  const v = vehicle as Pick<Vehicle, "id" | "make" | "model" | "user_id">;

  const { data: imageData, error: imageError } = await supabase
    .from("vehicle_images")
    .select("*")
    .eq("id", imageId)
    .eq("vehicle_id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (imageError || !imageData) {
    redirect(`/vehicles/${vehicleId}?tab=media`);
  }

  const image = imageData as VehicleImage;

  const { data: signedUrlData } = await supabase.storage
    .from("vehicle-images")
    .createSignedUrl(image.storage_path, 60 * 30);

  const signedUrl = signedUrlData?.signedUrl ?? null;

  if (!signedUrl) {
    redirect(`/vehicles/${vehicleId}?tab=media`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/vehicles/${vehicleId}?tab=media`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Zurück zu Medien
      </Link>

      <section className="section-shell overflow-hidden p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {v.make} {v.model} — Bilddetail
          </p>
          <h1 className="heading-display mt-2 text-2xl font-semibold text-foreground">
            {image.caption ?? image.file_name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Hochgeladen am {formatDate(image.created_at.slice(0, 10), locale)} · {(image.file_size_bytes / 1024).toFixed(0)} KB
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {image.is_primary ? (
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                Hauptbild
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                image.is_public ? "bg-success/15 text-success" : "bg-foreground/8 text-muted"
              }`}
            >
              {image.is_public ? "Öffentlich" : "Privat"}
            </span>
          </div>
        </div>

        {/* Full-resolution image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signedUrl}
          alt={image.caption ?? image.file_name}
          className="w-full rounded-xl"
        />
      </section>

      {/* Meta form: Caption, Description, Public toggle */}
      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Bilddetails bearbeiten</h2>
        <OwnerImageMetaForm
          imageId={image.id}
          currentCaption={image.caption}
          currentDescription={image.description}
          isPublic={image.is_public}
        />
      </section>

      {/* Focal point editor with live previews */}
      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Bildausrichtung</h2>
        <FocalPointEditor
          imageId={image.id}
          signedUrl={signedUrl}
          initialX={image.focal_point_x}
          initialY={image.focal_point_y}
        />
      </section>
    </div>
  );
}
