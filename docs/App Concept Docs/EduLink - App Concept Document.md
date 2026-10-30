# EduLink - App Concept Document

## Title and metadata
- **App name:** EduLink
- **Date:** 2026-10-30
- **Author:** Project team
- **Repository:** [https://github.com/ThamiRoneo/EduLink](https://github.com/ThamiRoneo/EduLink)
- **Version:** 1.0 (Concept)

## One-line pitch
EduLink is a cross-platform student notes-sharing platform for South African universities that lets students upload, discover, rate, and review peer notes (PDF, DOCX) with moderation and quality signals.

## Problem statement
South African university students face persistent barriers to accessing quality study material:
- **Unequal access:** Lecture slides and past notes are often shared informally via WhatsApp groups, creating exclusion for students not in the "right" groups.
- **Affordability:** Commercial note platforms (e.g., Studocu, Course Hero) gatekeep content behind paywalls or require credits.
- **Quality uncertainty:** Students waste time on incomplete/incorrect notes with no reliable quality signal.
- **Discoverability:** Finding notes for a specific module/year/institution is difficult across fragmented channels.
- **Data constraints:** Many students rely on limited mobile data; platforms that don't account for this create friction.

*Evidence (contextual):* South African higher education has high demand for peer learning resources; informal sharing dominates. (Sources to validate further in research phase: DHET reports, NSFAS/usage patterns; platforms like Studocu/Course Hero illustrate demand but highlight paywall/gating issues.)

## Solution
EduLink provides a moderated, searchable repository of student notes where users can:
- Upload notes in **PDF** or **DOCX** (max 100MB)
- Browse/filter by **institution, course/module, year, tags**
- View with a **view count**
- Save with **favorites**
- Rate (1-5 stars) and leave **short reviews/comments**
- **Report** abusive/incorrect notes
- Discover quality via community signals, all under moderation before publication

## Platform
- **v1 targets:** Web-first, with **iOS** and **Android** apps (cross-platform).
- **Geography:** South African universities (prioritize institutions; open to expansion).
- **Auth:** Open registration (email+password); prioritize/flag **.ac.za** student emails in v1.

## Vision
Become the trusted, student-first notes library for South African universities — accessible, quality-assured through community moderation, and discoverable by course context.

## Key terms
- **Institution:** University/TVET in South Africa
- **Course/Module:** Academic course code/name
- **Note:** A study document uploaded by a user (PDF or DOCX)
- **Moderation queue:** Uploads held pending review before becoming visible
- **View count:** Number of times a note was viewed
- **Favorite:** User-saved note
- **Rating:** 1-5 star rating by a user
- **Review/Comment:** Short text feedback on a note
- **Report:** User flag for abuse/incorrectness

## Users and personas

### Persona 1: Thandi - First-year student
- **Age:** 19 | **Location:** Pretoria, Gauteng | **Institution:** UP (example)
- **Device:** Mid-range Android phone, limited data
- **Connectivity:** Mostly mobile data, occasional WiFi on campus
- **Tech comfort:** Comfortable with apps/web
- **Languages:** English, isiZulu
- **Goal:** Find past/module notes quickly without joining 10 WhatsApp groups
- **Frustrations:** Paywalls, notes behind unclear sharing, can't tell if notes are correct
- **How EduLink helps:** Filter by module/year, see ratings/reviews, favorites for offline planning
- **Quote:** *"I just need notes for CSC101 this year that won't cost me data credits or money."*

### Persona 2: Sipho - Senior student (note contributor)
- **Age:** 23 | **Location:** Cape Town, Western Cape | **Institution:** UCT (example)
- **Device:** Android/iOS
- **Tech comfort:** High
- **Languages:** English, isiXhosa
- **Goal:** Help peers and build a reputation by sharing well-structured notes
- **Frustrations:** Notes shared in groups get lost; no credit/feedback
- **How EduLink helps:** Contribute (DOCX/PDF), get ratings/reviews, visibility via institution/module
- **Quote:** *"If I can help someone pass while getting feedback, it's worth uploading."*

## Goals and metrics
| Goal | Metric (target v1) | Measurement |
|---|---|---|
| Accessibility | % notes discoverable via filters (>=80%) | Filter usage analytics |
| Quality assurance | % published notes with >=1 rating or reviewed (>=40%) | Ratings/reviews coverage |
| Trust/safety | % reports actioned within 48h (>=90%) | Moderation SLA tracking |
| Adoption | 1000+ registered users (SA universities) in first 3 months (aspirational) | Registrations |
| Engagement | Avg favorites per active user >= 2 | Favorites |
| Content growth | >= 500 moderated notes across >=10 institutions | Notes count |

## Non-goals (v1)
- **Paywalls/subscriptions/credits:** No monetization in v1
- **Full document editing/viewer with annotations:** Basic PDF/DOCX download/view links only (focus on discovery/sharing)
- **AI summary/chat over notes:** Out of scope
- **Messaging/chat between users:** Out of scope (avoid moderation complexity)
- **Social feeds beyond notes:** No general social feed
- **File types beyond PDF/DOCX:** Only PDF and DOCX
- **Bulk scraping/import:** No automated bulk import
- **Multi-language UI translation:** English-first in v1 (can add later)

## Features (MVP + future)

| Feature | Description | Priority | Goal served | Screens |
|---|---|---|---|---|
| **Auth (register/login)** | Email+password registration/login; flag .ac.za emails | Must | Access control | Login, Register |
| **Upload notes (PDF/DOCX)** | Upload with metadata (institution, course/module, year, tags), max 100MB | Must | Content contribution | Upload |
| **Moderation queue** | Uploads require approval before visible; moderator actions (approve/reject with reason) | Must | Trust/safety | Admin/Moderator queue |
| **Browse & search/filter** | Filter by institution, course/module, year, tags; keyword search | Must | Discoverability | Browse/Home, Search results |
| **Note detail** | View metadata, ratings/reviews, report button, favorite, view count | Must | Quality signals | Note detail |
| **Ratings (1-5)** | Authenticated users can rate a note (once per user per note) | Must | Quality | Note detail |
| **Reviews/comments (short)** | Short text reviews/comments; basic length limits | Must | Quality/context | Note detail |
| **Reports** | Report abusive/incorrect notes with reason/category | Must | Safety | Note detail, Report modal |
| **View count** | Increment on view (deduplicated reasonably) | Must | Popularity signal | Note detail, Browse cards |
| **Favorites** | Save/remove favorites; favorites list per user | Must | Personal curation | Favorites, Note card |
| **User profile** | Basic profile, user's uploads, favorites | Should | Ownership | Profile |
| **Institution/course browsing** | Dedicated browse by institution then course/module | Should | Navigation | Browse by institution/course |
| **My uploads/status** | Track upload status (pending/approved/rejected) with reasons | Should | Contributor feedback | My uploads |

## Business rules
| Rule | Details |
|---|---|
| **File types** | Only `.pdf` and `.docx` allowed |
| **File size** | Max 100MB per upload |
| **Moderation** | All uploads are **pending** until approved by a moderator; only approved notes are visible publicly |
| **Visibility** | Rejected notes visible only to uploader with rejection reason |
| **Ratings** | 1-5 stars; one rating per (user, note). Can update rating? (v1: allow update or replace; define in implementation) |
| **Reviews/comments** | Short reviews/comments; length limit (e.g., 500 chars) to avoid essays; authenticated users only |
| **Reports** | Authenticated users can report; categories (Abuse, Incorrect/ Misleading, Copyright, Other). Notes with reports go to moderation attention |
| **View count** | Count unique views per user/session with deduplication to avoid inflation |
| **Favorites** | Authenticated users only; toggle per note |
| **Auth** | Open registration (email+password). Flag `.ac.za` emails for prioritization/statistics (no hard gate in v1) |
| **Rate limits** | Sensible limits (e.g., uploads: X/day, reports: Y/day) to prevent abuse |
| **Content ownership** | Users retain rights to their uploads; EduLink provides hosting/sharing as described |

## Notifications (v1)
| Trigger | Recipient | Message (example) |
|---|---|---|
| Upload approved | Uploader | "Your note '[title]' has been approved and is now visible on EduLink." |
| Upload rejected | Uploader | "Your note '[title]' was rejected. Reason: [reason]." |
| Report submitted (ack) | Reporter | "Thanks for reporting. We'll review it." |
| Note gets first few ratings (optional) | Uploader (low priority) | Could be deferred to v2 |

## Accounts and sign-in
- **Method:** Email + password (open registration)
- **Email policy:** Accept all emails; flag `.ac.za` addresses (prioritize for student focus)
- **Roles:** `user`, `moderator`, `admin` (RBAC)
- **Profile:** Minimal (display name, institution optional)

## User stories and edge cases

| User story | Acceptance criteria |
|---|---|
| As a student, I want to register/login so I can upload, rate, favorite | Auth works; sessions persist; protected actions require login |
| As a student, I want to upload a PDF/DOCX (<=100MB) with metadata | Validation enforces type/size; upload goes to pending queue; status shown |
| As a student, I want to filter by institution/course/module/year/tags | Filters combine correctly; results update; empty state handled |
| As a student, I want to rate and review a note | Only logged-in users can rate/review; 1 rating per user; short comment enforced |
| As a student, I want to report a note | Report modal with categories; submitted reports visible to moderators |
| As a moderator, I want to approve/reject uploads | Queue shows metadata/download; approve makes visible; reject requires reason; uploader notified |
| As a student, I want to favorite notes and see my favorites | Toggle works; favorites list persists |
| As a student, I want to see view counts | Count increments on view with basic deduplication |

**Edge cases:** Corrupted files, duplicate uploads, very large DOCX/PDF, missing metadata, users rating their own note (disallow or allow? Recommend disallow in v1), rapid reporting, uploading same content.

## User flows
1. **Discover:** Home/Browse → filter by institution/course/module/year/tags → note card (title, institution/course, rating, views) → note detail
2. **Contribute:** Login → Upload (metadata + file) → Submit → Pending status (My uploads) → Approved/Rejected notification
3. **Engage:** Note detail → Rate (1-5) → Add short review → Favorite → Report if needed
4. **Moderate:** Moderator login → Queue → Preview/download → Approve or Reject (with reason)

## Screens and modals
| ID | Screen/Modal | Purpose | Key actions |
|---|---|---|---|
| SCR-01 | Home/Browse | Discover notes with filters | Filter, search, open note |
| SCR-02 | Search results | Filtered list | Refine filters, sort (optional) |
| SCR-03 | Note detail | View note, ratings/reviews, actions | Rate, review, favorite, report, download/view |
| SCR-04 | Upload | Upload form + file picker | Fill metadata, select PDF/DOCX, submit |
| SCR-05 | My uploads | Track status | View status/reason, re-upload? (v2) |
| SCR-06 | Favorites | Saved notes | Remove favorite, open note |
| SCR-07 | Profile | User info + activity | View uploads/favorites |
| SCR-08 | Auth (Login/Register) | Authentication | Login/register |
| MOD-01 | Report modal | Report form | Select category, details, submit |
| MOD-02 | Rating/review | Inline or modal | Submit rating + short comment |
| ADM-01 | Moderator queue | Pending approvals | Preview, approve, reject (reason) |

## Data model (conceptual)
| Entity | Key fields | Relations |
|---|---|---|
| **User** | id, email, password_hash, display_name, role, institution_affiliation, email_flag_acza, created_at | has many Uploads, Ratings, Reviews, Reports, Favorites |
| **Note** | id, uploader_id, title, institution, course_code, course_name, year, tags[], file_type(pdf/docx), file_url/storage_key, file_size, status(pending/approved/rejected), rejection_reason, view_count, avg_rating, rating_count, created_at, approved_at, approved_by | belongs to User; has Ratings, Reviews, Reports, Favorites |
| **Rating** | id, note_id, user_id, stars(1-5), created_at, updated_at | belongs to Note, User (unique (note_id,user_id)) |
| **Review** | id, note_id, user_id, content (short), created_at, updated_at | belongs to Note, User |
| **Favorite** | id, user_id, note_id, created_at | belongs to User, Note (unique (user_id,note_id)) |
| **Report** | id, note_id, reporter_id, category, details, status(open/resolved/dismissed), resolved_by, resolved_at, action_taken | belongs to Note, User |
| **ViewEvent** | id, note_id, user_id/ip_hash, viewed_at | for view count deduplication |

## APIs and integrations (conceptual)
| Area | Approach (v1) | Notes |
|---|---|---|
| **Auth** | Custom email+password or Auth provider | Keep simple for v1 |
| **File storage** | Object storage (e.g., S3/R2) with signed URLs | Store PDF/DOCX; max 100MB |
| **File processing** | Basic type/size validation | No heavy parsing required in v1 |
| **DB** | Relational (e.g., Postgres) | Fits relations/filters/moderation |
| **Search/filter** | DB queries + indexes (institution/course/module/year/tags) | Sufficient for v1 scale |

## Permissions, privacy, security
| Item | Policy |
|---|---|
| **Visibility** | Only approved notes public; pending/rejected private to uploader/moderators |
| **Auth required** | Upload, rate, review, favorite, report require login |
| **RBAC** | `moderator`/`admin` can access queue and act on reports |
| **File validation** | MIME/type + extension check (PDF/DOCX), size limit 100MB |
| **PII** | Minimal; avoid collecting unnecessary personal data |
| **Reports/moderation** | Audit log for moderation actions (who/when/action/reason) |
| **Rate limiting** | Apply to uploads/reports/auth endpoints |
| **Content** | Users responsible for uploads; provide reporting mechanism |

## Build plan and milestones
| Phase | Focus | Deliverables |
|---|---|---|
| **Phase 0: Setup** | Repo, docs, architecture | Repo structure, this concept doc committed |
| **Phase 1: MVP Core** | Auth, upload, moderation, browse/filter, note detail | Working auth, upload to queue, moderator approve/reject, filters |
| **Phase 2: Engagement** | Ratings, reviews, favorites, view count, reports | Community signals + safety features |
| **Phase 3: Cross-platform** | Web polish + iOS/Android builds | Responsive web + mobile apps for v1 |
| **Phase 4: Beta** | SA university pilot | Invite test users, tune moderation, collect feedback |

**MVP cut:** Auth, upload (PDF/DOCX, 100MB), moderation, browse/filter by institution/course/module/year/tags, note detail, ratings, reviews/comments, reports, view count, favorites.

## Testing and acceptance
| Area | Acceptance criteria |
|---|---|
| **Upload** | Reject non-PDF/DOCX and >100MB with clear errors; accepted uploads go to pending |
| **Moderation** | Only moderators can approve/reject; approval makes note visible; rejection notifies uploader with reason |
| **Filters** | Filtering by institution/course/module/year/tags returns correct results |
| **Engagement** | Rating once per user; short review enforced; favorites toggle correctly |
| **Safety** | Reports submit correctly; appear in moderator queue |
| **Counts** | View count increments reasonably; favorites persist per user |

## Open questions
- [ ] **Duplicate detection:** Should we hash files to detect exact duplicates across uploads?
- [ ] **Download vs view:** For v1, provide download link for approved notes (simple). Is inline preview needed?
- [ ] **Rating ownership:** Disallow users rating their own notes?
- [ ] **Tags taxonomy:** Freeform tags or controlled list per institution/course?
- [ ] **Moderation capacity:** Define initial moderator team/process for pilot

## Glossary
| Term | Definition |
|---|---|
| **.ac.za** | South African academic domain used by universities |
| **DOCX** | Microsoft Word Open XML document (.docx) |
| **MVP** | Minimum Viable Product |
| **PDF** | Portable Document Format |
| **RBAC** | Role-Based Access Control |
| **TVET** | Technical and Vocational Education and Training |

## Appendix
- **Repository:** [https://github.com/ThamiRoneo/EduLink](https://github.com/ThamiRoneo/EduLink)
- **Related skills:** app-concept-document, prd-from-concept
