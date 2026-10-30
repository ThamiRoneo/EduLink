# EduLink - Google Stitch Design Prompts

Generated from: docs/App Concept Docs/EduLink - PRD.md  
Date: 2026-10-30  
Platform: Web-first, iOS and Android (v1)  
Design target: Web first and mobile (responsive - 360×800px mobile base, desktop responsive)

## 1. Style Guide Prompt

Copy and paste this entire prompt into Google Stitch first to establish the design system.

```
Create a design system/style guide for the EduLink app with the following specifications. Use ONLY these values from the PRD - do not invent anything.

COLOR PALETTE (from PRD Section 9.1):
- Primary: #1F4E79 (Buttons, links, CTAs)
- Primary-hover: #163a5f (Button hover)
- Background: #FFFFFF (Page background)
- Surface: #F7F9FC (Cards/panels)
- Text-primary: #1A1A1A (Body text)
- Text-secondary: #4F4F4F (Secondary text)
- Border: #E5E7EB (Inputs/borders)
- Success: #22C55E (Approved/success)
- Warning: #F59E0B (Pending/warnings)
- Danger: #DC2626 (Errors/reject/report)
- Info: #3B82F6 (Info states)

TYPOGRAPHY (from PRD Section 9.2):
- Font family: Inter, system-ui, -apple-system, sans-serif
- Heading 1: 32px/700/1.2
- Heading 2: 24px/700/1.25
- Heading 3: 20px/600/1.3
- Body: 16px/400/1.6
- Body-small: 14px/400/1.6
- Caption: 12px/400/1.5

SPACING SCALE (4pt scale):
- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 24px
- space-6: 32px
- space-7: 48px

BORDER RADIUS:
- Cards/inputs: 8px
- Badges: 4px

SHADOWS:
- Cards: 0 1px 3px rgba(0,0,0,0.1)

ICONOGRAPHY:
- Style: Simple, consistent outline icons
- Sizes: 16px, 20px, 24px
- Color: Use Text-primary or match state colors

SHARED COMPONENTS (from PRD Section 8.4):
- C1 NoteCard (default, compact) - title, institution, course/module, year, rating, view_count, favorite state
- C2 FilterPanel (desktop, mobile collapsible) - institution, course/module, year, tags
- C3 FileUploader (default, error) - accept .pdf,.docx, max 100MB with validation
- C4 RatingStars (display, input 1-5)
- C5 ReviewList (default, empty)
- C6 ReportButton (default, disabled for guest)
- C7 FavoriteButton (default, active, disabled for guest)
- C8 StatusBadge (pending/approved/rejected)
- C9 AuthForm (login, register)
- C10 EmptyState (default with message + optional CTA)
- C11 Toast/Notification (success, error, info, auto-dismiss)

Show each component in all variants side by side with labels. Ensure all text meets WCAG contrast standards (>=4.5:1). Use web-first and mobile approach, responsive from 360×800px mobile base to desktop.
```


## 2. Screen Prompts


### 2.1 S1 — Login
```
Design screen "S1" (Login) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse the style guide and shared components exactly. Keep the header identical to my other screens.
- Include every element in the order listed. Use exact labels and messages in quotation marks.
- Fill with South African sample content. Never use lorem ipsum.
- Design Normal state first, then frames for Empty, Loading, Error, Offline, Success.
- Do not invent features/buttons/screens/text. If missing, put grey box labelled "TODO: [what is missing]" and list under TODOs.

Spec (PRD 8.1): Purpose - Authenticate existing users with email+password. Primary action - Login. Features - F1. Stories - US1.

Layout (Normal):
- Top app bar: "EduLink" (centered or left, consistent across screens)
- AuthForm (C9, variant login): "Email" input (placeholder "e.g. thandi@up.ac.za"), "Password" input (type password)
- "Log in" button (Primary #1F4E79)
- "Don't have an account? Register" link
- Hint: "We flag .ac.za emails for student prioritization"

States (PRD 8.2):
- Normal: Login form ready
- Empty: N/A
- Loading: "Signing in..." button disabled, spinner
- Error: "Invalid email or password." / field errors
- Offline: "You're offline. Check your connection."
- Success: Redirect to previous page or Home on success

Sample content: Use SA context, no dummy lorem ipsum. Email placeholder shows .ac.za example.

TODOs: None
```


### 2.2 S2 — Register
```
Design screen "S2" (Register) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide and components. Keep header identical.
- Use exact labels/messages in quotes. South African sample content.
- Show all states.

Spec: Create new account with email+password and display name. Features F1. US1.

Layout (Normal):
- Top app bar: "Create account"
- AuthForm (C9, register): "Display name" (placeholder "e.g. Thandi M."), "Email" (placeholder "e.g. thandi@up.ac.za"), "Password" (min 8 chars)
- ".ac.za student emails are prioritized" hint
- "Register" button (Primary)
- "Already have an account? Log in" link

States:
- Normal: Form ready
- Empty: N/A
- Loading: "Creating account..." disabled
- Error: Field errors; "Email already in use." if duplicate
- Offline: "You're offline. Check your connection."
- Success: Account created, redirect/login

TODOs: None
```


### 2.3 S3 — Upload
```
Design screen "S3" (Upload) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide and components. Keep header identical.
- Enforce PDF/DOCX only, max 100MB.

Spec: Upload PDF/DOCX note with metadata to moderation queue. Features F2. US2.

Layout (Normal):
- Top app bar: "Upload note"
- FileUploader (C3): "Choose file (PDF or DOCX, max 100MB)"
- Form fields: "Title" (required), "Institution" (dropdown e.g. University of Pretoria, UCT, Wits), "Course code" (e.g. CSC101), "Course name", "Year" (e.g. 2025), "Tags" (comma separated)
- "Submit for moderation" button (Primary)
- Note: "All uploads require moderation before becoming visible."

States:
- Normal: Form ready
- Empty: N/A
- Loading: "Uploading..." with progress
- Error: "File must be PDF or DOCX." / "File too large (max 100MB)." / "Please fill all required fields."
- Offline: "You're offline. Cannot upload."
- Success: "Upload submitted. Pending moderation." redirect to S9

Sample content: Use SA institutions/courses.

TODOs: None
```


### 2.4 S4 — Home/Browse
```
Design screen "S4" (Home/Browse) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide and components. Keep header and bottom nav identical across screens.
- Include filters.

Spec: Discover notes with filters. Features F4,F9,F12. US3.

Layout (Normal):
- Top app bar: "EduLink - Browse notes"
- Search bar: "Search by title, course, or tags..."
- FilterPanel (C2, mobile collapsible): Institution, Course/Module, Year, Tags
- NoteCard list (C1): Show cards with title, institution/course, year, RatingStars (display), "X views", FavoriteButton
- Bottom nav: Home, Upload, Favorites, Profile (icons + labels)

States:
- Normal: Notes grid with filters
- Empty: "No notes yet. Be the first to upload." + "Upload a note" button
- Loading: Skeleton cards
- Error: "Couldn't load notes. Try again." with retry button
- Offline: "Showing cached results if available." or message
- Success: N/A

Sample content: SA institutions, courses like "CSC101", "ECON101", Thandi/Sipho style titles.

TODOs: None
```


### 2.5 S5 — Search results
```
Design screen "S5" (Search results) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide/components. Keep header and bottom nav identical.

Spec: Filtered results list. Features F4,F9. US3.

Layout (Normal):
- Top app bar: "Search results" with back button
- Active filters chips (removable)
- "Clear all filters" link
- NoteCard list (C1) with results
- Bottom nav identical

States:
- Normal: Results
- Empty: "No notes match your filters." with "Clear filters" button
- Loading: Loading results
- Error: "Couldn't load results. Try again."
- Offline: "Showing cached results if available."
- Success: N/A

TODOs: None
```


### 2.6 S6 — Note detail
```
Design screen "S6" (Note detail) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide/components. Keep header and bottom nav identical.

Spec: View note details, ratings/reviews, actions. Features F5,F6,F7,F8,F9,F10. US3,US4,US5.

Layout (Normal):
- Top app bar: "Note details" with back button
- Note header: Title, Institution • Course code • Year, Tags
- File info: "PDF/DOCX • [size] • [views] views"
- Action buttons: "Download/View", FavoriteButton (C7), "Rate/Review", "Report"
- Ratings summary: RatingStars (C4 display) + "[avg] ([count] ratings)"
- Reviews section: ReviewList (C5)
- Bottom nav identical

States:
- Normal: Full detail
- Empty: N/A
- Loading: Loading detail
- Error: "Couldn't load note. Try again."
- Offline: "Limited info. Some actions unavailable."
- Success: Toasts for rate/favorite/report

Notes: Hide/disable rating for uploader (BR13). Require auth for rate/review/favorite/report.

TODOs: None
```


### 2.7 S7 — Favorites
```
Design screen "S7" (Favorites) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide/components. Keep header and bottom nav identical.

Spec: Saved favorite notes. Features F10. US7.

Layout (Normal):
- Top app bar: "My Favorites"
- NoteCard list (C1) with FavoriteButton (active)
- Bottom nav identical

States:
- Normal: Favorites list
- Empty: "You have no favorites yet." with "Browse notes" button (links to S4)
- Loading: Loading favorites
- Error: "Couldn't load favorites. Try again."
- Offline: "Favorites may not sync offline."
- Success: "Removed from favorites." toast

TODOs: None
```


### 2.8 S8 — Profile
```
Design screen "S8" (Profile) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide/components. Keep header and bottom nav identical.

Spec: User profile and tabs. Features F1,F11. US1,US7.

Layout (Normal):
- Top app bar: "Profile"
- Profile header: Display name, email, ".ac.za student" badge if flagged
- Tabs: "My Uploads" | "Favorites"
- Content area shows relevant list/cards
- Bottom nav identical

States:
- Normal: Profile with tabs
- Empty: "No uploads yet." / "No favorites yet." per tab
- Loading: Loading profile
- Error: "Couldn't load profile. Try again."
- Offline: "Limited profile data offline."
- Success: N/A

TODOs: None
```


### 2.9 S9 — My uploads
```
Design screen "S9" (My uploads) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide/components. Keep header and bottom nav identical.

Spec: Track upload status. Features F2,F13. US2.

Layout (Normal):
- Top app bar: "My Uploads"
- Upload list items with: Title, Institution/Course, Date
- StatusBadge (C8): pending / approved / rejected
- If rejected: "Rejection reason: [reason]" text
- "Upload new note" button
- Bottom nav identical

States:
- Normal: Uploads list
- Empty: "You haven't uploaded any notes yet." with "Upload a note" button
- Loading: Loading uploads
- Error: "Couldn't load uploads. Try again."
- Offline: "Status may be outdated offline."
- Success: N/A

TODOs: None
```


### 2.10 S10 — Moderation queue
```
Design screen "S10" (Moderation queue) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base.
- Reuse style guide/components. Keep header and bottom nav identical.
- Moderator/Admin only.

Spec: Review pending uploads and reports. Features F3,F8. US6.

Layout (Normal):
- Top app bar: "Moderation Queue" (with role indicator)
- Tabs: "Pending uploads" | "Reports"
- Queue items: Note metadata, uploader, file info, "Preview/Download", "Approve", "Reject" buttons
- Reject flow: require reason (text input) before confirming
- Bottom nav identical (or admin nav)

States:
- Normal: Queue with items
- Empty: "No pending items." 
- Loading: Loading queue
- Error: "Couldn't load queue. Try again."
- Offline: "Queue unavailable offline."
- Success: "Note approved." / "Note rejected." toasts

Notes: RBAC enforced; audit log actions.

TODOs: None
```


## 3. Modal Prompts


### 3.1 M1 — Report modal
```
Design modal "M1" (Report modal) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base (overlay on S6).
- Reuse style guide and components.
- Overlay with semi-transparent background.

Spec: Report abusive/incorrect note. Features F8. US5. Trigger: S6 Report button.

Layout (Normal):
- Modal card centered
- Title: "Report this note"
- Category dropdown: "Select category" with options "Abuse", "Incorrect/Misleading", "Copyright", "Other" (required)
- Details textarea: "Additional details (optional)" (placeholder)
- Buttons: "Cancel" (secondary), "Submit report" (Danger #DC2626)

States:
- Normal: Form ready
- Empty: N/A (category required)
- Loading: "Submitting..." disabled
- Error: "Please select a category." if not selected
- Offline: "You're offline. Cannot report."
- Success: Close modal, show toast "Thanks for reporting. We'll review it."

Notes: Auth required; guest redirected to login. BR7.

TODOs: None
```


### 3.2 M2 — Rating/review modal
```
Design modal "M2" (Rating/review modal) for EduLink (web-first and mobile, responsive) at 360 × 800 px mobile base (overlay on S6).
- Reuse style guide and components.

Spec: Rate and/or review note. Features F6,F7. US4. Trigger: S6 Rate/Review button.

Layout (Normal):
- Modal card centered
- Title: "Rate and review"
- Rating: "Your rating" with RatingStars (C4, input) 1-5 (required)
- Review: "Short review (optional)" textarea placeholder "Share your thoughts..." with counter "0/500"
- Buttons: "Cancel" (secondary), "Submit" (Primary)

States:
- Normal: Form ready
- Empty: N/A
- Loading: "Submitting..." disabled
- Error: "Please select a rating." / "Review must be 500 characters or less."
- Offline: "You're offline. Cannot submit."
- Success: Close modal, update ratings/reviews, show toast

Notes: Auth required, not uploader (BR13). One rating per user per note (BR5). Max 500 chars (BR6).

TODOs: None
```


## 4. Implementation Notes for Stitch
- Generate in this order: Style Guide first, then S1-S10, then M1-M2
- Keep header and bottom navigation identical across all screens (S1-S10)
- Use only PRD-specified labels/messages in quotes
- Use South African sample data (names: Thandi, Sipho, Nomsa, Kabelo; institutions: UP, UCT, Wits, UKZN; courses: CSC101, ECON101, LAW101)
- Enforce all states as specified
- Do not invent features - use TODO grey boxes if anything missing
- Mobile-first 360x800px
