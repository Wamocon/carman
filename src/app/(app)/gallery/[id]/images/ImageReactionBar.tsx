"use client";

import { HeatSmiley, HeatSummary } from "@/components/HeatSmiley";
import { reactToImage } from "../../actions";
import type { HeatLevel, ImageReaction } from "@/types/domain";

export function ImageReactionBar({
  imageId,
  vehicleId,
  currentUserId,
  reactions,
}: {
  imageId: string;
  vehicleId: string;
  currentUserId: string;
  reactions: ImageReaction[];
}) {
  const myReaction = reactions.find((r) => r.user_id === currentUserId);

  const handleReact = async (level: HeatLevel) => {
    await reactToImage(imageId, level, vehicleId);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <HeatSmiley
        currentLevel={myReaction ? (myReaction.heat_level as HeatLevel) : null}
        onReact={handleReact}
        size="md"
      />
      <HeatSummary reactions={reactions} size="md" />
    </div>
  );
}
