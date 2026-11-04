"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
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
  const [description, setDescription] = useState("")
  const [institution, setInstitution] = useState("")
  const [faculty, setFaculty] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [courseName, setCourseName] = useState("")
  const [courseId, setCourseId] = useState<string>("")
  const [courses, setCourses] = useState<Course[]>([])
  const [showCourseSug, setShowCourseSug] = useState(false)
  const courseRef = useRef<HTMLDivElement>(null)
  const [year, setYear] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [yearLevel, setYearLevel] = useState("")
  const [semester, setSemester] = useState("")
  const [term, setTerm] = useState("")
  const [lecturer, setLecturer] = useState("")
  const [tags, setTags] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
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

  function validateAndSetFile(selectedFile: File) {
    const lowerName = selectedFile.name.toLowerCase()
    const isAllowed =
      ALLOWED_TYPES.includes(selectedFile.type) ||
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc")

    if (!isAllowed) {
      setError("Invalid file type. Only PDF (.pdf), DOCX (.docx), and DOC (.doc) files are allowed.")
      setFile(null)
      return
    }

    if (selectedFile.size > MAX_SIZE) {
      setError("File is too large. Maximum allowed size is 100MB.")
      setFile(null)
      return
    }

    setError("")
    setFile(selectedFile)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      return
    }
    validateAndSetFile(selectedFile)
    e.target.value = ""
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

    if (selectedFile.size === 0) {
      setError("File is empty. Please select a valid file.")
      setFile(null)
      e.target.value = ""
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
        setError("Please select a file to upload.")
        setLoading(false)
        return
      }

      if (!title.trim()) {
        setError("Please provide a title.")
        setLoading(false)
        return
      }

      if (!institution.trim()) {
        setError("Please provide an institution.")
        setLoading(false)
        return
      }

      if (!courseCode.trim()) {
        setError("Please provide a course code.")
        setLoading(false)
        return
      }

      if (!courseName.trim()) {
        setError("Please provide a course name.")
        setLoading(false)
        return
      }

      setUploadProgress(10)

      if (!hasPermission) {
        setError("You must confirm you have permission or rights to upload and share this file.")
        setLoading(false)
        return
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || ""
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      setUploadProgress(30)
      const { error: uploadError } = await supabase.storage.from('notes').upload(fileName, file, { upsert: false })
      if (uploadError) throw uploadError
      setUploadProgress(70)

      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)

      const insertData: any = {
        uploader_id: user.id,
        title,
        description: description || null,
        institution,
        course_code: courseCode,
        course_name: courseName,
        year,
        academic_year: academicYear || null,
        semester: semester || null,
        term: term || null,
        year_level: yearLevel || null,
        lecturer: lecturer || null,
        tags: tagArray,
        file_type: fileExt === 'pdf' ? 'pdf' : fileExt === 'docx' ? 'docx' : 'doc',
        file_url: fileName,
        file_size: file.size,
        status: 'pending',
        ...(documentType ? { document_type: documentType } : {}),
        ...(faculty ? { faculty } : {}),
        ...(courseId ? { course_id: courseId } : {}),
      }

      const { error: insertError } = await supabase.from('notes').insert(insertData)

      if (insertError) throw insertError
      setUploadProgress(100)

      router.push("/my-uploads")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-1">File (PDF, DOCX, or DOC, max 100MB)</label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative w-full border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            onChange={handleFileChange}
            required
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-blue-700">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PDF, DOCX, or DOC (max 100MB)</p>
          </div>
        </div>
        {file && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              {file.name.toLowerCase().endsWith('.pdf') ? (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <text x="12" y="16" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">PDF</text>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <text x="12" y="16" textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold">DOCX</text>
                </svg>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-600">
                  {file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'} • {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-900 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Brief description of the document" />
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
          <label className="block text-sm font-semibold text-slate-900 mb-1">Academic Year</label>
          <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2025/2026" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Semester/Term</label>
          <input type="text" value={semester} onChange={(e) => { setSemester(e.target.value); setTerm(e.target.value) }} placeholder="e.g. Semester 1 / Term 1" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

      <div className="flex items-start gap-3">
        <input
          id="copyright-permission"
          type="checkbox"
          checked={hasPermission}
          onChange={(e) => setHasPermission(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="copyright-permission" className="text-sm text-slate-900">
          I confirm that I have the copyright or necessary permission to upload and share this file. I understand that uploading copyrighted material without permission may violate policies.
        </label>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>}

      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Uploading..." : "Submit for moderation"}
      </button>
    </form>
  )
}
