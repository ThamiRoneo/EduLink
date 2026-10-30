import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <h1 className="text-lg font-bold">Upload Note</h1>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">UP / Wits / UCT</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Upload a note</h2>
            <p className="text-sm text-slate-600 mt-1">Share your lecture summaries or study guides. All uploads require moderation before becoming visible.</p>
          </div>
          <div className="p-6">
            <UploadForm />
          </div>
        </div>
      </main>
    </div>
  )
}
