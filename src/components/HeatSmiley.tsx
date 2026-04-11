"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HeatLevel } from "@/types/domain";

const HEAT_EMOJIS: Record<HeatLevel, string> = {
  1: "🥶",
  2: "😐",
  3: "🙂",
  4: "🔥",
  5: "🤩",
};

export function HeatSmiley({
  currentLevel,
  onReact,
  size = "md",
}: {
  currentLevel: HeatLevel | null;
  onReact: (level: HeatLevel) => Promise<void>;
  size?: "sm" | "md";
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (level: HeatLevel) => {
    startTransition(async () => {
      await onReact(level);
      router.refresh();
    });
  };

  const buttonSize = size === "sm" ? "h-7 w-7 text-base" : "h-9 w-9 text-xl";

  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4, 5] as HeatLevel[]).map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => handleClick(level)}
          disabled={isPending}
          className={`${buttonSize} rounded-full transition-all duration-150 hover:scale-110 disabled:opacity-50 ${
            currentLevel === level
              ? "ring-2 ring-brand ring-offset-1 ring-offset-background scale-110"
              : "opacity-60 hover:opacity-100"
          }`}
          aria-label={`Bewertung ${level}`}
          aria-pressed={currentLevel === level}
        >
          {HEAT_EMOJIS[level]}
        </button>
      ))}
    </div>
  );
}

export function HeatSummary({
  reactions,
  size = "sm",
}: {
  reactions: Array<{ heat_level: number }>;
  size?: "sm" | "md";
}) {
  if (reactions.length === 0) return null;

  const avg = reactions.reduce((sum, r) => sum + r.heat_level, 0) / reactions.length;
  const rounded = Math.round(avg) as HeatLevel;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-1 ${textSize} text-muted`}>
      <span>{HEAT_EMOJIS[rounded]}</span>
      <span>{avg.toFixed(1)}</span>
      <span>({reactions.length})</span>
    </span>
  );
}
