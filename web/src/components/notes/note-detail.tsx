"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { renderMarkdown } from "@/lib/markdown"
import { UserAvatar } from "@/components/ui/user-avatar"

export function NoteDetail({ noteId }: { noteId: string }) {
  const [note, setNote] = useState<any>(null)
  const [fileUrl, setFileUrl] = useState("")
  const [isFavorited, setIsFavorited] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data } = await supabase.from("notes").select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)").eq("id", noteId).single()
      if (!data) { setLoading(false); return }

      if (data.uploader_id !== user.id && data.status === "pending") { router.push("/browse"); return }
      if (data.uploader_id !== user.id && data.status === "rejected") { router.push("/browse"); return }

      setNote(data)
      const { data: fav } = await supabase.from("favorites").select("id").eq("note_id", noteId).eq("user_id", user.id).single()
      setIsFavorited(!!fav)
      const { data: rating } = await supabase.from("ratings").select("value").eq("note_id", noteId).eq("user_id", user.id).single()
      if (rating) setUserRating(rating.value)
      await supabase.from("views").insert({ note_id: noteId, user_id: user.id })
      setLoading(false)
    }
    load()
  }, [noteId, router, supabase])

  async function downloadNote() {
    if (!note) return
    const { data } = await supabase.storage.from("notes").createSignedUrl(note.file_url, 60)
    if (data?.signedUrl) {
      const link = document.createElement("a")
      link.href = data.signedUrl
      link.download = note.title
      link.click()
      await supabase.from("downloads").insert({ note_id: noteId, user_id: (await supabase.auth.getUser()).data.user?.id })
    }
  }

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (isFavorited) {
      await supabase.from("favorites").delete().eq("note_id", noteId).eq("user_id", user.id)
      setIsFavorited(false)
    } else {
      await supabase.from("favorites").insert({ note_id: noteId, user_id: user.id })
      setIsFavorited(true)
    }
  }

  async function rateNote(value: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("ratings").upsert({ note_id: noteId, user_id: user.id, value })
    setUserRating(value)
  }

  async function submitReport() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("reports").insert({ note_id: noteId, reporter_id: user.id, reason: reportReason })
    setShowReport(false)
    setReportReason("")
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading note">
        <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
          <div className="h-7 bg-slate-200 rounded w-2/3 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-4 bg-slate-200 rounded w-24" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg">
            <div className="h-10 w-10 bg-slate-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-200 rounded-md" />
            <div className="h-9 w-24 bg-slate-100 rounded-md" />
            <div className="h-9 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-32 mb-4" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-8 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (!note) return <div className="text-center py-8">Note not found</div>

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{note.title}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div><p className="text-slate-600">Institution</p><p className="font-medium">{note.institution}</p></div>
          <div><p className="text-slate-600">Course</p><p className="font-medium">{note.course_code}</p></div>
          <div><p className="text-slate-600">Year</p><p className="font-medium">{note.year}</p></div>
          <div><p className="text-slate-600">Rating</p><p className="font-medium">{note.rating_avg.toFixed(1)} ({note.rating_count})</p></div>
        </div>
        {note.uploader && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg">
            <UserAvatar avatarUrl={note.uploader.avatar_url} name={note.uploader.display_name} size={40} className="border border-slate-200" />
            <div>
              <p className="font-medium text-slate-900">{note.uploader.display_name || "Anonymous"}</p>
              {note.uploader.institution_affiliation && <p className="text-xs text-slate-600">{note.uploader.institution_affiliation}</p>}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={downloadNote} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Download</button>
          <button onClick={toggleFavorite} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">{isFavorited ? "★ Favorited" : "☆ Favorite"}</button>
          <button onClick={() => setShowReport(true)} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Report</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Rate this note</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => rateNote(star)} className={`text-2xl ${userRating >= star ? "text-yellow-400" : "text-slate-300"}`}>★</button>
          ))}
        </div>
      </div>

      {note.file_type === "text" && note.text_content && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Content</h2>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(note.text_content) }} />
        </div>
      )}

      {note.file_type === "markdown" && note.markdown_content && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Content</h2>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(note.markdown_content) }} />
        </div>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="font-semibold text-slate-900 mb-4">Report this note</h2>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Reason for report..." className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm mb-4" rows={4} />
            <div className="flex gap-2">
              <button onClick={submitReport} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Submit</button>
              <button onClick={() => setShowReport(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
