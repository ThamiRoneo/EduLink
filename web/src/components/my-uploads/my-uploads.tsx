"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserAvatar } from "@/components/ui/user-avatar"

type StatusFilter = "all" | "pending" | "approved" | "rejected"

function formatFileSize(bytes: number) {
  if (!bytes) return ""
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function formatDate(date: string) {
  if (!date) return ""
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}

export function MyUploads() {
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ avatar_url?: string | null; display_name?: string | null } | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const [{ data }, { data: profileData }] = await Promise.all([
      supabase
        .from("notes")
        .select("*")
        .eq("uploader_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("avatar_url, display_name").eq("id", user.id).maybeSingle(),
    ])
    setUploads(data || [])
    setProfile(profileData ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [router, supabase])

  async function handleDelete(note: any) {
    if (note.status !== "pending") return
    const confirmed = confirm("Delete this pending upload? This cannot be undone.")
    if (!confirmed) return
    setDeletingId(note.id)
    setActionError(null)
    try {
      const { error } = await supabase.from("notes").delete().eq("id", note.id).eq("uploader_id", note.uploader_id)
      if (error) throw error
      if (note.file_url) {
        try {
          await supabase.storage.from("notes").remove([note.file_url])
        } catch (_) {}
      }
      setUploads((prev) => prev.filter((u) => u.id !== note.id))
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete upload")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredUploads = useMemo(() => {
    const q = search.toLowerCase().trim()
    return uploads.filter((note) => {
      if (statusFilter !== "all" && note.status !== statusFilter) return false
      if (!q) return true
      const title = (note.title || "").toLowerCase()
      const code = (note.course_code || "").toLowerCase()
      return title.includes(q) || code.includes(q)
    })
  }, [uploads, statusFilter, search])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="space-y-2 w-full">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-1/3 mt-3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {profile && (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <UserAvatar avatarUrl={profile.avatar_url} name={profile.display_name} size={24} className="border border-slate-200" />
          <span className="font-medium">{profile.display_name || "Your uploads"}</span>
        </div>
      )}
      {actionError && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {actionError}
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-md border touch-manipulation ${
                statusFilter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or course code"
          className="w-full sm:w-64 px-3 py-2 text-sm border border-slate-200 rounded-md"
        />
      </div>
      {filteredUploads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-700 font-medium mb-1">No uploads match your filters.</p>
        </div>
      ) : (
        filteredUploads.map((note) => (
          <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-900">{note.title}</h3>
                <p className="text-sm text-slate-600">
                  {note.institution} • {note.course_code} • {note.year}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  note.status === "approved"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : note.status === "rejected"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {note.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {note.file_type && <span className="uppercase">{note.file_type}</span>}
              {note.file_size ? <span>{formatFileSize(note.file_size)}</span> : null}
              {note.created_at && <span>Uploaded {formatDate(note.created_at)}</span>}
              {note.status === "approved" && note.approved_at && <span>Approved {formatDate(note.approved_at)}</span>}
              {note.status === "approved" && (
                <span>
                  {(note.view_count ?? 0).toLocaleString()} views • {(note.download_count ?? 0).toLocaleString()} downloads
                </span>
              )}
            </div>
            {note.status === "rejected" && note.rejection_reason && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-900">
                  <strong>Rejection reason:</strong> {note.rejection_reason}
                </p>
              </div>
            )}
            {note.status === "approved" && (
              <Link href={`/notes/${note.id}`} className="text-sm text-blue-600 hover:underline mt-3 inline-block touch-manipulation">
                View note
              </Link>
            )}
            {(note.status === "pending" || note.status === "rejected") && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <Link href={`/upload?edit=${note.id}`} className="text-sm px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50">
                  Edit
                </Link>
                {note.status === "pending" && (
                  <button
                    onClick={() => handleDelete(note)}
                    disabled={deletingId === note.id}
                    className="text-sm px-3 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === note.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
