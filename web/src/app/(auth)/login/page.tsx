import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">EduLink</h1>
                <p className="text-xs text-slate-500">Academic Network</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">UP / Wits / UCT</span>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
              <p className="text-sm text-slate-600">Log in to access your saved academic notes and study materials.</p>
            </div>
            <LoginForm />
            <div className="mt-6 text-center text-sm">
              <span className="text-blue-600">Don't have an account? </span>
              <Link href="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">Connected to South African Academic Collective</p>
          </div>
        </div>
      </div>
    </div>
  )
}
