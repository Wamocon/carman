import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, PhotoIcon } from "@/components/Icons";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { localizeCatalogText } from "@/lib/vehicle-catalog";
import { convertKwToPs, STANDARD_EQUIPMENT } from "@/lib/vehicle-market";
import type { Vehicle, VehicleImage, PublicComment, PublicCommentReaction, ImageReaction } from "@/types/domain";
import { PublicCommentForm, PublicCommentItem } from "../PublicCommentSection";
import { GalleryImageCard } from "./GalleryImageCard";

const STANDARD_EQUIPMENT_ITEMS = new Set(
  STANDARD_EQUIPMENT.flatMap((category) => category.items),
);

function parseSpecialEquipment(value: string | null): {
  categorized: Array<{ category: string; items: string[] }>;
  customItems: string[];
} {
  const entries = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const categorized = STANDARD_EQUIPMENT.map((category) => ({
    category: category.category,
    items: category.items.filter((item) => entries.includes(item)),
  })).filter((category) => category.items.length > 0);

  const customItems = entries.filter((entry) => !STANDARD_EQUIPMENT_ITEMS.has(entry));

  return { categorized, customItems };
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("make, model, is_published")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  return {
    title: vehicle
      ? `${vehicle.make} ${vehicle.model} — CarMan Galerie`
      : "Fahrzeug — CarMan Galerie",
  };
}

export default async function GalleryVehicleDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("sharing_enabled")
    .eq("id", user.id)
    .single();

  if (!profile?.sharing_enabled) {
    redirect("/gallery");
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (vehicleError || !vehicle) {
    redirect("/gallery");
  }

  const v = vehicle as Vehicle;
  const isOwner = v.user_id === user.id;

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", v.user_id)
    .single();

  const ownerName = ownerProfile?.display_name ?? "Anonym";

  const [
    { data: publicImages },
    { data: comments },
    { data: commentReactions },
    { data: imageReactions },
  ] = await Promise.all([
    v.share_images
      ? supabase
          .from("vehicle_images")
          .select("*")
          .eq("vehicle_id", id)
          .eq("is_public", true)
          .order("created_at", { ascending: false })
      : { data: [] },
    supabase
      .from("public_comments")
      .select("*")
      .eq("vehicle_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("public_comment_reactions")
      .select("*"),
    supabase
      .from("image_reactions")
      .select("*"),
  ]);

  const vehicleImages = (publicImages ?? []) as VehicleImage[];
  const vehicleComments = (comments ?? []) as PublicComment[];
  const allCommentReactions = (commentReactions ?? []) as PublicCommentReaction[];
  const allImageReactions = (imageReactions ?? []) as ImageReaction[];

  const commentIds = vehicleComments.map((c) => c.id);
  const filteredCommentReactions = allCommentReactions.filter((r) =>
    commentIds.includes(r.comment_id),
  );

  const imageIds = vehicleImages.map((img) => img.id);
  const filteredImageReactions = allImageReactions.filter((r) =>
    imageIds.includes(r.image_id),
  );

  const commentAuthorIds = [...new Set(vehicleComments.map((c) => c.user_id))];
  const { data: authorProfiles } = commentAuthorIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", commentAuthorIds)
    : { data: [] };

  const authorMap = Object.fromEntries(
    (authorProfiles ?? []).map((p) => [p.id, p.display_name ?? "Anonym"]),
  );

  const imageLinks = await Promise.all(
    vehicleImages.map(async (image) => {
      const { data } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(image.storage_path, 60 * 30);
      return { image, signedUrl: data?.signedUrl ?? null };
    }),
  );

  const primaryImage = imageLinks.find((e) => e.image.is_primary) ?? imageLinks[0] ?? null;

  const fuelLabels: Record<string, string> = {
    petrol: locale === "de" ? "Benzin" : "Petrol",
    diesel: locale === "de" ? "Diesel" : "Diesel",
    electric: locale === "de" ? "Elektro" : "Electric",
    hybrid: locale === "de" ? "Hybrid" : "Hybrid",
    lpg: "LPG",
    cng: "CNG",
  };

  return (
    <div className="space-y-6">
      <section className="section-shell overflow-hidden p-5 sm:p-6">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Galerie
        </Link>

        <div className="mt-4 grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60">
            {primaryImage?.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.signedUrl}
                alt={primaryImage.image.caption ?? `${v.make} ${v.model}`}
                className="h-64 w-full object-contain bg-foreground/5 p-2"
              />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 bg-foreground/5 text-muted">
                <PhotoIcon className="h-10 w-10" />
              </div>
            )}
          </div>

          <div>
            {v.share_header ? (
              <>
                <h1 className="heading-display text-3xl font-semibold text-foreground">
                  {v.make} {v.model}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  {v.year} · {localizeCatalogText(v.variant, locale) || fuelLabels[v.fuel_type] || v.fuel_type}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {v.current_mileage.toLocaleString(locale === "de" ? "de-DE" : "en-US")} km
                </p>
              </>
            ) : (
              <h1 className="heading-display text-3xl font-semibold text-foreground">
                Fahrzeug
              </h1>
            )}
            <p className="mt-3 text-xs text-muted">
              von {ownerName}
            </p>
          </div>
        </div>
      </section>

      {v.share_details ? (
        <section className="section-shell space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Fahrzeugdetails</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {v.vehicle_type ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Fahrzeugtyp</p>
                <p className="mt-1 text-foreground">{localizeCatalogText(v.vehicle_type, locale)}</p>
              </div>
            ) : null}
            {v.body_style ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Karosserie</p>
                <p className="mt-1 text-foreground">{localizeCatalogText(v.body_style, locale)}</p>
              </div>
            ) : null}
            {v.engine_description ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Motorisierung</p>
                <p className="mt-1 text-foreground">{localizeCatalogText(v.engine_description, locale)}</p>
              </div>
            ) : null}
            {v.engine_power_kw ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Leistung</p>
                <p className="mt-1 text-foreground">
                  {v.engine_power_kw} kW · {v.engine_power_ps ?? convertKwToPs(v.engine_power_kw)} PS
                </p>
              </div>
            ) : null}
            {v.transmission ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Getriebe</p>
                <p className="mt-1 text-foreground">{localizeCatalogText(v.transmission, locale)}</p>
              </div>
            ) : null}
            {v.drive_type ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Antrieb</p>
                <p className="mt-1 text-foreground">{localizeCatalogText(v.drive_type, locale)}</p>
              </div>
            ) : null}
            {v.doors ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Türen</p>
                <p className="mt-1 text-foreground">{v.doors}</p>
              </div>
            ) : null}
            {v.engine_displacement_cc ? (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Hubraum</p>
                <p className="mt-1 text-foreground">
                  {v.engine_displacement_cc.toLocaleString("de-DE")} ccm
                </p>
              </div>
            ) : null}
          </div>

          {(() => {
            const eq = parseSpecialEquipment(v.special_equipment);
            if (eq.categorized.length === 0 && eq.customItems.length === 0) return null;
            return (
              <div className="space-y-3 rounded-xl border border-border/70 p-3 text-sm">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">
                  Sonderausstattung
                </p>
                {eq.categorized.map((group) => (
                  <div key={group.category}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {group.category}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-brand/25 bg-brand/8 px-2.5 py-1 text-xs font-medium text-brand"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {eq.customItems.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Weitere Angaben
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {eq.customItems.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </section>
      ) : null}

      {v.share_images && imageLinks.length > 0 ? (
        <section className="section-shell space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Bilder</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {imageLinks.map(({ image, signedUrl }) => {
              const imgReactions = filteredImageReactions.filter(
                (r) => r.image_id === image.id,
              );
              return (
                <GalleryImageCard
                  key={image.id}
                  image={image}
                  signedUrl={signedUrl}
                  vehicleId={v.id}
                  currentUserId={user.id}
                  reactions={imgReactions}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Kommentare</h2>
        <PublicCommentForm vehicleId={v.id} />
        {vehicleComments.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Kommentare.</p>
        ) : (
          <ul className="space-y-2">
            {vehicleComments.map((comment) => {
              const commentSpecificReactions = filteredCommentReactions.filter(
                (r) => r.comment_id === comment.id,
              );
              return (
                <PublicCommentItem
                  key={comment.id}
                  comment={{
                    ...comment,
                    author_display_name: authorMap[comment.user_id] ?? "Anonym",
                  }}
                  vehicleId={v.id}
                  isOwner={isOwner}
                  isAuthor={comment.user_id === user.id}
                  currentUserId={user.id}
                  reactions={commentSpecificReactions}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
