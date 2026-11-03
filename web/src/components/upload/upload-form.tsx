"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_SIZE = 100 * 1024 * 1024

const DOCUMENT_TYPES = [
  "Lecture Notes",
  "Past Paper",
  "Assignment",
  "Tutorial",
  "Lab Report",
  "Other",
] as const

type Course = {
  id: string
  institution: string
  faculty?: string
  course_code: string
  course_name: string
}

export function UploadForm() {
  const [title, setTitle] = useState("")
  const [institution, setInstitution] = useState("")
  const [faculty, setFaculty] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [courseName, setCourseName] = useState("")
  const [courseId, setCourseId] = useState<string>("")
  const [courses, setCourses] = useState<Course[]>([])
  const [showCourseSug, setShowCourseSug] = useState(false)
  const courseRef = useRef<HTMLDivElement>(null)
  const [year, setYear] = useState("")
  const [tags, setTags] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCourses = async () => {
      const { data } = await supabase.from("courses").select("*").order("institution").order("course_code")
      setCourses((data || []) as Course[])
    }
    loadCourses()
  }, [supabase])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (courseRef.current && !courseRef.current.contains(e.target as Node)) setShowCourseSug(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filteredCourses = courses.filter((c) => {
    const q = courseCode.toLowerCase()
    if (!q) return true
    return c.course_code.toLowerCase().includes(q) || c.course_name.toLowerCase().includes(q) || (c.institution || "").toLowerCase().includes(q)
  }).slice(0, 10)

  function selectCourse(c: Course) {
    setCourseId(c.id)
    setInstitution(c.institution)
    if (c.faculty) setFaculty(c.faculty)
    setCourseCode(c.course_code)
    setCourseName(c.course_name)
    setShowCourseSug(false)
  }

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

      const insertData: any = {
        uploader_id: user.id,
        title,
        institution,
        course_code: courseCode,
        course_name: courseName,
        year,
        year_level: yearLevel || null,
        lecturer: lecturer || null,
        tags: tagArray,
        file_type: fileExt === 'pdf' ? 'pdf' : 'docx',
        file_url: fileName,
        file_size: file.size,
        status: 'pending',
        ...(documentType ? { document_type: documentType } : {}),
        ...(faculty ? { faculty } : {}),
        ...(courseId ? { course_id: courseId } : {}),
      }

      const { error: insertError } = await supabase.from('notes').insert(insertData)

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-900 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </div>

        <div className="sm:col-span-2" ref={courseRef}>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Course from catalog (optional)</label>
          <input
            type="text"
            value={courseCode}
            onChange={(e) => {
              setCourseCode(e.target.value)
              setCourseId("")
              setShowCourseSug(true)
            }}
            onFocus={() => setShowCourseSug(true)}
            placeholder="Search course code or name..."
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showCourseSug && filteredCourses.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-w-xl bg-white border border-slate-200 rounded-md shadow-sm max-h-48 overflow-auto">
              {filteredCourses.map((c) => (
                <button key={c.id} type="button" onClick={() => selectCourse(c)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                  <div className="font-medium text-slate-900">{c.course_code} - {c.course_name}</div>
                  <div className="text-xs text-slate-600">{c.institution}{c.faculty ? ` • ${c.faculty}` : ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Institution</label>
          <input type="text" value={institution} onChange={(e) => { setInstitution(e.target.value); setCourseId("") }} placeholder="e.g. University of Pretoria" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Faculty/Department</label>
          <input type="text" value={faculty} onChange={(e) => { setFaculty(e.target.value); setCourseId("") }} placeholder="e.g. EMS" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Course Code</label>
          <input type="text" value={courseCode} onChange={(e) => { setCourseCode(e.target.value); setCourseId("") }} placeholder="e.g. WTW158" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Course Name</label>
          <input type="text" value={courseName} onChange={(e) => { setCourseName(e.target.value); setCourseId("") }} placeholder="e.g. Calculus 158" required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Year Level</label>
          <input type="text" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} placeholder="e.g. 1st Year / Year 1" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Lecturer</label>
          <input type="text" value={lecturer} onChange={(e) => setLecturer(e.target.value)} placeholder="e.g. Dr. Smith" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Document Type</label>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select document type</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-900 mb-1">Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. calculus, past-paper, exam" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
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
