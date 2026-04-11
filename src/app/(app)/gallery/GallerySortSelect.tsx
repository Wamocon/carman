"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/preferences";

export function GallerySortSelect({
  currentSort,
  locale,
}: {
  currentSort: string;
  locale: Locale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    router.push(`/gallery?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="gallery-sort" className="text-xs text-muted">
        {locale === "de" ? "Sortierung" : "Sort by"}
      </label>
      <select
        id="gallery-sort"
        value={currentSort}
        onChange={handleChange}
        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
      >
        <option value="newest">{locale === "de" ? "Neueste" : "Newest"}</option>
        <option value="rating">{locale === "de" ? "Beste Bewertung" : "Top Rated"}</option>
      </select>
    </div>
  );
}
