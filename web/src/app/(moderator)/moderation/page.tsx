import { ModerationQueue } from "@/components/moderation/moderation-queue"

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <h1 className="text-lg font-bold">Moderation Queue</h1>
          </div>
          <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded">MOD</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <ModerationQueue />
      </main>
    </div>
  )
}
