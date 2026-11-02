import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to home
          </Link>
        </div>
      </header>
      <div className="p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="text-center">
                  <h1 className="text-lg font-black uppercase tracking-tight text-black">EduLink</h1>
                  <p className="text-xs text-black/70">Academic Network</p>
                </div>
              </Link>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
                <p className="text-sm text-slate-600">Log in to access your saved academic notes and study materials.</p>
              </div>
              <LoginForm />
            </div>
            <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">Connected to South African Academic Collective</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
