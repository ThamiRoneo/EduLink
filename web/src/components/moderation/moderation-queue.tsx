"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function ModerationQueue() {
  const [notes, setNotes] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)
      if (profileData?.role !== "moderator" && profileData?.role !== "admin") {
        router.push("/browse")
        return
      }
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
      setNotes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function approve(noteId: string) {
    await supabase.from("notes").update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id }).eq("id", noteId)
    setNotes(notes.filter(n => n.id !== noteId))
  }

  async function reject(noteId: string) {
    if (!reason.trim()) {
      alert("Rejection reason is required")
      return
    }
    await supabase.from("notes").update({ status: "rejected", rejection_reason: reason }).eq("id", noteId)
    setNotes(notes.filter(n => n.id !== noteId))
    setRejectingId(null)
    setReason("")
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
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
