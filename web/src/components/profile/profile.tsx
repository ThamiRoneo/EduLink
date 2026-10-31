"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
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
      setUser(user)
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Profile</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Display name:</strong> {profile?.display_name}</p>
          <p><strong>Role:</strong> {profile?.role}</p>
          {profile?.email_flag_acza && <p className="text-blue-600"><strong>.ac.za student</strong></p>}
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/my-uploads" className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">My Uploads</Link>
          <Link href="/favorites" className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Favorites</Link>
          <Link href="/upload" className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Upload Note</Link>
          {(profile?.role === 'moderator' || profile?.role === 'admin') && (
            <Link href="/moderation" className="px-4 py-2 border border-purple-200 text-purple-700 rounded-md text-sm hover:bg-purple-50">Moderation Queue</Link>
          )}
        </div>
      </div>
      <button onClick={signOut} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Sign out</button>
    </div>
  )
}
