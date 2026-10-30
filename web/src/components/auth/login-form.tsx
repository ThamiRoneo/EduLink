"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/browse")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-1">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. thandi@up.ac.za" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3 flex items-start gap-2">
        <div className="w-4 h-4 mt-0.5 rounded-full bg-cyan-500 flex-shrink-0" />
        <p className="text-xs text-cyan-900">We flag .ac.za emails for student prioritization</p>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}
      <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Signing in..." : "Log in"}
      </button>
    </form>
  )
}
