"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePathname, useRouter } from "next/navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUserMenu(false)
    router.push("/")
    router.refresh()
  }

  const linkClass = (path: string) =>
    pathname?.startsWith(path)
      ? "text-primary font-medium"
      : "text-slate-700 hover:text-primary"

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
            <Link href="/browse" className={linkClass("/browse")}>Browse</Link>
            <Link href="/upload" className={linkClass("/upload")}>Upload</Link>
            <Link href="/my-uploads" className={linkClass("/my-uploads")}>My Uploads</Link>
            <Link href="/favorites" className={linkClass("/favorites")}>Favorites</Link>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setUserMenu(!userMenu)} className={pathname?.startsWith("/profile") ? "text-primary" : "text-slate-700 hover:text-primary"} aria-label="Profile menu">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenu(false)}>Profile</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={linkClass("/login")}>Log in</Link>
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
