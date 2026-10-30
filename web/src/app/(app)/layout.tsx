import Link from "next/link"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
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
              <Link href="/profile" className="text-slate-700 hover:text-primary">Profile</Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
