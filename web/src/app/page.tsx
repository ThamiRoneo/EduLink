"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const INSTITUTIONS = ["University of Pretoria", "University of Cape Town", "University of the Witwatersrand", "Rhodes University", "Stellenbosch University", "University of KwaZulu-Natal"];

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
    <main className="min-h-screen" style={{ fontFamily: "'Chivo', system-ui, sans-serif" }}>
      <header className="border-b border-black/10 bg-[#cbe4f2]">
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
                    <Link href="/browse" className="block px-4 py-2 text-sm text-black hover:bg-[#f1e3b5]" onClick={() => setOpen(false)}>Browse</Link>
                    <Link href="/upload" className="block px-4 py-2 text-sm text-black hover:bg-[#f1e3b5]" onClick={() => setOpen(false)}>Upload</Link>
                    <Link href="/my-uploads" className="block px-4 py-2 text-sm text-black hover:bg-[#f1e3b5]" onClick={() => setOpen(false)}>My Uploads</Link>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-black hover:bg-[#f1e3b5]" onClick={() => setOpen(false)}>Favorites</Link>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-black hover:bg-[#f1e3b5]" onClick={() => setOpen(false)}>Profile</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-[#b0298f] hover:bg-[#f1e3b5]">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-black hover:opacity-80">Log in</Link>
                <Link href="/register" className="text-sm bg-[#b0298f] text-white px-3 sm:px-4 py-2 rounded-sm hover:opacity-90">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bg-[#cbe4f2]">
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
                <Link href="/browse" className="bg-[#b0298f] text-white px-6 py-3 text-center font-bold uppercase tracking-tight hover:opacity-90">
                  Browse notes
                </Link>
                <Link href="/upload" className="bg-black text-white px-6 py-3 text-center font-bold uppercase tracking-tight hover:opacity-90">
                  Upload notes
                </Link>
              </div>
            </div>
            <div className="relative">
              <img src="/edulink-assets/university-of-pretoria-campus-plan-1930.jpg" alt="Historic map of University of Pretoria campus" className="w-full h-[320px] sm:h-[420px] object-cover border border-black/10" loading="eager" />
              <div className="absolute bottom-3 left-3 bg-[#ffc013] text-black text-xs px-2 py-1">SA campuses</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1e3b5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h3 className="text-3xl sm:text-5xl font-black uppercase leading-[0.9] tracking-tight text-black mb-3">Find by institution</h3>
              <p className="text-black/80 max-w-2xl">Filter approved notes by university, course, year and tags.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INSTITUTIONS.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setFilterInst(filterInst === inst ? "" : inst)}
                  className={`px-3 py-2 text-sm font-bold uppercase tracking-tight border border-black/20 ${filterInst === inst ? "bg-black text-white" : "bg-white text-black hover:bg-[#cbe4f2]"}`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-black/10 p-4">
              <img src="/edulink-assets/university-of-pretoria-campus-plan-1930.jpg" alt="University of Pretoria campus" className="w-full h-[160px] object-cover mb-3" loading="lazy" />
              <div className="text-xs uppercase tracking-tight text-black/60 mb-1">University of Pretoria</div>
              <div className="font-bold text-black">Notes & Summaries</div>
            </div>
            <div className="bg-white border border-black/10 p-4">
              <img src="/edulink-assets/tugwell-hall-cape-town-south-africa.jpg" alt="Tugwell Hall, Cape Town" className="w-full h-[160px] object-cover mb-3" loading="lazy" />
              <div className="text-xs uppercase tracking-tight text-black/60 mb-1">University of Cape Town</div>
              <div className="font-bold text-black">Engineering Notes</div>
            </div>
            <div className="bg-white border border-black/10 p-4">
              <img src="/edulink-assets/south-africa-east-london-rhodes-fort-hare.jpg" alt="Historic university building" className="w-full h-[160px] object-cover mb-3" loading="lazy" />
              <div className="text-xs uppercase tracking-tight text-black/60 mb-1">Rhodes University</div>
              <div className="font-bold text-black">Past Papers & Summaries</div>
            </div>
            <div className="bg-white border border-black/10 p-4">
              <div className="w-full h-[160px] bg-[#cbe4f2] mb-3 flex items-center justify-center text-black/60 text-xs uppercase tracking-tight">Wits • Stellenbosch • UKZN • UNISA</div>
              <div className="text-xs uppercase tracking-tight text-black/60 mb-1">More Institutions</div>
              <div className="font-bold text-black">Browse all universities</div>
            </div>
          </div>
          <div className="mt-6">
            <Link href={filterInst ? `/browse?institution=${encodeURIComponent(filterInst)}` : "/browse"} className="inline-block bg-black text-white px-6 py-3 font-bold uppercase tracking-tight">
              Browse {filterInst ? filterInst : "all"} notes
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#ffc013]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase leading-[0.9] tracking-tight text-black mb-3">Upload with clarity</h3>
              <p className="text-black/80">PDF and DOCX up to 100MB. All uploads go pending until a moderator approves.</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase leading-[0.9] tracking-tight text-black mb-3">Moderated trust</h3>
              <p className="text-black/80">.ac.za student emails are prioritized. Only approved notes are public.</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase leading-[0.9] tracking-tight text-black mb-3">Rate and review</h3>
              <p className="text-black/80">Ratings, reviews, favorites, reports and view counts keep quality high.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-4xl sm:text-6xl font-black uppercase leading-[0.88] tracking-tight mb-4">Built for SA students</h3>
              <p className="text-white/80 mb-6">Free to browse. Share what helped you pass.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="bg-[#b0298f] text-white px-6 py-3 text-center font-bold uppercase tracking-tight">Get started</Link>
                <Link href="/browse" className="bg-white text-black px-6 py-3 text-center font-bold uppercase tracking-tight">Browse notes</Link>
              </div>
            </div>
            <div className="text-sm text-white/60 space-y-1">
              <div>Images: University of Pretoria Campus plan 1930 (public domain), Tugwell Hall Cape Town by Olga Ernst CC BY-SA 4.0, Rhodes/Fort Hare Wool Exchange by Bfluff CC BY-SA 3.0 (via Wikimedia Commons)</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
