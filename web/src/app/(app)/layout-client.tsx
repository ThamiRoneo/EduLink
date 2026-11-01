"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePathname, useRouter } from "next/navigation"

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
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
    window.location.reload()
  }

  const linkClass = (path: string) =>
    pathname?.startsWith(path)
      ? "text-primary font-medium"
      : "text-foreground hover:text-primary"

  return (
    <div>
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-black">EduLink</h1>
              <p className="text-xs text-black/70">Academic Network</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/browse" className={linkClass("/browse")}>Browse</Link>
            <Link href="/upload" className={linkClass("/upload")}>Upload</Link>
            <Link href="/my-uploads" className={linkClass("/my-uploads")}>My Uploads</Link>
            <Link href="/favorites" className={linkClass("/favorites")}>Favorites</Link>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setUserMenu(!userMenu)} className={pathname?.startsWith("/profile") ? "text-primary" : "text-foreground hover:text-primary"} aria-label="Profile menu">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenu(false)}>Profile</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-foreground hover:text-primary">Log in</Link>
                <Link href="/register" className="text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded-md hover:bg-primary/90">Register</Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setUserMenu(!userMenu)} className="text-foreground hover:text-primary" aria-label="Profile menu">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg py-1 z-50">
                    <Link href="/browse" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenu(false)}>Browse</Link>
                    <Link href="/upload" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenu(false)}>Upload</Link>
                    <Link href="/my-uploads" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenu(false)}>My Uploads</Link>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenu(false)}>Favorites</Link>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setUserMenu(false)}>Profile</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-sm text-foreground hover:text-primary">Log in</Link>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
