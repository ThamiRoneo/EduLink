"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([])
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
        .from("favorites")
        .select("note_id, notes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setFavorites(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-4">
      {favorites.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-4">You have no favorites yet.</p>
          <Link href="/browse" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-blue-700">Browse notes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const note = fav.notes
            if (!note) return null
            return (
              <Link key={fav.note_id} href={`/notes/${note.id}`} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{note.title}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>{note.institution}</p>
                  <p>{note.course_code} • {note.course_name}</p>
                  <p>Year: {note.year}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
