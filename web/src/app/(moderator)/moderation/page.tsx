import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ModerationQueue } from "@/components/moderation/moderation-queue"

/**
 * Server-side gate: middleware only enforces auth for /moderation.
 * DB/RLS verification needed (not verified here):
 * - profiles.role readable by the user; role values constrained (moderator/admin).
 * - notes SELECT/UPDATE for moderation limited to moderator/admin roles in RLS.
 * - notes.approved_by/approved_at/status/rejection_reason updates allowed only via trusted path or RLS.
 */
export default async function ModerationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/moderation")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "moderator" && profile?.role !== "admin") {
    redirect("/browse")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <ModerationQueue />
      </main>
    </div>
  )
}
