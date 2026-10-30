import { createClient } from "@/lib/supabase/server"

export async function getSignedUrl(filePath: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from("notes")
    .createSignedUrl(filePath, 3600) // 1 hour
  
  if (error) throw error
  return data.signedUrl
}
