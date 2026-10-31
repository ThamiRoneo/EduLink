"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [supabase])

  return (
    <div>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-slate-900">EduLink</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/browse" className="text-slate-700 hover:text-primary">Browse</Link>
            <Link href="/upload" className="text-slate-700 hover:text-primary">Upload</Link>
            <Link href="/my-uploads" className="text-slate-700 hover:text-primary">My Uploads</Link>
            <Link href="/favorites" className="text-slate-700 hover:text-primary">Favorites</Link>
            {user ? (
              <Link href="/profile" className="text-slate-700 hover:text-primary" aria-label="Profile">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Link>
            ) : (
              <Link href="/login" className="text-slate-700 hover:text-primary">Log in</Link>
            )}
          </div>
        </div>
        {false && open && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-2 text-sm">
              <Link href="/browse" className="py-2 text-slate-700 hover:text-primary" onClick={() => setOpen(false)}>Browse</Link>
              <Link href="/upload" className="py-2 text-slate-700 hover:text-primary" onClick={() => setOpen(false)}>Upload</Link>
              <Link href="/my-uploads" className="py-2 text-slate-700 hover:text-primary" onClick={() => setOpen(false)}>My Uploads</Link>
              <Link href="/favorites" className="py-2 text-slate-700 hover:text-primary" onClick={() => setOpen(false)}>Favorites</Link>
              <Link href="/profile" className="py-2 text-slate-700 hover:text-primary" onClick={() => setOpen(false)}>Profile</Link>
            </div>
          </div>
        )}
      </nav>
      {children}
    </div>
  )
}
