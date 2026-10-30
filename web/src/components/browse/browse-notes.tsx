"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

type Note = {
  id: string
  title: string
  institution: string
  course_code: string
  course_name: string
  year: string
  tags: string[]
  avg_rating: number
  rating_count: number
  view_count: number
  created_at: string
}

export function BrowseNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    institution: "",
    course_code: "",
    year: "",
    tag: "",
  })
  const supabase = createClient()

  async function fetchNotes() {
    setLoading(true)
    let query = supabase
      .from("notes")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (filters.institution) query = query.ilike("institution", `%${filters.institution}%`)
    if (filters.course_code) query = query.ilike("course_code", `%${filters.course_code}%`)
    if (filters.year) query = query.eq("year", filters.year)
    if (filters.tag) query = query.contains("tags", [filters.tag])

    const { data } = await query
    setNotes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [filters])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input placeholder="Institution" value={filters.institution} onChange={(e) => setFilters({ ...filters, institution: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Course/Module code" value={filters.course_code} onChange={(e) => setFilters({ ...filters, course_code: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Tag" value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No notes match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{note.title}</h3>
              <div className="text-xs text-slate-600 space-y-1 mb-3">
                <p>{note.institution}</p>
                <p>{note.course_code} • {note.course_name}</p>
                <p>Year: {note.year}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>★ {note.avg_rating?.toFixed(1) || "0.0"} ({note.rating_count || 0})</span>
                <span>{note.view_count || 0} views</span>
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">#{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
