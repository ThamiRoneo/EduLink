"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [contributionCount, setContributionCount] = useState(0)
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    institution: "",
    faculty: "",
    year_of_study: "",
  })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
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
      if (data) {
        setForm({
          display_name: data.display_name || "",
          bio: data.bio || "",
          institution: data.institution || data.institution_affiliation || "",
          faculty: data.faculty || "",
          year_of_study: data.year_of_study || "",
        })
      }
      const { count } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("uploader_id", user.id)
        .eq("status", "approved")
      setContributionCount(count || 0)
      setLoading(false)
    }
    load()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      if (!user) return
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (updateError) throw updateError
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords do not match" })
      return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwMsg({ type: "error", text: error.message })
    } else {
      setPwMsg({ type: "success", text: "Password updated" })
      setNewPassword("")
      setConfirmPassword("")
    }
    setPwSaving(false)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Profile</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50">Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50">Cancel</button>
              <button onClick={saveProfile} disabled={saving} className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>
        {!editing ? (
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Display name:</strong> {profile?.display_name}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile?.email_flag_acza && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Verified .ac.za</span>
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{contributionCount} contribution{contributionCount === 1 ? '' : 's'}</span>
            </div>
            {profile?.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
            {(profile?.institution || profile?.institution_affiliation) && <p><strong>Institution:</strong> {profile?.institution || profile?.institution_affiliation}</p>}
            {profile?.faculty && <p><strong>Faculty:</strong> {profile.faculty}</p>}
            {profile?.year_of_study && <p><strong>Year of study:</strong> {profile.year_of_study}</p>}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-slate-700 mb-1">Display name</label>
              <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md" rows={3} />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Institution</label>
              <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Faculty</label>
              <input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Year of study</label>
              <input value={form.year_of_study} onChange={(e) => setForm({ ...form, year_of_study: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md" />
            </div>
          </div>
        )}
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
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Account settings</h2>
        <form onSubmit={changePassword} className="space-y-3 text-sm max-w-md">
          <div>
            <label className="block text-slate-700 mb-1">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md" />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md" />
          </div>
          {pwMsg && <p className={pwMsg.type === "success" ? "text-green-700" : "text-red-700"}>{pwMsg.text}</p>}
          <button disabled={pwSaving} className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">{pwSaving ? "Updating..." : "Change password"}</button>
        </form>
      </div>
      <button onClick={signOut} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50">Sign out</button>
    </div>
  )
}
