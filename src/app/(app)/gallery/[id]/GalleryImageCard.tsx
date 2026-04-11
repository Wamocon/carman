"use client";

import Link from "next/link";
import { HeatSmiley, HeatSummary } from "@/components/HeatSmiley";
import { reactToImage } from "../actions";
import type { HeatLevel, VehicleImage, ImageReaction } from "@/types/domain";

export function GalleryImageCard({
  image,
  signedUrl,
  vehicleId,
  currentUserId,
  reactions,
}: {
  image: VehicleImage;
  signedUrl: string | null;
  vehicleId: string;
  currentUserId: string;
  reactions: ImageReaction[];
}) {
  const myReaction = reactions.find((r) => r.user_id === currentUserId);

  const handleReact = async (level: HeatLevel) => {
    await reactToImage(image.id, level, vehicleId);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
      <Link href={`/gallery/${vehicleId}/images/${image.id}`}>
        {signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={image.caption ?? image.file_name}
            className="h-44 w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
            style={{ objectPosition: `${(image.focal_point_x ?? 0.5) * 100}% ${(image.focal_point_y ?? 0.5) * 100}%` }}
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-foreground/5 text-xs text-muted">
            Bild nicht verfügbar
          </div>
        )}
      </Link>
      <div className="space-y-2 p-3 text-xs">
        {image.caption ? (
          <p className="font-medium text-foreground">{image.caption}</p>
        ) : null}
        {image.description ? (
          <p className="text-muted">{image.description}</p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <HeatSmiley
            currentLevel={myReaction ? (myReaction.heat_level as HeatLevel) : null}
            onReact={handleReact}
            size="sm"
          />
          <HeatSummary reactions={reactions} />
        </div>
      </div>
    </article>
  );
}
