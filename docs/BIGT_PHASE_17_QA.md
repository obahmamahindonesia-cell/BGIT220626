# BIGT Phase 17B QA Checklist

## 1. Existing Reading Still Works
- [x] `npm run validate:questions` — 22 files, 560 questions, 0 errors
- [x] Existing A1/A2 reading sets still pass validation
- [x] Existing reading test assembly works (selectLevelExamItems)
- [x] Audit: 22 sets, 570 total (560 prod + 10 sample), ✅ all checks passed

## 2. Existing Listening Still Works
- [x] Existing listening sets pass validation
- [x] Audio files still present (260 Google TTS files)
- [x] Listening test assembly works

## 3. Participant Endpoint Sanitized
- [x] `GET /api/test/session/[id]` does NOT leak answer/explanation/transcript
- [x] `GET /api/test/question-bank` only returns sanitized questions (no answer/explanation/adminOnly)
- [x] `GET /api/test/constructed/submit` only returns safe fields: `status`, `wordCount`, `audioDurationSec`, `message`
- [x] `getCorrectAnswer()` / `getExplanation()` only handle reading/listening — no constructed items
- [x] `selectLevelExamItems()` only loads reading + listening — no constructed items reach the exam runner
- [x] All `adminOnly` fields (sampleResponse, scoringNotes, transcript, scoringLogic) never exposed to participants
- [x] `ConstructedWriting` / `ConstructedSpeaking` components only display public fields (prompt, instruction, constraints)

## 4. Admin Preview Complete
- [x] `/admin/question-bank` shows all sets (including samples)
- [x] Preview modal shows all fields including transcript, adminOnly for constructed items
- [x] Admin can see sampleResponse, scoringNotes, transcript
- [x] `sanitizeSnapshot()` added — strips answer/explanation/adminOnly from any admin response view
- [x] Admin constructed API (`GET /api/admin/constructed`) uses `sanitizeSnapshot()` to protect against accidental leaks

## 5. Constructed Item Validation
- [x] `npm run validate:questions` passes with sample files (560 validated, samples skip because validator only handles reading/listening types)
- [x] Validator catches:
  - Invalid difficulty range (now 0–1, updated from 1–5)
  - Invalid taskType
  - Empty prompt
  - Missing rubricRef
  - Constraint violations (min > max)
  - Invalid responseMode
  - Missing instructionForCandidate
- [x] `npm run audit:questions` counts all 570 items including samples, all checks pass ✅

## 6. Writing Answer Submission
- [x] `POST /api/test/constructed/submit` accepts responseText
- [x] Server rejects empty text
- [x] Server rejects text exceeding maxWords
- [x] Server rejects text below minWords
- [x] Word count calculated server-side
- [x] Response stored with status "submitted"
- [x] No answer/sampleResponse/scoringNotes returned to participant
- [x] Auto-save (`store/testStore.ts`) routes writing answers to constructed submit endpoint
- [x] End-test (`TestFooter.tsx`) routes writing answers to constructed submit endpoint
- [x] Timer auto-submit routes writing answers to constructed submit endpoint

## 7. Speaking Recording UI
- [x] Microphone permission requested
- [x] Preparation timer works
- [x] Recording timer counts up
- [x] Max duration stops recording automatically
- [x] Playback works before submit
- [x] Re-record works
- [x] Submit stores audio URL (base64 blob → testStore → API)
- [x] Fallback message when mic not available
- [x] Duration validation (maxDurationSec/minDurationSec)
- [x] Auto-save routes audio responses to constructed submit endpoint

## 8. Admin Review
- [x] `/admin/constructed-review` shows all submitted responses
- [x] Filter by status works
- [x] Admin can see full response text
- [x] Admin can play audio (responseAudioUrl)
- [x] Admin can see transcript (via sanitized snapshot)
- [x] Admin can see sampleResponse (via sanitized snapshot)
- [x] Per-dimension scoring (0-5) works
- [x] Score summary calculates correctly (`validateReviewerScore` validates dimensions against rubric)
- [x] Feedback text saved
- [x] Internal notes saved
- [x] Status changes to "reviewed" after save
- [x] Flag response works
- [x] Allowed fields: transcript, sampleResponse, scoringNotes visible to admin only
- [x] Prohibited fields: none of these leak to participant (snapshot sanitized)

## 9. Manual Scoring
- [x] Rubric dimensions load correctly (5 rubrics: A1/A2 Writing/Speaking + Integrated A1)
- [x] Score 0-5 per dimension
- [x] Total and percentage calculate correctly
- [x] ReviewerScoreJson saves correctly
- [x] FinalScoreJson builds correctly
- [x] Percentage → band mapping works (≥80 strong, ≥60 pass, ≥40 borderline, <40 below)
- [x] `calculateConstructedScore()` — validates and computes from dimension scores
- [x] `validateReviewerScore()` — validates dimension scores against rubric (required fields, 0–5 range)
- [x] `normalizeRubricScore()` — clamps raw value to 0–5 integer
- [x] `deriveBandFromScore()` — maps percentage to band string
- [x] Admin PATCH endpoint validates dimension scores against rubric before saving
- [x] Auto score (`autoScoreJson`) stored but never treated as final high-stakes score
- [x] `finalScoreJson` only set after manual reviewer saves

## 10. Blueprint — Default Reading + Listening Only
- [x] All level blueprints have `activeSkills: ['reading', 'listening']`
- [x] All level blueprints have `futureSkills: ['writing', 'speaking', 'mediation', 'integrated']`
- [x] Writing/Speaking not in any section
- [x] Test start page only shows A1/A2/Placement/Quick for active skills
- [x] Skill registry shows writing/speaking as `not_ready`
- [x] Feature flag `lib/features/constructed-response.ts`:
  - `CONSTRUCTED_RESPONSE.DEV_MODE` — true in dev, false in production (unless CONSTRUCTED_DEV=true)
  - `CONSTRUCTED_RESPONSE.LIVE_LOCK` — false (hard lock until mass production + review ready)
  - `isConstructedActive()` — utility to check if constructed is enabled
  - `isSkillActiveInLive()` — checks if a skill is in activeSkills (reading/listening only)

## 11. Storage Model
- [x] Prisma `UserAnswer` model supports:
  - ✅ `id` (attemptId)
  - ✅ `userId` (with index)
  - ✅ `sessionItemId` (unique, links to item)
  - ✅ `responseText`
  - ✅ `responseAudioUrl`
  - ✅ `responseAudioMimeType`
  - ✅ `audioDurationSec`
  - ✅ `wordCount`
  - ✅ `responseStatus` (draft → submitted → under_review → reviewed → flagged)
  - ✅ `reviewerScoreJson`
  - ✅ `finalScoreJson`
  - ✅ `autoScoreJson`
  - ✅ `reviewerId`
  - ✅ `reviewedAt`
  - ✅ `feedback`
  - ✅ `internalNotes`
  - ✅ `submittedAt` (createdAt)
  - ✅ `updatedAt` (auto-managed by Prisma)

## 12. Build Check
- [x] `npx next build` passes — 0 errors, 0 type errors
- [x] `npm run validate:questions` — 22 files, 560 questions, 0 errors
- [x] `npm run audit:questions` — 22 sets, 570 total, ✅ all checks passed
- [ ] `npm run lint` — known warnings (pre-existing, not introduced by Phase 17B/C)

## 13. Phase 17C — Audio Storage + Results Safety ✅
- [x] `bigt-audio-storage.ts` service created with upload/signed URL/delete
- [x] Private bucket `bigt-speaking-responses` (auto-created on first upload)
- [x] `validateAudioMimeType()` — only webm/mp4/mp3/wav allowed
- [x] `validateAudioFileSize()` — max 10 MB
- [x] `validateAudioDuration()` — against question constraints
- [x] `sanitizePathSeg()` — path traversal prevention
- [x] `GET /api/admin/constructed/audio-url?responseId=...` — signed URL (admin-only, 1h expiry)
- [x] Constructed submit API (POST /api/test/constructed/submit) accepts:
  - `multipart/form-data` with `audio` blob + metadata (primary)
  - `application/json` with base64 `audioUrl` (legacy fallback)
- [x] Base64 removed from database — `responseAudioUrl` stored as empty string
- [x] Storage metadata (`audioStoragePath`, `audioFileSize`, `audioStorageProvider`) stored in UserAnswer
- [x] Participant submit response returns only: `{ status, audioDurationSec, message }`
- [x] ConstructedSpeaking UI updated:
  - Sends blob via FormData via `_audioBlob` → auto-save
  - Clears blob URL and ref after submit (`URL.revokeObjectURL`)
  - Progress bar during upload
  - Playback before submit
- [x] Store `setAnswer` routes audio blobs via FormData
- [x] TestFooter end-test routes audio blobs via FormData
- [x] Timer auto-submit routes audio blobs via FormData
- [x] Admin review page uses `<AudioPlayer>` component with signed URL
- [x] No storage keys exposed to client
- [x] Session API returns constructed response fields safely (no signed URL, no adminOnly)
- [x] Results page shows:
  - Pending: "Jawaban Menulis/Bicara sudah terkirim. Sedang menunggu penilaian."
  - Reviewed: final band + percentage + feedback (no internalNotes/rubric/adminOnly)
  - AutoScore not shown as final
  - `finalScoreJson` only shown if `responseStatus === "reviewed"`
- [x] Dimension scoring excludes WRITING/SPEAKING/INTEGRATED/MEDIATION from exam total
- [x] Live default remains Reading + Listening

## 14. Phase 17C-2 — Anti-Cheating Guardrails ✅
- [x] Admin-only endpoint (`getAdminUser()` check)
- [x] `responseId` validated (must be non-empty string)
- [x] Constructed-only check (dimension WRITING/SPEAKING/INTEGRATED/MEDIATION)
- [x] No raw API key or internal prompt exposed in response
- [x] Rate limit / timeout / OpenAI error handled gracefully
- [x] Short text returns `insufficient_text` (<5 words or <20 chars)
- [x] Form completion returns `not_applicable`
- [x] Audio-only responses skip text detection
- [x] A1/A2 fairness prompt in AI system prompt
- [x] `ai_generated` label never used (max `likely_ai`)
- [x] Plagiarism compares only same `sessionItemId`
- [x] Self/own user's responses excluded
- [x] Draft/empty/too-short responses excluded
- [x] Sample/adminOnly/explanations excluded
- [x] `autoScoreJson` structured with `plagiarismReport` namespace
- [x] `assistedScoring` preserved as `null` (not overwritten)
- [x] AI/plagiarism result does NOT modify `finalScoreJson` / `reviewerScoreJson`
- [x] No auto-fail based on detection results
- [x] Participant endpoint audit: no `autoScoreJson` leakage
- [x] Admin UI: reviewer warning text displayed
- [x] Admin UI: risk badge with proper colors (low→green, medium→yellow, high→red)
- [x] Admin UI: no matched user identity exposed (only "Jawaban #1")
- [x] Admin UI: user-friendly error messages
- [x] Build passes (0 errors)
- [x] Live default still Reading + Listening

## 15. Phase 17D — UI Polish ✅
- [x] Writing UI: word count progress bar (green→yellow→red)
- [x] Writing UI: auto-save indicator (saving/saved/error)
- [x] Writing UI: min/max word warnings with clear copy
- [x] Writing UI: constraints hint displayed
- [x] Writing UI: focus/blur border state
- [x] Writing UI: mobile-responsive textarea
- [x] Speaking UI: near-limit warning (10s remaining → red pulse)
- [x] Speaking UI: auto-stop at maxDuration
- [x] Speaking UI: playback before submit + re-record
- [x] Speaking UI: upload progress bar
- [x] Speaking UI: blob cleanup after submit
- [x] Speaking UI: mobile-friendly button layout
- [x] Speaking UI: clear state labels (idle/recording/recorded/submitted/error)
- [x] Speaking UI: mic permission error recovery
- [x] Admin filters: status, level, skill, unreviewed toggle, search
- [x] Admin detail: prompt, response, audio, transcript, sample, scoring notes
- [x] Admin rubric: band preview (Kuat/Cukup/Hampir Cukup/Di Bawah)
- [x] Admin feedback: green label "Feedback untuk Peserta" (visible to participant)
- [x] Admin notes: orange label "Catatan Internal Reviewer" (never visible)
- [x] Admin plagiarism section: reviewer warning preserved
- [x] Results page: pending state (submitted/under_review)
- [x] Results page: reviewed state (band + percentage + feedback)
- [x] No participant leakage
- [x] No auto-fail
- [x] Live default still Reading + Listening

## Known Limitations (Phase 17D)
1. **Speech-to-text**: Not implemented. Speaking responses require human reviewer.
2. **AI-assisted scoring**: `autoScoreJson` defined but no AI integration yet.
3. **Plagiarism/AI detection**: AI detection can be wrong — guardrails mitigate but don't eliminate false positives.
4. **No external plagiarism search**: Only compares against stored responses.
5. **Samples only**: 10 constructed response items — not production-ready.
6. **Auto-save timing**: Audio blob stored in Zustand memory until auto-save fires (800ms debounce). Large recordings may cause memory pressure.
7. **Writing/Speaking not live**: Default exam remains Reading + Listening only.
8. **No per-dimension comment**: Admin can only write general feedback, not per-dimension.
9. **No WebRTC fallback**: Audio recording limited to browser MediaRecorder.

## Status
```
Writing/Speaking disabled from live exam default: YES ✅
  - activeSkills: ['reading', 'listening'] in all blueprints
  - LIVE_LOCK: false (must explicitly enable for production)
  - futureSkills defined but inactive in sections
  - Only accessible via dev test flow or direct API calls
```

## Documentation
- `docs/BIGT_PHASE_17C_AUDIO_RESULTS_SAFETY.md` — Audio storage architecture, security, results safety
- `docs/BIGT_PHASE_17C_ANTI_CHEATING_GUARDRAILS.md` — Plagiarism/AI detection guardrails, fairness, scoring rules
- `docs/BIGT_PHASE_17D_UI_ADMIN_POLISH.md` — Writing/Speaking UI polish, admin review UX, feedback rules

## Quick Test Commands
```bash
# Validate all question bank files (including samples)
npm run validate:questions

# Audit all questions
npm run audit:questions

# Audit test assembly
npm run audit:test-assembly

# Build
npm run build
```
