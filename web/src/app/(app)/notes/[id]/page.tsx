import { NoteDetail } from "@/components/notes/note-detail"
import { Suspense } from "react"

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <NoteDetail noteId={id} />
        </Suspense>
      </main>
    </div>
  )
}
