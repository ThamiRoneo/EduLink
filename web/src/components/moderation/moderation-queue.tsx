"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UserAvatar } from "@/components/ui/user-avatar"

export function ModerationQueue() {
  const [notes, setNotes] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/login?next=/moderation")
        return
      }
      setUser(user)
      // Defense-in-depth: server page gates access; client rechecks because direct Supabase calls are user-scoped.
      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (profileData?.role !== "moderator" && profileData?.role !== "admin") {
        router.replace("/browse")
        return
      }
      const { data, error } = await supabase
        .from("notes")
        .select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
      if (error) setActionError("Could not load moderation queue.")
      setNotes(data || [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  async function approve(noteId: string) {
    if (!user) return
    setActionError(null)
    const { error } = await supabase
      .from("notes")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id })
      .eq("id", noteId)
      .eq("status", "pending")
    if (error) {
      setActionError("Approve failed. Check permissions/policy.")
      return
    }
    setNotes(notes.filter((n) => n.id !== noteId))
  }

  async function reject(noteId: string) {
    if (!user) return
    if (!reason.trim()) {
      setActionError("Rejection reason is required")
      return
    }
    setActionError(null)
    const { error } = await supabase
      .from("notes")
      .update({ status: "rejected", rejection_reason: reason.trim() })
      .eq("id", noteId)
      .eq("status", "pending")
    if (error) {
      setActionError("Reject failed. Check permissions/policy.")
      return
    }
    setNotes(notes.filter((n) => n.id !== noteId))
    setRejectingId(null)
    setReason("")
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{actionError}</div>
      )}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-600">Pending submissions: {notes.length}</p>
      </div>
      {notes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No pending items.</p>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">{note.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <UserAvatar avatarUrl={note.uploader?.avatar_url} name={note.uploader?.display_name} size={20} className="border border-slate-200" />
              <span>
                {note.uploader?.display_name || "Unknown uploader"}
                {note.uploader?.institution_affiliation ? ` • ${note.uploader.institution_affiliation}` : ""}
              </span>
            </div>
            <div className="text-sm text-slate-600 space-y-1 mb-4">
              <p>{note.institution} • {note.course_code} • {note.course_name}</p>
              <p>Year: {note.year} • File: {note.file_type.toUpperCase()} ({(note.file_size / 1024 / 1024).toFixed(2)} MB)</p>
              {note.tags && note.tags.length > 0 && <p>Tags: {(note.tags || []).join(', ')}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => approve(note.id)} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Approve</button>
              <button onClick={() => setRejectingId(note.id)} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Reject</button>
            </div>
            {rejectingId === note.id && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <label className="block text-sm font-semibold text-red-900 mb-1">Rejection reason (required)</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-red-200 rounded-md text-sm mb-2" rows={3} />
                <div className="flex gap-2">
                  <button onClick={() => reject(note.id)} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Confirm rejection</button>
                  <button onClick={() => { setRejectingId(null); setReason(""); }} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
