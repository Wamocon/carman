"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleVehiclePublished(vehicleId: string, isPublished: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({ is_published: isPublished })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Einstellung konnte nicht gespeichert werden." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/gallery");
  return { error: null };
}

export async function updateVehicleSharingOptions(
  vehicleId: string,
  options: {
    share_header?: boolean;
    share_details?: boolean;
    share_images?: boolean;
  },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicles")
    .update(options)
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Einstellung konnte nicht gespeichert werden." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/gallery/${vehicleId}`);
  return { error: null };
}

export async function toggleImagePublic(imageId: string, isPublic: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicle_images")
    .update({ is_public: isPublic })
    .eq("id", imageId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Einstellung konnte nicht gespeichert werden." };
  }

  revalidatePath("/vehicles");
  revalidatePath("/gallery");
  return { error: null };
}

export async function updateImageDescription(imageId: string, description: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicle_images")
    .update({ description: description.trim() || null })
    .eq("id", imageId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Beschreibung konnte nicht gespeichert werden." };
  }

  revalidatePath("/vehicles");
  revalidatePath("/gallery");
  return { error: null };
}

export async function updateImageFocalPoint(
  imageId: string,
  focalPointX: number,
  focalPointY: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const clampedX = Math.max(0, Math.min(1, focalPointX));
  const clampedY = Math.max(0, Math.min(1, focalPointY));

  const { error } = await supabase
    .from("vehicle_images")
    .update({ focal_point_x: clampedX, focal_point_y: clampedY })
    .eq("id", imageId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Fokuspunkt konnte nicht gespeichert werden." };
  }

  revalidatePath("/vehicles");
  revalidatePath("/gallery");
  return { error: null };
}

export async function updateImageCaption(imageId: string, caption: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicle_images")
    .update({ caption: caption.trim() || null })
    .eq("id", imageId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Titel konnte nicht gespeichert werden." };
  }

  revalidatePath("/vehicles");
  revalidatePath("/gallery");
  return { error: null };
}
