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
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [recentFavorites, setRecentFavorites] = useState<any[]>([])
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
  const [avatarMsg, setAvatarMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
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
      const [{ count: uploadCount }, { count: favCount }] = await Promise.all([
        supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("uploader_id", user.id)
          .eq("status", "approved"),
        supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ])
      setContributionCount(uploadCount || 0)
      setFavoritesCount(favCount || 0)

      const [{ data: uploads }, { data: favorites }] = await Promise.all([
        supabase
          .from("notes")
          .select("id,title,course_code,created_at")
          .eq("uploader_id", user.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("favorites")
          .select("note_id, created_at, notes(id,title,course_code)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
      setRecentUploads(uploads || [])
      setRecentFavorites((favorites || []).map((f: any) => f.notes).filter(Boolean))
      setLoading(false)
    }
    load()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    const payload = {
      display_name: form.display_name,
      bio: form.bio,
      institution: form.institution,
      institution_affiliation: form.institution,
      faculty: form.faculty,
      year_of_study: form.year_of_study,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id)
    if (!error) {
      setProfile({ ...profile, ...payload })
      setEditing(false)
    }
    setSaving(false)
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setAvatarMsg(null)
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      if (!user) return
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        setAvatarMsg({ type: "error", text: "Avatar must be a JPEG, PNG, WebP, or GIF image" })
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setAvatarMsg({ type: "error", text: "Avatar must be 2MB or smaller" })
        return
      }
      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", user.id)
      if (updateError) throw updateError
      setProfile({ ...profile, avatar_url: publicUrl })
      setAvatarMsg({ type: "success", text: "Avatar updated" })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setAvatarMsg({ type: "error", text: "Error uploading avatar" })
    } finally {
      setUploading(false)
      e.target.value = ""
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
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" width={56} height={56} className="h-14 w-14 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-lg font-semibold">
                {(profile?.display_name || user?.email || "?").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Profile</h2>
              <label className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadAvatar} disabled={uploading} className="hidden" />
                {uploading ? "Uploading..." : profile?.avatar_url ? "Change avatar" : "Upload avatar"}
              </label>
              {avatarMsg && <p className={`text-xs mt-1 ${avatarMsg.type === "success" ? "text-green-700" : "text-red-700"}`}>{avatarMsg.text}</p>}
            </div>
          </div>
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
