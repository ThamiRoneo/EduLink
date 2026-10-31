import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single()
  
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (note.status !== "approved" && note.uploader_id !== user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  const { data, error } = await supabase.storage
    .from("notes")
    .createSignedUrl(note.file_url, 3600)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.redirect(data.signedUrl)
}
