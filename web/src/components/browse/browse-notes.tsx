"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

type Note = {
  id: string
  title: string
  institution: string
  course_code: string
  course_name: string
  year: string
  year_level?: string
  faculty?: string
  department?: string
  semester?: string
  term?: string
  lecturer?: string
  tags: string[]
  avg_rating: number
  rating_count: number
  view_count: number
  download_count?: number
  created_at: string
  file_type: string
  file_size: number
  page_count?: number
  description?: string
  document_type?: string
  uploader_id?: string
  uploader?: {
    avatar_url?: string | null
    display_name?: string
    institution_affiliation?: string
  }
}

type Course = {
  id: string
  institution: string
  faculty?: string
  course_code: string
  course_name: string
}

const PAGE_SIZE = 12

export function BrowseNotes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [suggestions, setSuggestions] = useState<Note[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    institution: searchParams.get("institution") || "",
    course_code: searchParams.get("course_code") || "",
    year: searchParams.get("year") || "",
    year_level: searchParams.get("year_level") || "",
    tag: searchParams.get("tag") || "",
    file_type: searchParams.get("file_type") || "",
    faculty: searchParams.get("faculty") || "",
    department: searchParams.get("department") || "",
    semester: searchParams.get("semester") || "",
    term: searchParams.get("term") || "",
    lecturer: searchParams.get("lecturer") || "",
    document_type: searchParams.get("document_type") || "",
    course_id: searchParams.get("course_id") || "",
  } as any)
  const [draftFilters, setDraftFilters] = useState(filters as any)
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [sort, setSort] = useState(searchParams.get("sort") || "recent")
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [instSuggestions, setInstSuggestions] = useState<string[]>([])
  const [courseSuggestions, setCourseSuggestions] = useState<string[]>([])
  const [catalogCourses, setCatalogCourses] = useState<Course[]>([])
  const [showInstSug, setShowInstSug] = useState(false)
  const [showCourseSug, setShowCourseSug] = useState(false)
  const [showCatalogSug, setShowCatalogSug] = useState(false)
  const instRef = useRef<HTMLDivElement>(null)
  const courseRef = useRef<HTMLDivElement>(null)
  const catalogRef = useRef<HTMLDivElement>(null)

  const updateUrl = useCallback((newFilters: typeof filters, newPage: number, newSort: string) => {
    const params = new URLSearchParams()
    if (newFilters.q) params.set("q", newFilters.q)
    if (newFilters.institution) params.set("institution", newFilters.institution)
    if (newFilters.course_code) params.set("course_code", newFilters.course_code)
    if (newFilters.year) params.set("year", newFilters.year)
    if (newFilters.year_level) params.set("year_level", newFilters.year_level)
    if (newFilters.tag) params.set("tag", newFilters.tag)
    if (newFilters.file_type) params.set("file_type", newFilters.file_type)
    if (newFilters.faculty) params.set("faculty", newFilters.faculty)
    if (newFilters.department) params.set("department", newFilters.department)
    if (newFilters.semester) params.set("semester", newFilters.semester)
    if (newFilters.term) params.set("term", newFilters.term)
    if (newFilters.lecturer) params.set("lecturer", newFilters.lecturer)
    if (newFilters.document_type) params.set("document_type", newFilters.document_type)
    if (newSort && newSort !== "recent") params.set("sort", newSort)
    if (newPage > 1) params.set("page", newPage.toString())
    const query = params.toString()
    router.replace(query ? `/browse?${query}` : "/browse", { scroll: false })
  }, [router])

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    async function loadUserAndFavs() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from("favorites").select("note_id").eq("user_id", user.id)
        setFavorites(new Set((data || []).map((f: any) => f.note_id)))
      }
    }
    loadUserAndFavs()
  }, [supabase])

  useEffect(() => {
    const t = setTimeout(() => {
      if (
        draftFilters.q !== filters.q ||
        draftFilters.institution !== filters.institution ||
        draftFilters.course_code !== filters.course_code ||
        draftFilters.year !== filters.year ||
        draftFilters.year_level !== filters.year_level ||
        draftFilters.tag !== filters.tag
      ) {
        setFilters({ ...filters, q: draftFilters.q, institution: draftFilters.institution, course_code: draftFilters.course_code, year: draftFilters.year, year_level: draftFilters.year_level, tag: draftFilters.tag })
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [draftFilters, filters])

  useEffect(() => {
    const loadSuggestions = async () => {
      const [instRes, courseRes, catRes] = await Promise.all([
        supabase.from("notes").select("institution").eq("status", "approved").limit(1000),
        supabase.from("notes").select("course_code").eq("status", "approved").limit(1000),
        supabase.from("courses").select("*").order("institution").order("course_code").limit(2000),
      ])
      const instSet = new Set<string>()
      const courseSet = new Set<string>()
      ;(instRes.data || []).forEach((r: any) => { if (r.institution) instSet.add(r.institution.trim()) })
      ;(courseRes.data || []).forEach((r: any) => { if (r.course_code) courseSet.add(r.course_code.trim()) })
      setInstSuggestions(Array.from(instSet).sort())
      setCourseSuggestions(Array.from(courseSet).sort())
      setCatalogCourses((catRes.data || []) as Course[])
    }
    loadSuggestions()
  }, [supabase])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (instRef.current && !instRef.current.contains(e.target as Node)) setShowInstSug(false)
      if (courseRef.current && !courseRef.current.contains(e.target as Node)) setShowCourseSug(false)
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) setShowCatalogSug(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("notes")
      .select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)", { count: "exact" })
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
      const q = filters.q.trim()
      if (q) {
        query = query.or(`search_vector.plfts.(${q}),title.ilike.%${q}%,course_name.ilike.%${q}%,description.ilike.%${q}%`)
      }
    }
    if (filters.course_id) query = query.eq("course_id", filters.course_id)
    if (filters.institution) query = query.ilike("institution", `%${filters.institution}%`)
    if (filters.course_code) query = query.ilike("course_code", `%${filters.course_code}%`)
    if (filters.year) query = query.eq("year", filters.year)
    if ((filters as any).year_level) query = query.ilike("year_level", `%${(filters as any).year_level}%`)
    if (filters.tag) query = query.contains("tags", [filters.tag])
    if (filters.file_type) query = query.eq("file_type", filters.file_type)
    if (filters.faculty) query = query.ilike("faculty", `%${filters.faculty}%`)
    if (filters.department) query = query.ilike("department", `%${filters.department}%`)
    if (filters.semester) query = query.ilike("semester", `%${filters.semester}%`)
    if (filters.term) query = query.ilike("term", `%${filters.term}%`)
    if (filters.lecturer) query = query.ilike("lecturer", `%${filters.lecturer}%`)
    if (filters.document_type) query = query.eq("document_type", filters.document_type)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, count } = await query.range(from, to)
    setNotes(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [filters, page, sort, supabase])

  const fetchSuggestions = useCallback(async () => {
    if (loading || notes.length > 0) return
    setSuggestionsLoading(true)
    let query = supabase
      .from("notes")
      .select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)")
      .eq("status", "approved")

    const hasContext = filters.institution || filters.course_code || filters.course_id || filters.faculty || filters.department || filters.tag
    if (filters.course_id) {
      query = query.eq("course_id", filters.course_id)
    } else if (filters.course_code && filters.institution) {
      query = query.ilike("course_code", `%${filters.course_code}%`).ilike("institution", `%${filters.institution}%`)
    } else if (filters.course_code) {
      query = query.ilike("course_code", `%${filters.course_code}%`)
    } else if (filters.institution) {
      query = query.ilike("institution", `%${filters.institution}%`)
    } else if (filters.faculty) {
      query = query.ilike("faculty", `%${filters.faculty}%`)
    } else if (filters.department) {
      query = query.ilike("department", `%${filters.department}%`)
    } else if (filters.tag) {
      query = query.contains("tags", [filters.tag])
    }

    query = query.order("view_count", { ascending: false }).order("avg_rating", { ascending: false }).order("created_at", { ascending: false }).limit(6)
    const { data } = await query
    setSuggestions((data || []) as Note[])
    setSuggestionsLoading(false)
  }, [loading, notes.length, filters, supabase])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  useEffect(() => {
    updateUrl(filters, page, sort)
    fetchNotes()
  }, [filters, page, sort, updateUrl, fetchNotes])

  const handleFilterChange = (key: string, value: string) => {
    setDraftFilters({ ...draftFilters, [key]: value })
    if (key === "file_type" || key === "document_type") {
      setFilters({ ...filters, [key]: value })
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

  const applyCatalogCourse = (c: Course) => {
    setFilters({ ...filters, course_id: c.id, institution: c.institution, course_code: c.course_code })
    setDraftFilters({ ...draftFilters, course_id: c.id, institution: c.institution, course_code: c.course_code })
    setPage(1)
    setShowCatalogSug(false)
  }

  const clearFilters = () => {
    setFilters({ q: "", institution: "", course_code: "", year: "", year_level: "", tag: "", file_type: "", faculty: "", department: "", semester: "", term: "", lecturer: "", document_type: "", course_id: "" } as any)
    setDraftFilters({ q: "", institution: "", course_code: "", year: "", year_level: "", tag: "", file_type: "", faculty: "", department: "", semester: "", term: "", lecturer: "", document_type: "", course_id: "" } as any)
    setPage(1)
  }

  const removeFilter = (key: string) => {
    setFilters({ ...filters, [key]: "" } as any)
    setDraftFilters({ ...draftFilters, [key]: "" } as any)
    if (key === "course_id") {
      setFilters({ ...filters, course_id: "", course_code: "", institution: "" } as any)
      setDraftFilters({ ...draftFilters, course_id: "", course_code: "", institution: "" } as any)
    }
    setPage(1)
  }

  const applyMobileFilters = () => {
    setFilters({ ...draftFilters } as any)
    setPage(1)
    setMobileFiltersOpen(false)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasActiveFilters = Object.values(filters).some(v => v !== "")

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileType?: string) => {
    const type = (fileType || "").toLowerCase()
    if (type === "pdf") return "📄"
    if (type === "docx" || type === "doc") return "📝"
    if (type === "pptx" || type === "ppt") return "📊"
    if (type === "xlsx" || type === "xls") return "📈"
    if (type === "txt") return "📃"
    return "📁"
  }

  const filteredInst = instSuggestions.filter(s => s.toLowerCase().includes((draftFilters.institution || "").toLowerCase())).slice(0, 8)
  const filteredCourse = courseSuggestions.filter(s => s.toLowerCase().includes((draftFilters.course_code || "").toLowerCase())).slice(0, 8)
  const filteredCatalog = catalogCourses.filter(c => {
    const q = (draftFilters.course_code || "").toLowerCase()
    if (!q) return true
    return c.course_code.toLowerCase().includes(q) || c.course_name.toLowerCase().includes(q) || c.institution.toLowerCase().includes(q)
  }).slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="md:hidden flex items-center justify-between gap-2">
        <button onClick={() => setMobileFiltersOpen(true)} className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white">Filters{hasActiveFilters ? " •" : ""}</button>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-mobile" className="text-xs text-slate-600">Sort</label>
          <select id="sort-mobile" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }} className="px-2 py-1 border border-slate-200 rounded-md text-sm">
            <option value="recent">Most recent</option>
            <option value="most_viewed">Most viewed</option>
            <option value="highest_rated">Highest rated</option>
            <option value="most_downloaded">Most downloaded</option>
          </select>
        </div>
      </div>
      {hasActiveFilters && (
        <div className="md:hidden flex flex-wrap gap-2">
          {filters.q && <button onClick={() => removeFilter("q")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Search: {filters.q} ✕</button>}
          {(filters as any).course_id && <button onClick={() => { removeFilter("course_id"); setFilters({...(filters as any), course_id:"", course_code:"", institution:""} as any); setDraftFilters({...(draftFilters as any), course_id:"", course_code:"", institution:""} as any); setPage(1) }} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Catalog course ✕</button>}
          {filters.institution && <button onClick={() => removeFilter("institution")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Institution: {filters.institution} ✕</button>}
          {filters.course_code && !(filters as any).course_id && <button onClick={() => removeFilter("course_code")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Course: {filters.course_code} ✕</button>}
          {filters.year && <button onClick={() => removeFilter("year")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Year: {filters.year} ✕</button>}
          {(filters as any).year_level && <button onClick={() => removeFilter("year_level")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Year Level: {(filters as any).year_level} ✕</button>}
          {filters.tag && <button onClick={() => removeFilter("tag")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Tag: {filters.tag} ✕</button>}
          {filters.file_type && <button onClick={() => removeFilter("file_type")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Type: {filters.file_type.toUpperCase()} ✕</button>}
          {filters.document_type && <button onClick={() => removeFilter("document_type")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Document: {filters.document_type} ✕</button>}
          {filters.faculty && <button onClick={() => removeFilter("faculty")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Faculty/Dept: {filters.faculty} ✕</button>}
          {filters.department && <button onClick={() => removeFilter("department")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Department: {filters.department} ✕</button>}
          {filters.semester && <button onClick={() => removeFilter("semester")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Semester: {filters.semester} ✕</button>}
          {filters.term && <button onClick={() => removeFilter("term")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Term: {filters.term} ✕</button>}
          {filters.lecturer && <button onClick={() => removeFilter("lecturer")} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Lecturer: {filters.lecturer} ✕</button>}
        </div>
      )}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <input placeholder="Search by title or course name..." value={draftFilters.q} onChange={(e) => handleFilterChange("q", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <div className="relative sm:col-span-2" ref={catalogRef}>
            <input
              placeholder="Course from catalog"
              value={filters.course_id ? (catalogCourses.find(c=>c.id===filters.course_id)?.course_code + " - " + catalogCourses.find(c=>c.id===filters.course_id)?.course_name) : draftFilters.course_code}
              onChange={(e) => {
                setDraftFilters({ ...draftFilters, course_code: e.target.value, course_id: "" })
                setFilters({ ...filters, course_id: "" })
                setShowCatalogSug(true)
              }}
              onFocus={() => setShowCatalogSug(true)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
            {showCatalogSug && filteredCatalog.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-sm max-h-48 overflow-auto">
                {filteredCatalog.map((c) => (
                  <button key={c.id} type="button" onClick={() => applyCatalogCourse(c)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <div className="font-medium text-slate-900">{c.course_code} - {c.course_name}</div>
                    <div className="text-xs text-slate-600">{c.institution}{c.faculty ? ` • ${c.faculty}` : ""}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <input placeholder="Year Level" value={(draftFilters as any).year_level || ""} onChange={(e) => handleFilterChange("year_level", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <input placeholder="Tag" value={draftFilters.tag} onChange={(e) => handleFilterChange("tag", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          <select value={filters.file_type} onChange={(e) => handleFilterChange("file_type", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="">All file types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
          </select>
          <select value={filters.document_type} onChange={(e) => handleFilterChange("document_type", e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm">
            <option value="">All document types</option>
            <option value="Lecture Notes">Lecture Notes</option>
            <option value="Past Paper">Past Paper</option>
            <option value="Assignment">Assignment</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Other">Other</option>
          </select>
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
              {filters.course_id && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Catalog course</span>}
              {filters.institution && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Institution: {filters.institution}</span>}
              {filters.course_code && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Course: {filters.course_code}</span>}
              {filters.year && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Year: {filters.year}</span>}
              {(filters as any).year_level && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Year Level: {(filters as any).year_level}</span>}
              {filters.file_type && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Type: {filters.file_type.toUpperCase()}</span>}
              {filters.document_type && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Document: {filters.document_type}</span>}
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
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-slate-600 mb-4 text-center">No notes match your filters.</p>
          {(suggestionsLoading || suggestions.length > 0) && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900 text-center">
                {hasActiveFilters ? "Related/popular notes" : "Popular notes"}
              </p>
              {suggestionsLoading ? (
                <div className="text-center py-4 text-slate-600 text-sm">Loading suggestions...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((note) => (
                    <Link key={note.id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{note.title}</h3>
                      <div className="text-xs text-slate-600 space-y-1 mb-2">
                        <p>{note.course_code} • {note.course_name}</p>
                        <p className="text-slate-500">{note.institution}{note.year ? ` • ${note.year}` : ""}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>★ {note.avg_rating?.toFixed(1) || "0.0"} ({note.rating_count || 0})</span>
                        <span>{note.view_count || 0} views</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="text-center mt-4">
            <Link href="/upload" className="text-sm text-blue-600 hover:underline">Upload notes for this course</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => {
              const isFav = favorites.has(note.id)
              async function toggleFav(e: React.MouseEvent) {
                e.preventDefault()
                e.stopPropagation()
                if (!user) {
                  router.push("/login")
                  return
                }
                if (isFav) {
                  await supabase.from("favorites").delete().eq("note_id", note.id).eq("user_id", user.id)
                  setFavorites(prev => { const n = new Set(prev); n.delete(note.id); return n })
                } else {
                  await supabase.from("favorites").insert({ note_id: note.id, user_id: user.id })
                  setFavorites(prev => new Set(prev).add(note.id))
                }
              }
              const cred = note.uploader?.institution_affiliation || note.institution
              const yearCred = note.year
              return (
                <Link key={note.id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow relative">
                  <button onClick={toggleFav} className="absolute top-2 right-2 text-lg" title={isFav ? "Remove from favorites" : "Add to favorites"}>
                    {isFav ? "★" : "☆"}
                  </button>
                  <div className="flex items-start gap-2 mb-2 pr-6">
                    <span className="text-lg leading-none" title={note.file_type?.toUpperCase()}>{getFileIcon(note.file_type)}</span>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1">{note.title}</h3>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 mb-2">
                    <p>{note.course_code} • {note.course_name}</p>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      {note.uploader?.avatar_url ? (
                        <Image src={note.uploader.avatar_url} alt="" width={16} height={16} className="h-4 w-4 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <span className="h-4 w-4 rounded-full bg-slate-200 text-[9px] font-semibold text-slate-600 flex items-center justify-center shrink-0">
                          {(note.uploader?.display_name || cred || "?").trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="truncate">{cred}{yearCred ? ` • ${yearCred}` : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {note.document_type && (
                      <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">{note.document_type}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>★ {note.avg_rating?.toFixed(1) || "0.0"} ({note.rating_count || 0})</span>
                    <span>{note.view_count || 0} views • {note.download_count || 0} downloads</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="uppercase flex items-center gap-1">{getFileIcon(note.file_type)} {note.file_type}</span>
                    <span>{formatFileSize(note.file_size)}{note.page_count ? ` • ${note.page_count} ${note.page_count === 1 ? "page" : "pages"}` : ""}</span>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
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
