import { Suspense } from "react"
import AppLayoutClient from "./layout-client"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50">{children}</div>}>
      <AppLayoutClient>{children}</AppLayoutClient>
    </Suspense>
  )
}
