"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function MyUploads() {
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
      {uploads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-4">You haven't uploaded any notes yet.</p>
          <Link href="/upload" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Upload a note</Link>
        </div>
      ) : (
        uploads.map((note) => (
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
