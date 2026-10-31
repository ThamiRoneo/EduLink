"use client"

import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Create account</h1>
                <p className="text-xs text-slate-500">EduLink Academic Network</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">UP / Wits / UCT</span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Create an account</h2>
              <p className="text-sm text-slate-600">Join South Africa's collective university study and resource circle.</p>
            </div>
            <RegisterForm />
          </div>
          <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">Connected to South African Academic Collective</p>
          </div>
        </div>
      </div>
    </div>
  )
}
