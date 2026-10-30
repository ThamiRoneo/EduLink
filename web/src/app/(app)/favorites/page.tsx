import { Favorites } from "@/components/favorites/favorites"

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <h1 className="text-lg font-bold">My Favorites</h1>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">UP / Wits / UCT</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Favorites />
      </main>
    </div>
  )
}
