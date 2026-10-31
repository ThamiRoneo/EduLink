"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const INSTITUTIONS = ["University of Pretoria", "University of Cape Town", "University of the Witwatersrand", "Rhodes University", "Stellenbosch University", "University of KwaZulu-Natal", "North-West University"];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [filterInst, setFilterInst] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-background" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-black">EduLink</h1>
              <p className="text-xs text-black/70">Academic Network</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 text-black hover:opacity-80"
                  aria-label="Profile menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm hidden sm:inline">{user.user_metadata?.display_name || user.email}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 rounded-md shadow-lg py-1 z-50">
                    <Link href="/browse" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setOpen(false)}>Browse</Link>
                    <Link href="/upload" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setOpen(false)}>Upload</Link>
                    <Link href="/my-uploads" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setOpen(false)}>My Uploads</Link>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setOpen(false)}>Favorites</Link>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setOpen(false)}>Profile</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-black hover:opacity-80">Log in</Link>
                <Link href="/register" className="text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded-md hover:bg-primary/90">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.88] tracking-tight mb-6 text-black">
                Share<br/>and discover<br/>academic notes
              </h2>
              <p className="text-lg sm:text-xl text-black/80 mb-8 max-w-xl">
                Connect across South African universities. Share lecture notes and study guides with moderation before publication.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/browse" className="bg-primary text-white px-6 py-3 text-center rounded-md hover:bg-primary/90">
                  Browse notes
                </Link>
                <Link href="/upload" className="bg-primary text-white px-6 py-3 text-center rounded-md hover:bg-primary/90">
                  Upload notes
                </Link>
              </div>
            </div>
            <div className="relative">
              <img src="/edulink-assets/university-of-pretoria-campus-plan-1930.jpg" alt="Historic map of University of Pretoria campus" className="w-full h-[320px] sm:h-[420px] object-cover border border-black/10" loading="eager" />
              <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded">SA campuses</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Find by institution</h3>
              <p className="text-muted-foreground max-w-2xl">Filter approved notes by university, course, year and tags.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INSTITUTIONS.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setFilterInst(filterInst === inst ? "" : inst)}
                  className={`px-3 py-2 text-sm rounded-md border ${filterInst === inst ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:bg-secondary"}`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <img src="/edulink-assets/university-of-pretoria-campus-plan-1930.jpg" alt="University of Pretoria campus" className="w-full h-[160px] object-cover" loading="lazy" />
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">University of Pretoria</div>
                <div className="font-semibold text-foreground">Notes & Summaries</div>
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <img src="/edulink-assets/tugwell-hall-cape-town-south-africa.jpg" alt="Tugwell Hall, Cape Town" className="w-full h-[160px] object-cover" loading="lazy" />
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">University of Cape Town</div>
                <div className="font-semibold text-foreground">Engineering Notes</div>
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <img src="/edulink-assets/south-africa-east-london-rhodes-fort-hare.jpg" alt="Historic university building" className="w-full h-[160px] object-cover" loading="lazy" />
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Rhodes University</div>
                <div className="font-semibold text-foreground">Past Papers & Summaries</div>
              </div>
            </div>
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <img src="/edulink-assets/nwu.jpg" alt="North-West University Potchefstroom campus" className="w-full h-[160px] object-cover" loading="lazy" />
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">North-West University</div>
                <div className="font-semibold text-foreground">Potchefstroom Campus Notes</div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link href={filterInst ? `/browse?institution=${encodeURIComponent(filterInst)}` : "/browse"} className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90">
              Browse {filterInst ? filterInst : "all"} notes
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-accent/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-bold text-foreground mb-2">Upload with clarity</h3>
              <p className="text-muted-foreground">PDF and DOCX up to 100MB. All uploads go pending until a moderator approves.</p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-bold text-foreground mb-2">Moderated trust</h3>
              <p className="text-muted-foreground">.ac.za student emails are prioritized. Only approved notes are public.</p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-bold text-foreground mb-2">Rate and review</h3>
              <p className="text-muted-foreground">Ratings, reviews, favorites, reports and view counts keep quality high.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4">Built for SA students</h3>
              <p className="text-white/90 mb-6">Free to browse. Share what helped you pass.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="bg-white text-primary px-6 py-3 text-center rounded-md hover:bg-white/90">Get started</Link>
                <Link href="/browse" className="border border-white text-white px-6 py-3 text-center rounded-md hover:bg-white/10">Browse notes</Link>
              </div>
            </div>
            <div className="text-sm text-white/80 space-y-1">
              <div>Images: University of Pretoria Campus plan 1930 (public domain), Tugwell Hall Cape Town by Olga Ernst CC BY-SA 4.0, Rhodes/Fort Hare Wool Exchange by Bfluff CC BY-SA 3.0, NWU by Barry Ne CC BY-SA 4.0 (via Wikimedia Commons)</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
