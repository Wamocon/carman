import Link from "next/link";
import { PhotoIcon } from "@/components/Icons";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n";
import { localizeCatalogText } from "@/lib/vehicle-catalog";
import type { Vehicle, VehicleImage } from "@/types/domain";
import { GallerySortSelect } from "./GallerySortSelect";

export const metadata = {
  title: "Galerie — CarMan",
};

type GallerySort = "newest" | "rating";

export default async function GalleryPage(props: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const t = getDictionary(locale);
  const g = t.gallery;
  const searchParams = await props.searchParams;
  const sort: GallerySort = searchParams.sort === "rating" ? "rating" : "newest";
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

  const sharingEnabled = profile?.sharing_enabled ?? false;

  if (!sharingEnabled) {
    return (
      <div className="space-y-6 stagger-children">
        <section className="section-shell p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{g.eyebrow}</p>
          <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">{g.title}</h1>
          <p className="mt-2 max-w-2xl text-sm help-copy">{g.sharingDisabled}</p>
          <Link
            href="/settings"
            className="mt-4 inline-block rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            {g.enableSharing}
          </Link>
        </section>
      </div>
    );
  }

  const { data: publishedVehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  const vehicles = (publishedVehicles ?? []) as Vehicle[];

  const vehicleIds = vehicles.map((v) => v.id);
  const { data: primaryImages } = vehicleIds.length > 0
    ? await supabase
        .from("vehicle_images")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .eq("is_primary", true)
        .eq("is_public", true)
    : { data: [] };

  const imageRecords = (primaryImages ?? []) as VehicleImage[];

  const signedPrimaryImages = await Promise.all(
    imageRecords.map(async (image) => {
      const { data } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(image.storage_path, 60 * 30);
      return [image.vehicle_id, { url: data?.signedUrl ?? null, focalX: image.focal_point_x, focalY: image.focal_point_y }] as const;
    }),
  );

  const primaryImageMap = Object.fromEntries(signedPrimaryImages);

  const { data: ownerProfiles } = vehicleIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", vehicles.map((v) => v.user_id))
    : { data: [] };

  const ownerMap = Object.fromEntries(
    (ownerProfiles ?? []).map((p) => [p.id, p.display_name ?? "Anonym"]),
  );

  const fuelLabel: Record<string, string> = {
    petrol: locale === "de" ? "Benzin" : "Petrol",
    diesel: locale === "de" ? "Diesel" : "Diesel",
    electric: locale === "de" ? "Elektro" : "Electric",
    hybrid: locale === "de" ? "Hybrid" : "Hybrid",
    lpg: "LPG",
    cng: "CNG",
  };

  // Fetch all image reactions for published vehicles to compute average ratings
  const { data: allPublicImages } = vehicleIds.length > 0
    ? await supabase
        .from("vehicle_images")
        .select("id, vehicle_id")
        .in("vehicle_id", vehicleIds)
        .eq("is_public", true)
    : { data: [] };

  const publicImageIds = (allPublicImages ?? []).map((img) => img.id);
  const { data: imgReactions } = publicImageIds.length > 0
    ? await supabase
        .from("image_reactions")
        .select("image_id, heat_level")
        .in("image_id", publicImageIds)
    : { data: [] };

  const imageToVehicle: Record<string, string> = {};
  for (const img of allPublicImages ?? []) {
    imageToVehicle[img.id] = img.vehicle_id;
  }

  const vehicleRatingMap: Record<string, { sum: number; count: number }> = {};
  for (const r of (imgReactions ?? []) as Array<{ image_id: string; heat_level: number }>) {
    const vid = imageToVehicle[r.image_id];
    if (!vid) continue;
    if (!vehicleRatingMap[vid]) vehicleRatingMap[vid] = { sum: 0, count: 0 };
    vehicleRatingMap[vid].sum += r.heat_level;
    vehicleRatingMap[vid].count += 1;
  }

  const vehicleAvgRating = (vid: string): number => {
    const entry = vehicleRatingMap[vid];
    return entry && entry.count > 0 ? entry.sum / entry.count : 0;
  };

  const sortedVehicles = sort === "rating"
    ? [...vehicles].sort((a, b) => vehicleAvgRating(b.id) - vehicleAvgRating(a.id))
    : vehicles;

  return (
    <div className="space-y-6 stagger-children">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{g.eyebrow}</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">{g.title}</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">{g.copy}</p>
          </div>
          <GallerySortSelect currentSort={sort} locale={locale} />
        </div>
      </section>

      {sortedVehicles.length === 0 ? (
        <div className="section-shell border-dashed p-8 text-center">
          <p className="text-muted">{g.noVehicles}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedVehicles.map((v) => {
            const primaryImageEntry = primaryImageMap[v.id] ?? undefined;
            const primaryImageUrl = primaryImageEntry?.url;
            const ownerName = ownerMap[v.user_id] ?? "Anonym";
            const isOwn = v.user_id === user.id;
            const avgRating = vehicleAvgRating(v.id);
            const ratingInfo = vehicleRatingMap[v.id];

            return (
              <article key={v.id} className="surface relative overflow-hidden rounded-2xl">
                <Link
                  href={`/gallery/${v.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`${v.make} ${v.model} – Details öffnen`}
                />
                {primaryImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="h-40 w-full object-cover"
                    style={{ objectPosition: `${(primaryImageEntry?.focalX ?? 0.5) * 100}% ${(primaryImageEntry?.focalY ?? 0.5) * 100}%` }}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-foreground/5 text-muted">
                    <PhotoIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="p-4">
                  {v.share_header ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">
                          {v.make} {v.model}
                        </p>
                        {isOwn ? (
                          <span className="shrink-0 rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-medium text-brand">
                            {locale === "de" ? "Dein Fahrzeug" : "Your vehicle"}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted">
                        {v.year}{" "}
                        {localizeCatalogText(v.variant, locale) ||
                          fuelLabel[v.fuel_type] ||
                          v.fuel_type}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold text-muted">Fahrzeug</p>
                  )}
                  <p className="mt-2 text-xs text-muted">
                    {g.vehicleBy} {ownerName}
                  </p>
                  {ratingInfo && ratingInfo.count > 0 ? (
                    <p className="mt-1 text-xs text-muted">
                      {locale === "de" ? "Bewertung" : "Rating"}:{" "}
                      <span className="font-medium text-foreground">
                        {avgRating.toFixed(1)}/5
                      </span>
                      {" "}
                      <span className="text-muted/70">({ratingInfo.count})</span>
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
