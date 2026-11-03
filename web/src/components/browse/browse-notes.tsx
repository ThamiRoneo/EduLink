"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

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
  file_type: string
  file_size: number
  description?: string
}

const PAGE_SIZE = 12

export function BrowseNotes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    institution: searchParams.get("institution") || "",
    course_code: searchParams.get("course_code") || "",
    year: searchParams.get("year") || "",
    tag: searchParams.get("tag") || "",
    file_type: searchParams.get("file_type") || "",
  })
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const supabase = createClient()

  const updateUrl = useCallback((newFilters: typeof filters, newPage: number) => {
    const params = new URLSearchParams()
    if (newFilters.q) params.set("q", newFilters.q)
    if (newFilters.institution) params.set("institution", newFilters.institution)
    if (newFilters.course_code) params.set("course_code", newFilters.course_code)
    if (newFilters.year) params.set("year", newFilters.year)
    if (newFilters.tag) params.set("tag", newFilters.tag)
    if (newFilters.file_type) params.set("file_type", newFilters.file_type)
    if (newPage > 1) params.set("page", newPage.toString())
    const query = params.toString()
    router.replace(query ? `/browse?${query}` : "/browse", { scroll: false })
  }, [router])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,course_name.ilike.%${filters.q}%`)
    }
    if (filters.institution) query = query.ilike("institution", `%${filters.institution}%`)
    if (filters.course_code) query = query.ilike("course_code", `%${filters.course_code}%`)
    if (filters.year) query = query.eq("year", filters.year)
    if (filters.tag) query = query.contains("tags", [filters.tag])
    if (filters.file_type) query = query.eq("file_type", filters.file_type)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, count } = await query.range(from, to)
    setNotes(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [filters, page, supabase])

  useEffect(() => {
    updateUrl(filters, page)
    fetchNotes()
  }, [filters, page, updateUrl, fetchNotes])

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ q: "", institution: "", course_code: "", year: "", tag: "", file_type: "" })
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasActiveFilters = Object.values(filters).some(v => v !== "")

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <input placeholder="Search by title or course name..." value={filters.q} onChange={(e) => handleFilterChange("q", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <input placeholder="Institution" value={filters.institution} onChange={(e) => handleFilterChange("institution", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Course/Module code" value={filters.course_code} onChange={(e) => handleFilterChange("course_code", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Year" value={filters.year} onChange={(e) => handleFilterChange("year", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Tag" value={filters.tag} onChange={(e) => handleFilterChange("tag", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <select value={filters.file_type} onChange={(e) => handleFilterChange("file_type", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="">All file types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
          </select>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.q && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Search: {filters.q}</span>}
              {filters.institution && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Institution: {filters.institution}</span>}
              {filters.course_code && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Course: {filters.course_code}</span>}
              {filters.year && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Year: {filters.year}</span>}
              {filters.tag && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Tag: #{filters.tag}</span>}
              {filters.file_type && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Type: {filters.file_type.toUpperCase()}</span>}
            </div>
            <button onClick={clearFilters} className="text-xs text-slate-600 hover:text-slate-900">Clear all</button>
          </div>
        )}
        <div className="text-sm text-slate-600">{totalCount} result{totalCount !== 1 ? 's' : ''} found</div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-3">No notes match your filters.</p>
          <Link href="/upload" className="text-sm text-blue-600 hover:underline">Upload notes for this course</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{note.title}</h3>
                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <p>{note.institution}</p>
                  <p>{note.course_code} • {note.course_name}</p>
                  <p>Year: {note.year}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>★ {note.avg_rating?.toFixed(1) || "0.0"} ({note.rating_count || 0})</span>
                  <span>{note.view_count || 0} views</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="uppercase">{note.file_type}</span>
                  <span>{formatFileSize(note.file_size)}</span>
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
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md disabled:opacity-50">Previous</button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
