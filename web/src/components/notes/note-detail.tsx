"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function NoteDetail({ noteId }: { noteId: string }) {
  const [note, setNote] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [reportOpen, setReportOpen] = useState(false)
  const [reportCategory, setReportCategory] = useState("Abuse")
  const [reportDetails, setReportDetails] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase.from("notes").select("*").eq("id", noteId).single()
      setNote(data)

      if (data && data.status === "approved") {
        await supabase.from("view_events").insert({ note_id: noteId, user_id: user?.id || null })
      }
      setLoading(false)
    }
    load()
  }, [noteId])

  async function submitRating() {
    if (!user) return router.push("/login")
    if (note.uploader_id === user.id) {
      alert("You cannot rate your own note")
      return
    }
    await supabase.from("ratings").upsert({ note_id: noteId, user_id: user.id, stars: rating }, { onConflict: "note_id,user_id" })
    alert("Rating submitted")
  }

  async function submitReview() {
    if (!user) return router.push("/login")
    if (review.length > 500) {
      alert("Review must be 500 characters or less")
      return
    }
    await supabase.from("reviews").insert({ note_id: noteId, user_id: user.id, content: review })
    setReview("")
    alert("Review submitted")
  }

  async function toggleFavorite() {
    if (!user) return router.push("/login")
    const { data: existing } = await supabase.from("favorites").select("id").eq("note_id", noteId).eq("user_id", user.id).maybeSingle()
    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id)
    } else {
      await supabase.from("favorites").insert({ note_id: noteId, user_id: user.id })
    }
    alert("Favorite updated")
  }

  async function submitReport() {
    if (!user) return router.push("/login")
    await supabase.from("reports").insert({ note_id: noteId, reporter_id: user.id, category: reportCategory, details: reportDetails })
    setReportOpen(false)
    setReportDetails("")
    alert("Thanks for reporting. We'll review it.")
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!note) return <div className="text-center py-8">Note not found</div>
  if (note.status !== "approved" && note.uploader_id !== user?.id) return <div className="text-center py-8">Note not available</div>

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{note.title}</h1>
        <div className="text-sm text-slate-600 space-y-1 mb-4">
          <p>{note.institution} • {note.course_code} • {note.course_name}</p>
          <p>Year: {note.year} • Views: {note.view_count || 0}</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(note.tags || []).map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">#{tag}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
            <a href={`/api/notes/${note.id}/download`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Download/View</a>
          <button onClick={toggleFavorite} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Favorite</button>
          <button onClick={() => setReportOpen(true)} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Report</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Rate this note</h2>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className={`text-2xl ${rating >= s ? 'text-amber-400' : 'text-slate-300'}`}>★</button>
          ))}
        </div>
        <button onClick={submitRating} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Submit rating</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Leave a review</h2>
        <textarea value={review} onChange={(e) => setReview(e.target.value)} maxLength={500} placeholder="Share your thoughts..." className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm mb-2" rows={3} />
        <p className="text-xs text-slate-500 mb-3">{review.length}/500</p>
        <button onClick={submitReview} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Submit review</button>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Report this note</h2>
            <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm mb-3">
              <option>Abuse</option>
              <option>Incorrect/Misleading</option>
              <option>Copyright</option>
              <option>Other</option>
            </select>
            <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Additional details (optional)" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm mb-4" rows={3} />
            <div className="flex gap-2">
              <button onClick={submitReport} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Submit report</button>
              <button onClick={() => setReportOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
