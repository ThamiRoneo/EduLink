import { ModerationQueue } from "@/components/moderation/moderation-queue"

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <ModerationQueue />
      </main>
    </div>
  )
}
