"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { HeatSmiley } from "@/components/HeatSmiley";
import { addImageComment, deleteImageComment, reactToComment } from "../../actions";
import type { HeatLevel } from "@/types/domain";

export function ImageCommentForm({
  vehicleId,
  imageId,
}: {
  vehicleId: string;
  imageId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      await addImageComment(vehicleId, imageId, body);
      setBody("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Kommentar schreiben..."
        maxLength={2000}
        className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
      />
      <button
        type="submit"
        disabled={isPending || !body.trim()}
        className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {isPending ? "..." : "Absenden"}
      </button>
    </form>
  );
}

export function ImageCommentItem({
  comment,
  vehicleId,
  imageId,
  isOwner,
  isAuthor,
  currentUserId,
  reactions,
}: {
  comment: { id: string; body: string; created_at: string; user_id: string; author_display_name?: string | null };
  vehicleId: string;
  imageId: string;
  isOwner: boolean;
  isAuthor: boolean;
  currentUserId: string;
  reactions: Array<{ id: string; comment_id: string; user_id: string; heat_level: number }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteImageComment(comment.id, vehicleId, imageId);
      router.refresh();
    });
  };

  const handleReact = async (level: HeatLevel) => {
    await reactToComment(comment.id, level, vehicleId);
  };

  const myReaction = reactions.find((r) => r.user_id === currentUserId);

  const dateStr = new Date(comment.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <li className="rounded-xl border border-border/70 bg-card/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">
            {comment.author_display_name ?? "Anonym"} · {dateStr}
          </p>
          <p className="mt-1 text-sm text-foreground">{comment.body}</p>
          <div className="mt-2 flex items-center gap-3">
            <HeatSmiley
              currentLevel={myReaction ? (myReaction.heat_level as HeatLevel) : null}
              onReact={handleReact}
              size="sm"
            />
          </div>
        </div>
        {(isOwner || isAuthor) ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
          >
            {isPending ? "..." : "Löschen"}
          </button>
        ) : null}
      </div>
    </li>
  );
}
