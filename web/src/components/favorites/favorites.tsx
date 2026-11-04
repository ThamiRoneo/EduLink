"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [course, setCourse] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUserId(user.id)
      const { data } = await supabase
        .from("favorites")
        .select("note_id, notes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setFavorites(data || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function removeFromFavorites(noteId: string) {
    if (!userId) return
    await supabase.from("favorites").delete().eq("note_id", noteId).eq("user_id", userId)
    setFavorites((prev) => prev.filter((f) => f.note_id !== noteId))
    setSelected((prev) => { const n = new Set(prev); n.delete(noteId); return n })
  }

  const toggleSelect = (noteId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })
  }

  const selectAllFiltered = () => {
    const ids = filtered.map((fav) => fav.notes?.id).filter(Boolean) as string[]
    setSelected(new Set(ids))
  }

  const clearSelection = () => setSelected(new Set())

  const bulkRemove = async () => {
    if (selected.size === 0 || !userId) return
    setBulkBusy(true)
    try {
      const ids = Array.from(selected)
      await supabase.from("favorites").delete().eq("user_id", userId).in("note_id", ids)
      setFavorites((prev) => prev.filter((fav) => !ids.includes(fav.note_id)))
      clearSelection()
    } finally {
      setBulkBusy(false)
    }
  }

  const notesList = useMemo(() => favorites.map((f) => f.notes).filter(Boolean), [favorites])

  const documentTypes = useMemo(() => {
    const set = new Set<string>()
    notesList.forEach((n: any) => { if (n.document_type) set.add(n.document_type) })
    return Array.from(set).sort()
  }, [notesList])

  const courses = useMemo(() => {
    const set = new Set<string>()
    notesList.forEach((n: any) => {
      const c = n.course_code || n.course_name
      if (c) set.add(c)
    })
    return Array.from(set).sort()
  }, [notesList])

  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim()
    return favorites.filter((fav) => {
      const note = fav.notes
      if (!note) return false
      if (documentType && note.document_type !== documentType) return false
      if (course) {
        const c = note.course_code || note.course_name
        if (c !== course) return false
      }
      if (!qq) return true
      return (
        (note.title || "").toLowerCase().includes(qq) ||
        (note.course_code || "").toLowerCase().includes(qq) ||
        (note.course_name || "").toLowerCase().includes(qq) ||
        (note.institution || "").toLowerCase().includes(qq)
      )
    })
  }, [favorites, q, documentType, course])

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
      {notesList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-4">You have no favorites yet.</p>
          <Link href="/browse" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Browse notes</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, course code, institution..." className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm" />
              {documentTypes.length > 0 && (<select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm"><option value="">All document types</option>{documentTypes.map((dt) => <option key={dt} value={dt}>{dt}</option>)}</select>)}
              {courses.length > 0 && (<select value={course} onChange={(e) => setCourse(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm"><option value="">All courses</option>{courses.map((c) => <option key={c} value={c}>{c}</option>)}</select>)}
            </div>
            {filtered.length > 0 && (<div className="flex items-center gap-2 text-sm"><button onClick={selectAllFiltered} className="px-2 py-1 border border-slate-200 rounded-md hover:bg-slate-50">Select all</button><button onClick={clearSelection} className="px-2 py-1 border border-slate-200 rounded-md hover:bg-slate-50">Clear</button>{selected.size > 0 && (<button onClick={bulkRemove} disabled={bulkBusy} className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">Remove {selected.size}</button>)}</div>)}
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-sm text-slate-600">No favorites match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((fav) => {
                const note = fav.notes
                if (!note) return null
                const isSel = selected.has(note.id)
                return (
                  <div key={fav.note_id} className={`relative bg-white border rounded-lg transition-shadow ${isSel ? "border-primary shadow-sm" : "border-slate-200 hover:shadow-sm"}`}>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(note.id) }} className="absolute top-2 left-2 z-10" aria-label={isSel ? "Deselect" : "Select"}>
                      <input type="checkbox" checked={isSel} readOnly className="h-4 w-4" />
                    </button>
                    <Link href={`/notes/${note.id}`} className="block p-4 pl-8">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 pr-6">{note.title}</h3>
                      <div className="text-xs text-slate-600 space-y-1">
                        {note.institution && <p>{note.institution}</p>}
                        {(note.course_code || note.course_name) && <p>{note.course_code}{note.course_code && note.course_name ? " • " : ""}{note.course_name}</p>}
                        {(note.file_type || note.document_type) && (
                          <p className="text-purple-700">
                            {note.file_type ? note.file_type.toUpperCase() : note.document_type}
                            {note.document_type && note.file_type ? ` • ${note.document_type}` : ""}
                          </p>
                        )}
                        {note.document_type && !(note.file_type) && <p className="text-purple-700">{note.document_type}</p>}
                        {typeof note.year !== "undefined" && note.year !== null && <p>Year: {note.year}</p>}
                        {(typeof note.rating !== "undefined" && note.rating !== null) && <p>Rating: {note.rating}</p>}
                        {(typeof note.views !== "undefined" && note.views !== null) && <p>Views: {note.views}</p>}
                      </div>
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromFavorites(note.id) }}
                      className="absolute top-2 right-2 text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      title="Remove from favorites"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
