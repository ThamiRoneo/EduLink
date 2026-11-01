import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Upload a note</h2>
            <p className="text-sm text-muted-foreground mt-1">Share your lecture summaries or study guides. All uploads require moderation before becoming visible.</p>
          </div>
          <div className="p-6">
            <UploadForm />
          </div>
        </div>
      </main>
    </div>
  )
}
