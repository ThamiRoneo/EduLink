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
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      const { data } = await supabase
        .from("favorites")
        .select("note_id, notes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setFavorites(data || [])
      setLoading(false)
    }
    load()
  }, [])

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
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, course code, institution..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
            {documentTypes.length > 0 && (
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
                <option value="">All document types</option>
                {documentTypes.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
              </select>
            )}
            {courses.length > 0 && (
              <select value={course} onChange={(e) => setCourse(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
                <option value="">All courses</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-sm text-slate-600">No favorites match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((fav) => {
                const note = fav.notes
                if (!note) return null
                return (
                  <Link key={fav.note_id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{note.title}</h3>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>{note.institution}</p>
                      <p>{note.course_code} • {note.course_name}</p>
                      {note.document_type && <p className="text-purple-700">{note.document_type}</p>}
                      <p>Year: {note.year}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
