import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/Icons";
import { createClient } from "@/lib/supabase/server";
import type { VehicleImage, ImageReaction, PublicComment, PublicCommentReaction } from "@/types/domain";
import { ImageReactionBar } from "../ImageReactionBar";
import { SocialShareButtons } from "../SocialShareButtons";
import { ImageCommentForm, ImageCommentItem } from "../ImageCommentSection";

export async function generateMetadata(props: {
  params: Promise<{ id: string; imageId: string }>;
}) {
  const { id, imageId } = await props.params;
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("vehicle_images")
    .select("caption, file_name")
    .eq("id", imageId)
    .single();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("make, model")
    .eq("id", id)
    .single();

  const title = image?.caption ?? image?.file_name ?? "Bild";
  const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : "Fahrzeug";

  return {
    title: `${title} — ${vehicleName} — CarMan Galerie`,
  };
}

export default async function ImageDetailPage(props: {
  params: Promise<{ id: string; imageId: string }>;
}) {
  const { id: vehicleId, imageId } = await props.params;
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

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, is_published, share_images, user_id")
    .eq("id", vehicleId)
    .eq("is_published", true)
    .single();

  if (!vehicle || !vehicle.share_images) {
    redirect(`/gallery/${vehicleId}`);
  }

  const { data: imageData, error: imageError } = await supabase
    .from("vehicle_images")
    .select("*")
    .eq("id", imageId)
    .eq("vehicle_id", vehicleId)
    .eq("is_public", true)
    .single();

  if (imageError || !imageData) {
    redirect(`/gallery/${vehicleId}`);
  }

  const image = imageData as VehicleImage;

  const { data: signedUrlData } = await supabase.storage
    .from("vehicle-images")
    .createSignedUrl(image.storage_path, 60 * 30);

  const signedUrl = signedUrlData?.signedUrl ?? null;

  const { data: reactions } = await supabase
    .from("image_reactions")
    .select("*")
    .eq("image_id", imageId);

  const imageReactions = (reactions ?? []) as ImageReaction[];

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", vehicle.user_id)
    .single();

  const ownerName = ownerProfile?.display_name ?? "Anonym";

  // Fetch image-level comments
  const { data: imgComments } = await supabase
    .from("public_comments")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("image_id", imageId)
    .order("created_at", { ascending: false });

  const imageComments = (imgComments ?? []) as PublicComment[];

  const { data: imgCommentReactions } = await supabase
    .from("public_comment_reactions")
    .select("*");

  const allImgCommentReactions = (imgCommentReactions ?? []) as PublicCommentReaction[];
  const imgCommentIds = imageComments.map((c) => c.id);
  const filteredImgCommentReactions = allImgCommentReactions.filter((r) =>
    imgCommentIds.includes(r.comment_id),
  );

  const commentAuthorIds = [...new Set(imageComments.map((c) => c.user_id))];
  const { data: authorProfiles } = commentAuthorIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", commentAuthorIds)
    : { data: [] };

  const authorMap = Object.fromEntries(
    (authorProfiles ?? []).map((p) => [p.id, p.display_name ?? "Anonym"]),
  );

  const isOwner = vehicle.user_id === user.id;

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/gallery/${vehicleId}/images/${imageId}`;

  const shareTitle = `${vehicle.make} ${vehicle.model} — ${image.caption ?? image.file_name}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/gallery/${vehicleId}`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Zurück zum Fahrzeug
      </Link>

      <section className="section-shell overflow-hidden rounded-2xl">
        {signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={image.caption ?? image.file_name}
            className="w-full object-contain bg-foreground/5"
            style={{ maxHeight: "70vh" }}
          />
        ) : (
          <div className="flex h-80 items-center justify-center bg-foreground/5 text-muted">
            Bild nicht verfügbar
          </div>
        )}

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {image.caption ?? image.file_name}
            </h1>
            <p className="mt-1 text-xs text-muted">
              von {ownerName} · {vehicle.make} {vehicle.model}
            </p>
          </div>

          {image.description ? (
            <div className="rounded-xl border border-border/70 bg-card/60 p-3">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">Beschreibung</p>
              <p className="mt-1 text-sm text-foreground">{image.description}</p>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Bewertung</p>
            <ImageReactionBar
              imageId={image.id}
              vehicleId={vehicleId}
              currentUserId={user.id}
              reactions={imageReactions}
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">Teilen</p>
            <SocialShareButtons url={shareUrl} title={shareTitle} />
          </div>
        </div>
      </section>

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Kommentare</h2>
        <ImageCommentForm vehicleId={vehicleId} imageId={imageId} />
        {imageComments.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Kommentare.</p>
        ) : (
          <ul className="space-y-2">
            {imageComments.map((comment) => {
              const commentReactions = filteredImgCommentReactions.filter(
                (r) => r.comment_id === comment.id,
              );
              return (
                <ImageCommentItem
                  key={comment.id}
                  comment={{
                    ...comment,
                    author_display_name: authorMap[comment.user_id] ?? "Anonym",
                  }}
                  vehicleId={vehicleId}
                  imageId={imageId}
                  isOwner={isOwner}
                  isAuthor={comment.user_id === user.id}
                  currentUserId={user.id}
                  reactions={commentReactions}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
