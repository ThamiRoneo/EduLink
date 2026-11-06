import type { SupabaseClient } from "@supabase/supabase-js";

export function getNoteThumbnailUrl(
  supabase: SupabaseClient,
  thumbnailPath: string | null | undefined,
): string | null {
  if (!thumbnailPath) return null;
  const { data } = supabase.storage.from("note-thumbnails").getPublicUrl(thumbnailPath);
  return data.publicUrl || null;
}
