"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_SIZE = 100 * 1024 * 1024

export function UploadForm() {
  const [title, setTitle] = useState("")
  const [institution, setInstitution] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [courseName, setCourseName] = useState("")
  const [year, setYear] = useState("")
  const [tags, setTags] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!ALLOWED_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
      setError("Only PDF and DOCX files are allowed.")
      setFile(null)
      return
    }

    if (selectedFile.size > MAX_SIZE) {
      setError("File too large. Maximum size is 100MB.")
      setFile(null)
      return
    }

    setError("")
    setFile(selectedFile)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      if (!file) {
        setError("Please select a file.")
        setLoading(false)
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('notes').upload(fileName, file, { upsert: false })
      if (uploadError) throw uploadError

      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error: insertError } = await supabase.from('notes').insert({
        uploader_id: user.id,
        title,
        institution,
        course_code: courseCode,
        course_name: courseName,
        year,
        tags: tagArray,
        file_type: fileExt === 'pdf' ? 'pdf' : 'docx',
        file_url: fileName,
        file_size: file.size,
        status: 'pending',
      })

      if (insertError) throw insertError

      router.push("/my-uploads")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-1">File (PDF or DOCX, max 100MB)</label>
        <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} required className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {file && <p className="text-xs text-slate-600 mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-900 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Calculus 1: Integration Techniques" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Institution</label>
          <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. University of Pretoria" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Course Code</label>
          <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. WTW158" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Course Name</label>
          <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Calculus 158" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Year</label>
          <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2025" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-900 mb-1">Tags (comma separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. calculus, integration, exam-prep" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
        <p className="text-xs text-amber-900">All uploads require moderation before becoming visible.</p>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}

      <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Uploading..." : "Submit for moderation"}
      </button>
    </form>
  )
}
