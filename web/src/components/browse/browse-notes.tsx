"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { UserAvatar } from "@/components/ui/user-avatar"
import { NoteCover } from "@/components/notes/note-cover"
import { getNoteThumbnailUrl } from "@/lib/utils/note-thumbnail"

const DOCUMENT_TYPES = ["Handwritten Notes", "Lecture Slides", "Summary / Study Guide", "Textbook Excerpt", "Assignment / Problem Set", "Past Exam", "Lab Report", "Other"] as const
const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Images" },
  { value: "docx", label: "Word" },
  { value: "ppt", label: "PowerPoint" },
  { value: "markdown", label: "Markdown" },
  { value: "text", label: "Text" },
] as const
const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "rating", label: "Top rated" },
  { value: "views", label: "Most viewed" },
  { value: "downloads", label: "Most downloaded" },
] as const
const MIN_RATING_OPTIONS = [
  { value: "", label: "Any" },
  { value: "4", label: "4+" },
  { value: "3", label: "3+" },
  { value: "2", label: "2+" },
] as const

const PAGE_SIZE = 24

type NoteRow = {
  id: string
  title?: string
  institution?: string
  course_code?: string
  course_name?: string
  document_type?: string
  year?: number | null
  file_type?: string
  file_size?: number
  view_count?: number
  download_count?: number
  rating_avg?: number | null
  thumbnail_path?: string | null
  uploader?: {
    avatar_url?: string | null
    display_name?: string | null
    institution_affiliation?: string | null
  } | null
}

export function BrowseNotes() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [institution, setInstitution] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [year, setYear] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [fileType, setFileType] = useState("")
  const [minRating, setMinRating] = useState("")
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("recent")
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [offset, setOffset] = useState(0)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const qParam = params.get("q") || ""
      const inst = params.get("institution") || ""
      const code = params.get("course_code") || ""
      const yr = params.get("year") || ""
      const dt = params.get("document_type") || ""
      const ft = params.get("file_type") || ""
      const mr = params.get("min_rating") || ""
      const s = params.get("sort")
      setSearch(qParam)
      setSearchInput(qParam)
      setInstitution(inst)
      setCourseCode(code)
      setYear(yr)
      setDocumentType(DOCUMENT_TYPES.includes(dt as (typeof DOCUMENT_TYPES)[number]) ? dt : "")
      setFileType(FILE_TYPES.some((o) => o.value === ft) ? ft : "")
      setMinRating(MIN_RATING_OPTIONS.some((o) => o.value === mr) ? mr : "")
      setSort(SORT_OPTIONS.some((o) => o.value === s) ? (s as typeof sort) : "recent")
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
      setOffset(0)
    }, 250)
    return () => clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (institution) params.set("institution", institution)
      if (courseCode) params.set("course_code", courseCode)
      if (year) params.set("year", year)
      if (documentType) params.set("document_type", documentType)
      if (fileType) params.set("file_type", fileType)
      if (minRating) params.set("min_rating", minRating)
      if (sort !== "recent") params.set("sort", sort)
      const qs = params.toString()
      const url = qs ? `/browse?${qs}` : "/browse"
      window.history.replaceState(null, "", url)
    } catch {
      // ignore
    }
  }, [search, institution, courseCode, year, documentType, fileType, minRating, sort])

  useEffect(() => {
    setOffset(0)
  }, [search, institution, courseCode, year, documentType, fileType, minRating, sort])

  const highlight = (text?: string) => {
    if (!text) return null
    if (!search) return text
    try {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`(${escaped})`, "ig")
      const parts = text.split(regex)
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-slate-900 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )
    } catch {
      return text
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      let query = supabase
        .from("notes")
        .select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)", { count: "exact" })
        .eq("status", "approved")

      const applyOrder = (q: typeof query) => {
        switch (sort) {
          case "rating":
            return q.order("rating_avg", { ascending: false, nullsFirst: false }).order("rating_count", { ascending: false }).order("approved_at", { ascending: false })
          case "views":
            return q.order("view_count", { ascending: false }).order("approved_at", { ascending: false })
          case "downloads":
            return q.order("download_count", { ascending: false }).order("approved_at", { ascending: false })
          case "recent":
          default:
            return q.order("approved_at", { ascending: false })
        }
      }

      if (search) query = query.or(`title.ilike.%${search}%,course_code.ilike.%${search}%,course_name.ilike.%${search}%`)
      if (institution) query = query.ilike("institution", `%${institution}%`)
      if (courseCode) query = query.ilike("course_code", `%${courseCode}%`)
      if (year) query = query.eq("year", parseInt(year))
      if (documentType) query = query.eq("document_type", documentType)
      if (fileType) query = query.eq("file_type", fileType)
      if (minRating) query = query.gte("rating_avg", parseFloat(minRating))

      const { data, error: qerr, count } = await applyOrder(query).range(0, PAGE_SIZE - 1)
      if (cancelled) return
      if (qerr) {
        if (!search && !institution && !courseCode && !year && !documentType && !fileType && !minRating) {
          const fallback = await supabase
            .from("notes")
            .select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .range(0, PAGE_SIZE - 1)
          if (cancelled) return
          if (fallback.error) {
            setError(fallback.error.message)
            setNotes([])
            setTotal(null)
          } else {
            setNotes((fallback.data as NoteRow[]) || [])
            setTotal(null)
          }
        } else {
          setError(qerr.message)
          setNotes([])
          setTotal(null)
        }
      } else {
        setNotes((data as NoteRow[]) || [])
        setTotal(typeof count === "number" ? count : null)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [search, institution, courseCode, year, documentType, fileType, minRating, sort, supabase])

  async function loadMore() {
    const nextOffset = offset + PAGE_SIZE
    setLoadingMore(true)
    try {
      let query = supabase
        .from("notes")
        .select("*, uploader:profiles(avatar_url, display_name, institution_affiliation)")
        .eq("status", "approved")
      const applyOrder = (q: typeof query) => {
        switch (sort) {
          case "rating":
            return q.order("rating_avg", { ascending: false, nullsFirst: false }).order("rating_count", { ascending: false }).order("approved_at", { ascending: false })
          case "views":
            return q.order("view_count", { ascending: false }).order("approved_at", { ascending: false })
          case "downloads":
            return q.order("download_count", { ascending: false }).order("approved_at", { ascending: false })
          case "recent":
          default:
            return q.order("approved_at", { ascending: false })
        }
      }
      if (search) query = query.or(`title.ilike.%${search}%,course_code.ilike.%${search}%,course_name.ilike.%${search}%`)
      if (institution) query = query.ilike("institution", `%${institution}%`)
      if (courseCode) query = query.ilike("course_code", `%${courseCode}%`)
      if (year) query = query.eq("year", parseInt(year))
      if (documentType) query = query.eq("document_type", documentType)
      if (fileType) query = query.eq("file_type", fileType)
      if (minRating) query = query.gte("rating_avg", parseFloat(minRating))
      const { data, error: qerr } = await applyOrder(query).range(nextOffset, nextOffset + PAGE_SIZE - 1)
      if (!qerr && data) {
        setNotes((prev) => [...prev, ...(data as NoteRow[])])
        setOffset(nextOffset)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const activeFilterCount = [institution, courseCode, year, documentType, fileType, minRating].filter(Boolean).length

  const clearFilters = () => {
    setSearchInput("")
    setSearch("")
    setInstitution("")
    setCourseCode("")
    setYear("")
    setDocumentType("")
    setFileType("")
    setMinRating("")
    setSort("recent")
    setOffset(0)
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const removeChip = (key: "institution" | "courseCode" | "year" | "documentType" | "fileType" | "minRating" | "search") => {
    if (key === "search") { setSearchInput(""); setSearch("") }
    if (key === "institution") setInstitution("")
    if (key === "courseCode") setCourseCode("")
    if (key === "year") setYear("")
    if (key === "documentType") setDocumentType("")
    if (key === "fileType") setFileType("")
    if (key === "minRating") setMinRating("")
  }

  const chips = [
    search ? { key: "search" as const, label: `Search: ${search}` } : null,
    institution ? { key: "institution" as const, label: `Institution: ${institution}` } : null,
    courseCode ? { key: "courseCode" as const, label: `Course: ${courseCode}` } : null,
    year ? { key: "year" as const, label: `Year: ${year}` } : null,
    documentType ? { key: "documentType" as const, label: documentType } : null,
    fileType ? { key: "fileType" as const, label: FILE_TYPES.find((o) => o.value === fileType)?.label || fileType } : null,
    minRating ? { key: "minRating" as const, label: `Rating ${minRating}+` } : null,
  ].filter(Boolean) as { key: "institution" | "courseCode" | "year" | "documentType" | "fileType" | "minRating" | "search"; label: string }[]

  const hasMore = total != null ? notes.length < total : notes.length > 0 && notes.length % PAGE_SIZE === 0

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          {error.includes("JWT") || error.includes("401") ? "Please sign in to browse notes." : error}
        </div>
      )}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            placeholder="Search by title or course code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
          />
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
              aria-label="Sort notes"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="px-3 py-2 text-sm rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 whitespace-nowrap"
            >
              {showFilters ? "Hide filters" : "Filters"}
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-slate-900 text-white text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {showFilters && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <input type="text" placeholder="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
              <input type="text" placeholder="Course code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
              <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white">
                <option value="">All doc types</option>
                {DOCUMENT_TYPES.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
              </select>
              <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white">
                <option value="">All file types</option>
                {FILE_TYPES.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white">
                {MIN_RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value ? `Rating ${o.label}` : "Any rating"}</option>)}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-800 underline">Clear all filters</button>
            )}
          </>
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c.key} type="button" onClick={() => removeChip(c.key)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs hover:bg-slate-200">
                <span className="max-w-[14rem] truncate">{c.label}</span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-slate-500">
          {total != null ? `${total.toLocaleString()} result${total === 1 ? "" : "s"}` : `${notes.length} result${notes.length === 1 ? "" : "s"}`}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-slate-100" />
              <div className="p-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3">
          <p className="text-slate-700 font-medium">No notes match your search.</p>
          <p className="text-sm text-slate-500">Try different keywords or clear filters to explore available notes.</p>
          {(chips.length > 0 || sort !== "recent") && (
            <button type="button" onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear search & filters</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg overflow-hidden p-0 hover:shadow-sm transition-shadow block">
                <NoteCover thumbnailUrl={getNoteThumbnailUrl(supabase, note.thumbnail_path)} fileType={note.file_type} documentType={note.document_type} title={note.title} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{highlight(note.title)}</h3>
                    {note.file_type && (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {note.file_type}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    {note.institution && <p className="truncate">{highlight(note.institution)}</p>}
                    {(note.course_code || note.course_name) && (
                      <p className="truncate">
                        {highlight(note.course_code || "")}
                        {note.course_code && note.course_name ? " • " : ""}
                        {highlight(note.course_name || "")}
                      </p>
                    )}
                    {note.document_type && <p className="text-purple-700">{note.document_type}</p>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {typeof note.year === "number" && <span>{note.year}</span>}
                    {note.rating_avg != null && <span>★ {Number(note.rating_avg).toFixed(1)}</span>}
                    {typeof note.view_count === "number" && <span>{note.view_count.toLocaleString()} views</span>}
                    {typeof note.download_count === "number" && <span>{note.download_count.toLocaleString()} downloads</span>}
                    {note.file_size ? <span>{formatSize(note.file_size)}</span> : null}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                    <UserAvatar avatarUrl={note.uploader?.avatar_url} name={note.uploader?.display_name} size={16} className="border border-slate-200" />
                    <span className="truncate">
                      {note.uploader?.display_name || "Unknown uploader"}
                      {note.uploader?.institution_affiliation ? ` • ${note.uploader.institution_affiliation}` : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button type="button" onClick={loadMore} disabled={loadingMore} className="px-4 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
