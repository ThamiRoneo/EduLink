"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePathname, useRouter } from "next/navigation"
import { UserAvatar } from "@/components/ui/user-avatar"

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const router = useRouter()
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        setDisplayName(user.user_metadata?.display_name || user.email || null)
        const { data } = await supabase.from("profiles").select("avatar_url, display_name").eq("id", user.id).single()
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
        if (data?.display_name) setDisplayName(data.display_name)
      }
    })
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (desktopMenuOpen && desktopMenuRef.current && !desktopMenuRef.current.contains(target)) {
        setDesktopMenuOpen(false)
      }
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [desktopMenuOpen, mobileMenuOpen])

  async function signOut() {
    await supabase.auth.signOut()
    setDesktopMenuOpen(false)
    setMobileMenuOpen(false)
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
              <div className="relative" ref={desktopMenuRef}>
                <button onClick={() => setDesktopMenuOpen(!desktopMenuOpen)} className={pathname?.startsWith("/profile") ? "text-primary" : "text-foreground hover:text-primary"} aria-label="Profile menu">
                  <UserAvatar avatarUrl={avatarUrl} name={displayName} size={24} />
                </button>
                {desktopMenuOpen && (
                  <div onMouseDown={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" onClick={() => setDesktopMenuOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-secondary">Profile</Link>
                    <button type="button" onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary">Sign out</button>
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
              <div className="relative" ref={mobileMenuRef}>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground hover:text-primary" aria-label="Profile menu">
                  <UserAvatar avatarUrl={avatarUrl} name={displayName} size={24} />
                </button>
                {mobileMenuOpen && (
                  <div onMouseDown={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg py-1 z-50">
                    <Link href="/browse" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>Browse</Link>
                    <Link href="/upload" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>Upload</Link>
                    <Link href="/my-uploads" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>My Uploads</Link>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-secondary">Profile</Link>
                    <button type="button" onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary">Sign out</button>
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
