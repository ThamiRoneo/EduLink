"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

type StatusFilter = "all" | "pending" | "approved" | "rejected"

export function MyUploads() {
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
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
        .from("notes")
        .select("*")
        .eq("uploader_id", user.id)
        .order("created_at", { ascending: false })
      setUploads(data || [])
      setLoading(false)
    }
    load()
  }, [])

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

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-sm rounded-md border ${
                statusFilter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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
          className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-200 rounded-md"
        />
      </div>
      {filteredUploads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-4">No uploads match your filters.</p>
        </div>
      ) : (
        filteredUploads.map((note) => (
          <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-900">{note.title}</h3>
                <p className="text-sm text-slate-600">{note.institution} • {note.course_code} • {note.year}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                note.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                note.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {note.status}
              </span>
            </div>
            {note.status === 'rejected' && note.rejection_reason && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-900"><strong>Rejection reason:</strong> {note.rejection_reason}</p>
              </div>
            )}
            {note.status === 'approved' && (
              <Link href={`/notes/${note.id}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">View note</Link>
            )}
          </div>
        ))
      )}
    </div>
  )
}
