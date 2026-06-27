# BIGT Phase 18A — QA Checklist

## Writing/Speaking Controlled Task Production

### File Creation
- [x] `data/question-bank/a1/writing/set-01.json` created (20 items)
- [x] `data/question-bank/a1/speaking/set-01.json` created (20 items)
- [x] `data/question-bank/a2/writing/set-01.json` created (20 items)
- [x] `data/question-bank/a2/speaking/set-01.json` created (20 items)

### Item Count
- [x] A1 Writing: 20 items
- [x] A1 Speaking: 20 items
- [x] A2 Writing: 20 items
- [x] A2 Speaking: 20 items
- [x] Total +80 items (bank: 570 → 650)
- [x] Total constructed production: 80 (excl. 10 dev samples)

### ID Uniqueness
- [x] All IDs unique (format `BIGT-{CEFR}-{SKILLCODE}-{SET}-{NUM}`)
- [x] No conflict with existing reading/listening IDs
- [x] No conflict with dev sample IDs
- [x] Validated by validator: 0 duplicate errors

### Rubric Validation
- [x] A1 Writing: `BIGT-RUBRIC-A1-WRITING` (exists)
- [x] A1 Speaking: `BIGT-RUBRIC-A1-SPEAKING` (exists)
- [x] A2 Writing: `BIGT-RUBRIC-A2-WRITING` (exists)
- [x] A2 Speaking: `BIGT-RUBRIC-A2-SPEAKING` (exists)
- [x] No new rubrics created

### Difficulty Validation
- [x] All difficulty values 0 or 1
- [x] Validated by validator: 0–1 range check passed

### Constraints Validation
- [x] A1 Writing: minWords 5–10, maxWords 25–40 (valid)
- [x] A1 Speaking: preparationTime 10–20, maxDuration 15–30 (valid)
- [x] A2 Writing: minWords 20–25, maxWords 65–85 (valid)
- [x] A2 Speaking: preparationTime 20–30, maxDuration 45–60 (valid)
- [x] minWords <= maxWords for all text items
- [x] minDuration <= maxDuration for all audio items

### Participant Safety
- [x] adminOnly field present and properly structured
- [x] No sampleResponse, scoringNotes, scoringLogic in public fields
- [x] RubricRef only — full rubric not exposed
- [x] No answer key or correct answer
- [x] No transcript in public stimulus
- [x] Sanitization via `sanitizeSnapshot()` will strip adminOnly

### Task Content Quality
- [x] Tasks are natural, daily-life contexts
- [x] Clear for foreign learners of Indonesian
- [x] No overly academic content
- [x] No political/religious/sensitive topics
- [x] No single correct answer (manual review)
- [x] Appropriate for CEFR level
- [x] Varied task types per skill

### Reading Regression
- [x] All 300 reading items still pass validation
- [x] No reading files modified

### Listening Regression
- [x] All 260 listening items still pass validation
- [x] No listening files modified

### Writing Submit Sanity
- [x] Constructed submit endpoint unchanged (`/api/test/constructed/submit`)
- [x] Schema matches existing ConstructedResponseItem type

### Speaking Submit Sanity
- [x] Speaking audio submit endpoint unchanged
- [x] Audio response mode still works (`responseMode: "audio"`)

### Admin Review Sanity
- [x] Admin review page works with new items (same schema)
- [x] Rubric reference resolves correctly

### Results Page Safety
- [x] Results page does not expose adminOnly fields
- [x] Results page only shows band + feedback after review

### Build
- [x] Validator: 26 files, 0 errors
- [x] Audit: 650 questions, all checks passed
- [x] Typecheck: 0 errors
- [x] Build: 0 errors, 0 warnings (pre-existing only)

### Live Default
- [x] `activeSkills` remains `['reading', 'listening']`
- [x] `LIVE_LOCK: false` in constructed-response features
- [x] Writing/Speaking NOT active in live exam default
- [x] No participant leakage
- [x] adminOnly safe

## Documentation
- [x] `docs/BIGT_PHASE_18A_WRITING_SPEAKING_PRODUCTION.md` created
- [x] `docs/BIGT_PHASE_18_QA.md` created (this file)

---

# BIGT Phase 18B — QA Checklist

## Trial Exam Mode

### Session Creation
- [x] `app/api/test/start/trial/route.ts` — admin-only (403 for non-admin)
- [x] Trial sessions use `product: 'TRIAL_A1'|'TRIAL_A2'|'DEV_FULL'`
- [x] `metadata.examMode` set to `'trial_constructed'|'dev_full'`
- [x] Item selector loads from file bank with random selection
- [x] `syncQuestionItem.ts` extended for `ESSAY`/`AUDIO_RESPONSE` types

### Item Composition
- [x] A1/A2 trial: R5/L5/W2/S2 (14 items)
- [x] dev_full: R3/L3/W2/S2/I1/M1 (12 items)

### Admin UI
- [x] `app/admin/trial/page.tsx` — 3 start buttons (Trial A1, Trial A2, Dev Full)
- [x] Admin sidebar "Uji Coba" link with `FlaskConical` icon

### Complete Route
- [x] Trial sessions mark `COMPLETED` with duration
- [x] Skip `resolveLevelExamResult`, `TestResult`, `UserProfile.update`
- [x] Check uses both `isTrialSession()` + `metadata.examMode` (defense in depth)

### Results Page
- [x] Blue banner with `Shield` icon for trial mode
- [x] Product labels (Trial A1 Full Skills, etc.)
- [x] "Hasil Writing dan Speaking belum dinilai"
- [x] "Skor uji coba ini tidak memengaruhi skor akhir atau level CEFR Anda"

### Admin Review
- [x] `examMode` filter dropdown (Live, Uji Coba, Dev Full)
- [x] Purple "Trial" / "Dev" badge on response items
- [x] `level` and `dimension` query params supported in GET

### Safety
- [x] Trial sessions cannot produce TestResult
- [x] Trial sessions cannot produce Certificate
- [x] Writing/Speaking not in live default
- [x] `FOUNDER` role reference removed (Prisma enum only has `TEST_TAKER|ADMIN`)
- [x] `imageUrl`/`audioUrl` read from `item.stimulus.imageUrl` (not top-level)
- [x] Build passes (0 errors)

---

# BIGT Phase 18C — QA Checklist

## Reviewer Workflow & Certification Policy

### Policy Config
- [x] `lib/certification/bigt-policy.ts` created
- [x] `BIGT_CURRENT_CERTIFICATION_POLICY` — live policy config
- [x] `BIGT_FUTURE_FULL_SKILLS_POLICY` — disabled future config
- [x] `BIGT_FULL_SKILLS_CERTIFICATE_ACTIVE = false`
- [x] `canSessionIssueCertificate()` — trial sessions return false
- [x] `isConstructedIncludedInLiveResult()` — returns false
- [x] `getEffectiveWeighting()` — uses current (50/50) not future (25 each)

### Review Status Lifecycle
- [x] `lib/scoring/review-status.ts` created
- [x] `REVIEW_STATUS` constants: draft, submitted, under_review, reviewed, needs_second_review, flagged, rejected
- [x] `getParticipantStatusMessage()` — safe messages for each status
- [x] `isPendingReview()`, `isBlockedFromFinalization()`, `isValidReviewStatus()`
- [x] `getEffectiveReviewStatus()` — derives from score JSON presence

### Permission Helpers
- [x] `lib/permissions/constructed-permissions.ts` created
- [x] `canReviewConstructedResponse()` — ADMIN only
- [x] `canFinalizeConstructedScore()` — ADMIN only
- [x] `canIssueCertificate()` — ADMIN only
- [x] `canOverrideStatus()` — ADMIN only
- [x] `canViewInternalNotes()` — ADMIN only
- [x] `canRejectResponse()` — ADMIN only
- [x] Future roles documented (REVIEWER, SENIOR_REVIEWER, CERTIFICATION_ADMIN)

### Score Finalization
- [x] `finalScoreJson` auto-computed from `reviewerScoreJson.dimensions` when status → `reviewed`
- [x] `finalScoreJson` cleared when moving away from `reviewed`
- [x] `canFinalizeConstructedResponse()` — checks blockers
- [x] `canIncludeConstructedInCertificate()` — checks finalScoreJson + reviewed status
- [x] `getConstructedReviewBlockers()` — async, checks plagiarism risk too
- [x] `computeConstructedScore()` + `buildFinalScoreJson()` wired in PATCH endpoint

### Results Page Policy
- [x] `submitted` → "Menunggu Penilaian" (clock icon)
- [x] `under_review` → "Sedang Dinilai" (eye icon)
- [x] `needs_second_review` → "Diperiksa Kembali" (user-check icon)
- [x] `flagged` → "Diperiksa Lebih Lanjut" (alert icon) — NOT "curang"
- [x] `rejected` → "Tidak Dapat Dinilai" (x-circle icon)
- [x] `reviewed` → band + percentage + feedback

### Admin Review UI
- [x] Status dropdown in save area (Siap difinalisasi, Butuh review kedua, Perlu pemeriksaan, Tidak dapat dinilai)
- [x] Blocker warnings for flagged/needs_second_reject/rejected statuses
- [x] Rejected responses cannot change status (hard block in PATCH)

### Participant Safety
- [x] `internalNotes` never visible to participant
- [x] `autoScoreJson` never visible to participant
- [x] `reviewerScoreJson.dimensions` never visible
- [x] Plagiarism/AI details never visible
- [x] Anti-cheating is reviewer assistance only — not auto-fail
- [x] `adminOnly` stripped via `sanitizeSnapshot()`

### Certification Safety
- [x] Trial sessions cannot produce certificate
- [x] Live default remains Reading + Listening
- [x] Writing/Speaking not in live certificate yet
- [x] Full-skills weighting (25/25/25/25) documented but disabled
- [x] Certificate eligibility requires `finalScoreJson` for all items

### Documentation
- [x] `docs/BIGT_PHASE_18C_REVIEW_CERTIFICATION_POLICY.md` created
- [x] Live policy documented
- [x] Trial policy documented
- [x] Future full-skills policy documented
- [x] Review lifecycle documented
- [x] Anti-cheating policy documented
- [x] Participant visibility documented
- [x] Score finalization rules documented
- [x] Known limitations documented
- [x] Next phase recommendations documented

### Build
- [x] Build passes (0 errors, 0 new warnings)

---

# BIGT Phase 18D — QA Checklist

## Trial Session Creation
- [x] A1 trial session created (14 items)
- [x] A1 trial composition correct (R5/L5/W2/S2)
- [x] A2 trial session created (14 items)
- [x] A2 trial composition correct (R5/L5/W2/S2)
- [x] Dev Full Test session created (12 items)
- [x] Dev Full Test safe fallback (mediation warning not crash)

## Submit Routing
- [x] MCQ/Reading/Listening → legacy endpoint
- [x] Writing → `/api/test/constructed/submit`
- [x] Speaking → `/api/test/constructed/submit`
- [x] Timer auto-submit routes correctly
- [x] End-test routes correctly

## Completion Behavior
- [x] Trial session marks COMPLETED
- [x] No TestResult created
- [x] No certificate created
- [x] No CEFR level update
- [x] Results page opens without error
- [x] Trial disclaimer banner visible
- [x] Writing/Speaking show pending status

## Admin Review
- [x] Trial responses appear in review page
- [x] examMode filter works (live/trial_constructed/dev_full)
- [x] Level filter works
- [x] Dimension/skill filter works
- [x] Trial/Dev badge visible
- [x] Writing response opens correctly
- [x] Speaking response opens with audio
- [x] adminOnly fields only visible to admin

## Anti-Cheating
- [x] Admin-only endpoint
- [x] AI detection results display correctly
- [x] Short text → `insufficient_text` label
- [x] Form completion → `not_applicable` label
- [x] No auto-fail
- [x] No participant leakage

## Manual Review
- [x] Dimension scores (0-5) per rubric
- [x] Feedback text stored and visible to participant
- [x] Internal notes stored and NOT visible to participant
- [x] `finalScoreJson` auto-computed only when status → `reviewed`
- [x] Status: under_review → safe participant message
- [x] Status: needs_second_review → safe message
- [x] Status: flagged → safe message (NOT "curang")
- [x] Status: rejected → "Tidak Dapat Dinilai"
- [x] Status: reviewed → band + percentage + feedback
- [x] Blockers prevent finalization without all dimensions
- [x] Rejected hard-lock (cannot change status)

## Public Access Security
- [x] `/admin/trial` → 403 for non-admin
- [x] `/api/test/start/trial` → 403 for non-admin
- [x] `/admin/constructed-review` → unauthorized
- [x] Plagiarism endpoint → admin-only
- [x] Manual trial creation → rejected by role check

## Regression
- [x] Build passes (0 errors)
- [x] Validator passes (26 files, 0 errors)
- [x] Audit passes (650 questions, all checks pass)
- [x] Reading live exam unchanged
- [x] Listening live exam unchanged
- [x] A1/A2 live exam still Reading + Listening
- [x] Quick Test/Placement unchanged
- [x] Participant sanitization intact

## Bugs Found & Fixed
- [x] Answer restoration on page refresh — CRITICAL (MCQ selectedOption, ESSAY text, AUDIO_RESPONSE)
- [x] Mediation items never loaded in dev_full — HIGH
- [x] Image stimulus overwritten to text in trial items — HIGH
- [x] Speaking fake upload (state='submitted' before API call) — HIGH
- [x] sessionItemId not cross-checked in constructed submit — MEDIUM
- [x] Hardcoded audio/webm MIME type (Safari unsupported) — MEDIUM
- [x] `||` instead of `??` for durationMinutes — LOW

---

# BIGT Phase 18E — QA Checklist

## Dashboard Page
- [x] `/admin/full-skills-readiness` created
- [x] Admin-only (non-admin → 401 via getAdminUser)
- [x] Sidebar link "Kesiapan Full Skills" with Gauge icon
- [x] Readiness score display (0–100 with progress bar)
- [x] Readiness level badge (Terblokir/Butuh Perbaikan/Siap Pilot/Siap Live)

## Bank Metrics
- [x] Total items count
- [x] Reading count
- [x] Listening count
- [x] Writing count
- [x] Speaking count
- [x] Integrated count
- [x] Mediation count
- [x] Threshold indicators (Writing ≥40, Speaking ≥40)

## Trial Metrics
- [x] Total trial sessions
- [x] A1 trial count
- [x] A2 trial count
- [x] Dev Full count
- [x] Completed count
- [x] Last trial date
- [x] Link to `/admin/trial`

## Review Metrics
- [x] Total constructed responses
- [x] Pending count
- [x] Under review count
- [x] Reviewed count
- [x] Needs second review count
- [x] Flagged count
- [x] Rejected count
- [x] Completion rate percentage
- [x] Average review time
- [x] Warnings (reviewed without finalScoreJson, rejected without feedback)
- [x] Link to `/admin/constructed-review`

## Risk Metrics
- [x] Low risk count
- [x] Medium risk count
- [x] High risk count
- [x] Needs review count
- [x] Insufficient text count
- [x] Disclaimer message
- [x] No participant identity exposed

## Audio Readiness
- [x] Total speaking responses
- [x] With audio count
- [x] Missing audio count
- [x] Average duration
- [x] Storage readiness note

## Safety Checklist
- [x] 11 safety items displayed
- [x] Green/red indicators per item
- [x] Participant payload sanitized
- [x] adminOnly not leaked
- [x] Trial cannot issue certificate
- [x] Writing/Speaking not live default
- [x] finalScoreJson only after manual review
- [x] Anti-cheating not auto-fail
- [x] Public users cannot access trial/admin review
- [x] Build/validator/audit pass

## Readiness Score
- [x] Readiness level computed (blocked/needs_work/pilot_ready/live_ready_candidate)
- [x] Score 0–100 from 8 factors
- [x] Blockers dynamically generated
- [x] Recommendations dynamically generated

## Security
- [x] No participant data leakage
- [x] No raw answers exposed in dashboard summary
- [x] No Activate Live button
- [x] Live default still Reading + Listening
- [x] Writing/Speaking still not live default

## Build
- [x] Build passes (0 errors)
- [x] Validator passes (0 errors)
- [x] Audit passes (all checks pass)

---

# BIGT Phase 18F — Owner Control Center QA

## Dashboard Page
- [x] `/admin/bigt-overview` created
- [x] Admin-only (non-admin → 401 via getAdminUser)
- [x] Sidebar link "BIGT Owner" with ShieldCheck icon (after Dasbor)
- [x] Header "BIGT Owner Control Center" with subtitle
- [x] Owner alerts section at top

## Summary Cards
- [x] Total Pendaftar card with 7d new users
- [x] Sesi Tes card with completed/abandoned
- [x] Rata-rata Skor card
- [x] Pending Review card
- [x] Completion Rate card
- [x] Hari Ini card (new users today)
- [x] Trial card
- [x] Bank Soal card

## Tab: Pendaftar
- [x] Latest 20 users table
- [x] Search by name/email
- [x] Name, Email, Role, Tanggal Daftar, Sesi, Selesai, Terakhir Aktif columns
- [x] Role badge (ADMIN purple, TEST_TAKER blue)

## Tab: Aktivitas Tes
- [x] Total/Completed/In Progress/Abandoned counts
- [x] By Level distribution
- [x] By Product distribution
- [x] By Status distribution
- [x] Recent sessions table (15) with user, level, type badge, status badge, score, date
- [x] Exam mode badge (Live/Trial/Dev Full)
- [x] Status badge (Completed/In Progress/etc)

## Tab: Hasil
- [x] Total hasil, Rata-rata skor, Pass rate, Distribusi CEFR cards
- [x] CEFR distribution bar chart (A1-C2)
- [x] Recent results table

## Tab: Review Menulis/Bicara
- [x] Total/Pending/Review/Reviewed/2nd Review/Flagged/Rejected counts
- [x] Writing/Speaking breakdown
- [x] CTA button to `/admin/constructed-review`

## Tab: Mode Uji Coba
- [x] Total/A1/A2/Dev Full/Completed counts
- [x] Latest trial date display
- [x] CTA button to `/admin/trial`

## Tab: Bank Soal
- [x] Reading/Listening/Writing/Speaking/Integrated/Mediation/Total counts
- [x] Validator status badge
- [x] Audit status badge
- [x] Link to Kesiapan Full Skills

## Tab: Risiko
- [x] Low/Medium/High/Needs Review/Insufficient/N/A counts
- [x] Disclaimer: "Risk signal adalah alat bantu reviewer, bukan keputusan final."

## Owner Alerts
- [x] Dynamically generated from metrics
- [x] Warning: pending review > 5
- [x] Warning: flagged > 0
- [x] Warning: trial not used
- [x] Warning: no reviews completed
- [x] Warning: high risk detected
- [x] Info: low average score
- [x] Info: banyak user belum tes
- [x] Info: bank soal mencukupi
- [x] Action buttons on alerts

## API
- [x] GET `/api/admin/bigt-owner` returns full shape
- [x] Admin-only (401 for non-admin)
- [x] Defensive queries (null-safe with catch)
- [x] All fields return safely even if data is empty
- [x] No crash on missing data (0/empty/null fallbacks)

## Security
- [x] No participant leakage
- [x] No raw internalNotes exposed
- [x] No raw autoScoreJson exposed
- [x] No signed audio URL exposed
- [x] No raw participant answers in dashboard summary
- [x] No Activate Live button
- [x] Live default still Reading + Listening
- [x] Writing/Speaking still not live default
- [x] Risk signals advisory only

## Build
- [x] Build passes (0 errors)
- [x] Validator passes (0 errors)
- [x] Audit passes (all checks pass)

---

# BIGT Phase 19A — A1/A2 Writing Speaking Expansion Set 02–03 QA

## File Creation
- [x] A1 Writing set-02.json created (20 tasks)
- [x] A1 Writing set-03.json created (20 tasks)
- [x] A1 Speaking set-02.json created (20 tasks)
- [x] A1 Speaking set-03.json created (20 tasks)
- [x] A2 Writing set-02.json created (20 tasks)
- [x] A2 Writing set-03.json created (20 tasks)
- [x] A2 Speaking set-02.json created (20 tasks)
- [x] A2 Speaking set-03.json created (20 tasks)

## Item Count
- [x] Total added: 160 items
- [x] Total bank: 810 items (was 650)
- [x] Writing total: 124 (was 44)
- [x] Speaking total: 124 (was 44)
- [x] A1 Writing: 60 (was 20)
- [x] A1 Speaking: 60 (was 20)
- [x] A2 Writing: 60 (was 20)
- [x] A2 Speaking: 60 (was 20)

## Schema Validation
- [x] All IDs follow BIGT-{CEFR}-{SKILL}-SET{NN}-{ITEM} format
- [x] All IDs uppercase, no spaces
- [x] No ID conflicts with set-01
- [x] All IDs unique across bank
- [x] difficulty 0–1
- [x] constraints valid (minWords < maxWords, minDuration < maxDuration)
- [x] rubricRef valid
- [x] adminOnly has sampleResponse + scoringNotes
- [x] itemsCount matches actual items.length (20 per file)

## Task Type Coverage
- [x] A1 Writing: guided_sentence, short_text, form_completion, message_reply, picture_description
- [x] A1 Speaking: voice_read_aloud, voice_short_answer, voice_picture_description
- [x] A2 Writing: short_text, message_reply, picture_description, form_completion, simple_mediation
- [x] A2 Speaking: voice_short_answer, voice_picture_description, read_and_speak, simple_mediation

## Validator & Build
- [x] Validator passes: 34 files, 0 errors
- [x] Audit passes: 810 total, all checks pass
- [x] Build passes: 0 errors

## Security
- [x] No participant leakage
- [x] adminOnly fields safe
- [x] No sensitive content (politics/religion)

## Live Default
- [x] Live default still Reading + Listening
- [x] Writing/Speaking still not live default
- [x] No changes to existing Reading/Listening items
- [x] No changes to existing live blueprint logic

---

# BIGT Test Session 500 Hotfix QA

## Root Cause
Missing `updatedAt` column in `UserAnswer` table. The Prisma schema had `updatedAt DateTime @updatedAt` (added during Phase 18B constructed response work), but the database was not managed by Prisma Migrate. When API endpoints used `include: { answer: true }` (SELECT *), Prisma threw because the column didn't exist in PostgreSQL. Affected:

- `GET /api/test/session/[id]` → 500
- `GET /api/test/history` → 500
- `GET /api/test/history?limit=...` → 500

## Fixes Applied

### Database (prisma/schema.prisma + raw SQL)
- [x] `UserAnswer.updatedAt` column added: `ALTER TABLE "UserAnswer" ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL`
- [x] Prisma schema `@updatedAt` preserved for auto-update behavior

### Session Endpoint (`app/api/test/session/[id]/route.ts`)
- [x] Fixed deprecated `get`/`set`/`remove` cookies → `getAll`/`setAll`
- [x] Items with null `questionSnapshot` are filtered out (logged warning)
- [x] Null-safe access for all answer fields (`?? null`)
- [x] Null-safe durationMinutes from metadata
- [x] Safe finalScoreJson parsing (band string / percentage number)
- [x] `session.question` relation null-safe for correctAnswer
- [x] All numeric/date fields use optional chaining or nullish coalescing

### History Endpoint (`app/api/test/history/route.ts`)
- [x] Fixed deprecated `get`/`set`/`remove` cookies → `getAll`/`setAll`
- [x] Per-row `safeMapSession()` with try-catch — corrupt rows return null, filtered out
- [x] Null-safe handling for: `result`, `questionCount`, `product`, `totalScore`, `cefrLevel`, `completedAt`, `durationSeconds`, `startedAt`
- [x] Trial sessions without TestResult → dimensions = []
- [x] One corrupt session cannot crash entire history list

### Client Page (`app/(protected)/test/[sessionId]/page.tsx`)
- [x] Differentiated error messages: 404 → "Sesi tes tidak ditemukan", 403 → "Kamu tidak memiliki akses ke sesi ini", 500 → "Terjadi masalah saat memuat sesi"
- [x] 404/403 → "Mulai Tes Baru" button instead of "Muat Ulang"
- [x] Error status code tracked and displayed

## Regression Checks
- [x] Session endpoint no 500
- [x] History endpoint no 500
- [x] TypeScript build 0 errors
- [x] Validator 0 errors
- [x] Audit 0 critical errors
- [x] Live default still Reading + Listening
- [x] Writing/Speaking still not live default
- [x] No participant leakage
- [x] Trial does not issue certificate

---

# BIGT DB Migration Safety & Prisma Baseline QA

## Prisma Baseline Migration
- [x] `prisma/migrations/0_init/migration.sql` created with full schema (480 lines)
- [x] Migration resolved on production DB: `prisma migrate resolve --applied 0_init`
- [x] `prisma db push` confirms "Your database is now in sync"
- [x] `prisma generate` succeeds

## DB Health Check Endpoint
- [x] `app/api/admin/system/db-health/route.ts` created
- [x] Admin-only (403 for non-ADMIN)
- [x] Checks critical tables (User, TestSession, UserAnswer, etc.)
- [x] Checks critical UserAnswer columns (id, sessionItemId, answer, score, updatedAt, etc.)
- [x] Checks constructed response columns (responseText, responseAudioUrl, autoScoreJson, finalScoreJson, responseStatus, etc.)
- [x] Runtime connectivity check
- [x] Returns structured `{ status, summary, failures, checks }`
- [x] No stack traces or connection strings leaked to client

## Owner Alert for DB Drift
- [x] `generateOwnerAlerts()` in bigt-owner/route.ts checks `UserAnswer.updatedAt` existence
- [x] Missing column → critical alert with "Cek DB Health" action link
- [x] Query failure → warning "DB Health Check Gagal"

## Documentation
- [x] `docs/BIGT_DB_MIGRATION_SAFETY.md` created
- [x] Root cause documented
- [x] Manual SQL hotfix documented
- [x] Prisma migration strategy documented (both db push and Prisma Migrate)
- [x] Deployment checklist documented
- [x] Rollback notes documented
- [x] Verification commands documented
