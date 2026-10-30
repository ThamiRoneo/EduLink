import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">EduLink</h1>
              <p className="text-xs text-muted-foreground">Academic Network</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-foreground hover:text-primary">Log in</Link>
            <Link href="/register" className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">Register</Link>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Share and Discover Academic Notes Across South African Universities
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            EduLink connects students from UP, Wits, UCT and more to share lecture notes, study guides, and resources with quality assurance through community moderation.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/browse" className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90">
              Browse Notes
            </Link>
            <Link href="/upload" className="border border-border px-6 py-3 rounded-md hover:bg-secondary">
              Upload Notes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
