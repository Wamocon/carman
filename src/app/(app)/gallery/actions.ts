"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HeatLevel } from "@/types/domain";

export async function addPublicComment(vehicleId: string, body: string) {
  if (!body.trim() || body.trim().length > 2000) {
    return { error: "Kommentar muss zwischen 1 und 2000 Zeichen lang sein." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("sharing_enabled")
    .eq("id", user.id)
    .single();

  if (!profile?.sharing_enabled) {
    return { error: "Galerie-Funktion nicht aktiviert." };
  }

  const { error } = await supabase.from("public_comments").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    body: body.trim(),
  });

  if (error) {
    return { error: "Kommentar konnte nicht gespeichert werden." };
  }

  revalidatePath(`/gallery/${vehicleId}`);
  return { error: null };
}

export async function deletePublicComment(commentId: string, vehicleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("public_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return { error: "Kommentar konnte nicht gelöscht werden." };
  }

  revalidatePath(`/gallery/${vehicleId}`);
  return { error: null };
}

export async function reactToComment(commentId: string, heatLevel: HeatLevel, vehicleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { data: existing } = await supabase
    .from("public_comment_reactions")
    .select("id, heat_level")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.heat_level === heatLevel) {
      await supabase
        .from("public_comment_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("public_comment_reactions")
        .update({ heat_level: heatLevel })
        .eq("id", existing.id);
    }
  } else {
    const { error } = await supabase.from("public_comment_reactions").insert({
      comment_id: commentId,
      user_id: user.id,
      heat_level: heatLevel,
    });

    if (error) {
      return { error: "Bewertung konnte nicht gespeichert werden." };
    }
  }

  revalidatePath(`/gallery/${vehicleId}`);
  return { error: null };
}

export async function reactToImage(imageId: string, heatLevel: HeatLevel, vehicleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { data: existing } = await supabase
    .from("image_reactions")
    .select("id, heat_level")
    .eq("image_id", imageId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.heat_level === heatLevel) {
      await supabase
        .from("image_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("image_reactions")
        .update({ heat_level: heatLevel })
        .eq("id", existing.id);
    }
  } else {
    const { error } = await supabase.from("image_reactions").insert({
      image_id: imageId,
      user_id: user.id,
      heat_level: heatLevel,
    });

    if (error) {
      return { error: "Bewertung konnte nicht gespeichert werden." };
    }
  }

  revalidatePath(`/gallery/${vehicleId}`);
  revalidatePath(`/gallery/${vehicleId}/images/${imageId}`);
  return { error: null };
}

export async function addImageComment(vehicleId: string, imageId: string, body: string) {
  if (!body.trim() || body.trim().length > 2000) {
    return { error: "Kommentar muss zwischen 1 und 2000 Zeichen lang sein." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("sharing_enabled")
    .eq("id", user.id)
    .single();

  if (!profile?.sharing_enabled) {
    return { error: "Galerie-Funktion nicht aktiviert." };
  }

  const { error } = await supabase.from("public_comments").insert({
    vehicle_id: vehicleId,
    image_id: imageId,
    user_id: user.id,
    body: body.trim(),
  });

  if (error) {
    return { error: "Kommentar konnte nicht gespeichert werden." };
  }

  revalidatePath(`/gallery/${vehicleId}/images/${imageId}`);
  return { error: null };
}

export async function deleteImageComment(commentId: string, vehicleId: string, imageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("public_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return { error: "Kommentar konnte nicht gelöscht werden." };
  }

  revalidatePath(`/gallery/${vehicleId}/images/${imageId}`);
  return { error: null };
}
