"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
  faculty?: string
  department?: string
  semester?: string
  term?: string
  lecturer?: string
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
    faculty: searchParams.get("faculty") || "",
    department: searchParams.get("department") || "",
    semester: searchParams.get("semester") || "",
    term: searchParams.get("term") || "",
    lecturer: searchParams.get("lecturer") || "",
  })
  const [draftFilters, setDraftFilters] = useState(filters)
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [sort, setSort] = useState(searchParams.get("sort") || "recent")
  const supabase = createClient()

  const [instSuggestions, setInstSuggestions] = useState<string[]>([])
  const [courseSuggestions, setCourseSuggestions] = useState<string[]>([])
  const [showInstSug, setShowInstSug] = useState(false)
  const [showCourseSug, setShowCourseSug] = useState(false)
  const instRef = useRef<HTMLDivElement>(null)
  const courseRef = useRef<HTMLDivElement>(null)

  const updateUrl = useCallback((newFilters: typeof filters, newPage: number, newSort: string) => {
    const params = new URLSearchParams()
    if (newFilters.q) params.set("q", newFilters.q)
    if (newFilters.institution) params.set("institution", newFilters.institution)
    if (newFilters.course_code) params.set("course_code", newFilters.course_code)
    if (newFilters.year) params.set("year", newFilters.year)
    if (newFilters.tag) params.set("tag", newFilters.tag)
    if (newFilters.file_type) params.set("file_type", newFilters.file_type)
    if (newFilters.faculty) params.set("faculty", newFilters.faculty)
    if (newFilters.department) params.set("department", newFilters.department)
    if (newFilters.semester) params.set("semester", newFilters.semester)
    if (newFilters.term) params.set("term", newFilters.term)
    if (newFilters.lecturer) params.set("lecturer", newFilters.lecturer)
    if (newSort && newSort !== "recent") params.set("sort", newSort)
    if (newPage > 1) params.set("page", newPage.toString())
    const query = params.toString()
    router.replace(query ? `/browse?${query}` : "/browse", { scroll: false })
  }, [router])

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    const t = setTimeout(() => {
      if (
        draftFilters.q !== filters.q ||
        draftFilters.institution !== filters.institution ||
        draftFilters.course_code !== filters.course_code ||
        draftFilters.year !== filters.year ||
        draftFilters.tag !== filters.tag
      ) {
        setFilters({ ...filters, q: draftFilters.q, institution: draftFilters.institution, course_code: draftFilters.course_code, year: draftFilters.year, tag: draftFilters.tag })
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [draftFilters, filters])

  useEffect(() => {
    const loadSuggestions = async () => {
      const [instRes, courseRes] = await Promise.all([
        supabase.from("notes").select("institution").eq("status", "approved").limit(1000),
        supabase.from("notes").select("course_code").eq("status", "approved").limit(1000),
      ])
      const instSet = new Set<string>()
      const courseSet = new Set<string>()
      ;(instRes.data || []).forEach((r: any) => { if (r.institution) instSet.add(r.institution.trim()) })
      ;(courseRes.data || []).forEach((r: any) => { if (r.course_code) courseSet.add(r.course_code.trim()) })
      setInstSuggestions(Array.from(instSet).sort())
      setCourseSuggestions(Array.from(courseSet).sort())
    }
    loadSuggestions()
  }, [supabase])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (instRef.current && !instRef.current.contains(e.target as Node)) setShowInstSug(false)
      if (courseRef.current && !courseRef.current.contains(e.target as Node)) setShowCourseSug(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("status", "approved")

    if (sort === "most_viewed" || sort === "views") {
      query = query.order("view_count", { ascending: false }).order("created_at", { ascending: false })
    } else if (sort === "highest_rated" || sort === "rating") {
      query = query.order("avg_rating", { ascending: false }).order("rating_count", { ascending: false }).order("created_at", { ascending: false })
    } else if (sort === "most_downloaded" || sort === "downloads") {
      query = query.order("download_count", { ascending: false }).order("created_at", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,course_name.ilike.%${filters.q}%`)
    }
    if (filters.institution) query = query.ilike("institution", `%${filters.institution}%`)
    if (filters.course_code) query = query.ilike("course_code", `%${filters.course_code}%`)
    if (filters.year) query = query.eq("year", filters.year)
    if (filters.tag) query = query.contains("tags", [filters.tag])
    if (filters.file_type) query = query.eq("file_type", filters.file_type)
    if (filters.faculty) query = query.ilike("faculty", `%${filters.faculty}%`)
    if (filters.department) query = query.ilike("department", `%${filters.department}%`)
    if (filters.semester) query = query.ilike("semester", `%${filters.semester}%`)
    if (filters.term) query = query.ilike("term", `%${filters.term}%`)
    if (filters.lecturer) query = query.ilike("lecturer", `%${filters.lecturer}%`)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, count } = await query.range(from, to)
    setNotes(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [filters, page, sort, supabase])

  useEffect(() => {
    updateUrl(filters, page, sort)
    fetchNotes()
  }, [filters, page, sort, updateUrl, fetchNotes])

  const handleFilterChange = (key: string, value: string) => {
    setDraftFilters({ ...draftFilters, [key]: value })
    if (key === "file_type") {
      setFilters({ ...filters, file_type: value })
      setPage(1)
    } else {
      setPage(1)
    }
  }

  const applySuggestion = (key: "institution" | "course_code", value: string) => {
    setDraftFilters({ ...draftFilters, [key]: value })
    setFilters({ ...filters, [key]: value })
    setPage(1)
    if (key === "institution") setShowInstSug(false)
    if (key === "course_code") setShowCourseSug(false)
  }

  const clearFilters = () => {
    setFilters({ q: "", institution: "", course_code: "", year: "", tag: "", file_type: "", faculty: "", department: "", semester: "", term: "", lecturer: "" })
    setDraftFilters({ q: "", institution: "", course_code: "", year: "", tag: "", file_type: "", faculty: "", department: "", semester: "", term: "", lecturer: "" })
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

  const filteredInst = instSuggestions.filter(s => s.toLowerCase().includes((draftFilters.institution || "").toLowerCase())).slice(0, 8)
  const filteredCourse = courseSuggestions.filter(s => s.toLowerCase().includes((draftFilters.course_code || "").toLowerCase())).slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <input placeholder="Search by title or course name..." value={draftFilters.q} onChange={(e) => handleFilterChange("q", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative" ref={instRef}>
            <input placeholder="Institution" value={draftFilters.institution} onChange={(e) => { handleFilterChange("institution", e.target.value); setShowInstSug(true) }} onFocus={() => setShowInstSug(true)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
            {showInstSug && filteredInst.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-sm max-h-40 overflow-auto">
                {filteredInst.map((s) => (
                  <button key={s} type="button" onClick={() => applySuggestion("institution", s)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50">{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={courseRef}>
            <input placeholder="Course/Module code" value={draftFilters.course_code} onChange={(e) => { handleFilterChange("course_code", e.target.value); setShowCourseSug(true) }} onFocus={() => setShowCourseSug(true)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
            {showCourseSug && filteredCourse.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-sm max-h-40 overflow-auto">
                {filteredCourse.map((s) => (
                  <button key={s} type="button" onClick={() => applySuggestion("course_code", s)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50">{s}</button>
                ))}
              </div>
            )}
          </div>
          <input placeholder="Year" value={draftFilters.year} onChange={(e) => handleFilterChange("year", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Tag" value={draftFilters.tag} onChange={(e) => handleFilterChange("tag", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <select value={filters.file_type} onChange={(e) => handleFilterChange("file_type", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="">All file types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <input placeholder="Faculty/Department" value={filters.faculty} onChange={(e) => handleFilterChange("faculty", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Department" value={filters.department} onChange={(e) => handleFilterChange("department", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Semester" value={filters.semester} onChange={(e) => handleFilterChange("semester", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Term" value={filters.term} onChange={(e) => handleFilterChange("term", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Lecturer" value={filters.lecturer} onChange={(e) => handleFilterChange("lecturer", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
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
              {filters.faculty && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Faculty/Dept: {filters.faculty}</span>}
              {filters.department && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Department: {filters.department}</span>}
              {filters.semester && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Semester: {filters.semester}</span>}
              {filters.term && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Term: {filters.term}</span>}
              {filters.lecturer && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Lecturer: {filters.lecturer}</span>}
            </div>
            <button onClick={clearFilters} className="text-xs text-slate-600 hover:text-slate-900">Clear all</button>
          </div>
        )}
        <div className="text-sm text-slate-600 flex items-center justify-between">
          <div>{totalCount} result{totalCount !== 1 ? 's' : ''} found</div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-slate-600">Sort by</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="px-2 py-1 border border-slate-200 rounded-md text-sm"
            >
              <option value="recent">Most recent</option>
              <option value="most_viewed">Most viewed</option>
              <option value="highest_rated">Highest rated</option>
              <option value="most_downloaded">Most downloaded</option>
            </select>
          </div>
        </div>
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
