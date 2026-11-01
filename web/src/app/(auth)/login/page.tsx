import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back</Link>
        </div>
      </header>
      <div className="p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-black uppercase tracking-tight text-black">EduLink</h1>
                  <p className="text-xs text-black/70">Academic Network</p>
                </div>
              </Link>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hidden sm:inline">UP / Wits / NWU / UCT</span>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-6">
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
