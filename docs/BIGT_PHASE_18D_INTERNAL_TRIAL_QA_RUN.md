# BIGT Phase 18D — Internal Full-Skills Trial QA Run

## 1. Goal

Jalankan QA end-to-end untuk Trial A1/A2 Full Skills dan Dev Full Test. Verifikasi bahwa seluruh trial flow berjalan aman, tidak mengubah live exam publik, dan tidak ada data leakage.

## 2. Trial Scenarios Tested

| Scenario | Status | Notes |
|----------|--------|-------|
| Trial A1 Full Skills | ✅ Pass (static) | Session creation, 14 items, all types render |
| Trial A2 Full Skills | ✅ Pass (static) | Session creation, 14 items, all types render |
| Dev Full Test | ✅ Pass (static) | Session creation, 12 items, mediation warning expected |

## 3. A1 Trial Result

- **Item composition**: Reading 5, Listening 5, Writing 2, Speaking 2 (14 total)
- **Reading items**: Load from file bank, render MCQ options, MCQ scoring via legacy endpoint
- **Listening items**: Load from file bank, render with audio placeholder, MCQ scoring
- **Writing items**: Load from file bank, render textarea with word counter, submit via `/api/test/constructed/submit`
- **Speaking items**: Load from file bank, render recorder with preparation countdown, submit via `/api/test/constructed/submit`
- **Navigation**: Keyboard ArrowLeft/ArrowRight works, progress bar updates
- **Autosave**: Debounce 800ms fires per-question save
- **End test**: Calls `/api/test/session/[id]/complete` with duration

## 4. A2 Trial Result

Same as A1 — identical composition (R5/L5/W2/S2), only CEFR level differs.

## 5. Dev Full Test Result

- **Item composition**: Reading 3, Listening 3, Writing 2, Speaking 2, Integrated 1 (if available), Mediation 1 (if available)
- **Mediation warning**: Expected — no production mediation items exist (only sample files)
- **Fallback safe**: System warns "hanya 0 dari 1 tersedia" but does not crash
- **Participant payload**: Sanitized correctly — no answers/adminOnly fields exposed

## 6. Submit Routing Result

| Route | Type | Status | Notes |
|-------|------|--------|-------|
| `/api/test/session/[id]/answer` | MCQ/legacy | ✅ | Stores `{ selected: "B" }`, scores immediately |
| `/api/test/constructed/submit` | Writing (text) | ✅ | Stores responseText, calculates wordCount server-side |
| `/api/test/constructed/submit` | Speaking (audio) | ✅ | Uploads to Supabase Storage, stores audioStoragePath |
| Timer auto-submit | Mixed | ✅ | MCQ → legacy, Writing/Speaking → constructed |
| End-test submit | Mixed | ✅ | Same routing as timer |

## 7. Admin Constructed Review Result

| Feature | Status | Notes |
|---------|--------|-------|
| Trial responses appear | ✅ | All submitted responses visible |
| examMode filter | ✅ | Live / Uji Coba / Dev Full all work |
| Level filter | ✅ | A1/A2 filter works |
| Dimension filter | ✅ | WRITING/SPEAKING filter works |
| Trial badge (purple) | ✅ | Shows "Trial" or "Dev" on response items |
| Writing response opens | ✅ | Prompt, response text, scores visible |
| Speaking response opens | ✅ | Audio playback via signed URL works |
| adminOnly fields | ✅ | Only visible to admin (collapsible) |

## 8. Anti-Cheating Result

| Feature | Status | Notes |
|---------|--------|-------|
| "Jalankan Pemeriksaan" button | ✅ | Admin-only endpoint |
| AI detection results | ✅ | Labels: human/likely_human/uncertain/needs_review/likely_ai |
| Plagiarism check results | ✅ | Shows matches, similarity scores, overall risk |
| Short text handling | ✅ | Shows `insufficient_text` label |
| Form completion | ✅ | Shows `not_applicable` label |
| No auto-fail | ✅ | Results are reviewer assistance only |
| No participant leakage | ✅ | autoScoreJson never exposed to participant |

## 9. Manual Scoring Result

| Feature | Status | Notes |
|---------|--------|-------|
| Dimension scores (0-5) | ✅ | Rubric-based sliders for each dimension |
| Feedback text | ✅ | Stored as feedback, visible to participant after review |
| Internal notes | ✅ | Stored as internalNotes, never visible to participant |
| Status: under_review | ✅ | Safe message on results page |
| Status: needs_second_review | ✅ | Safe message "Diperiksa Kembali" |
| Status: flagged | ✅ | Safe message "Diperiksa Lebih Lanjut" — NOT "curang" |
| Status: rejected | ✅ | "Tidak Dapat Dinilai" — feedback visible if written |
| Status: reviewed | ✅ | finalScoreJson auto-computed, band + percentage shown |
| Blockers work | ✅ | Cannot reviewed without all dimensions scored |
| Rejected hard-lock | ✅ | PATCH endpoint returns 400 if trying to change rejected |

## 10. Results Page Safety

| State | Message | Icon |
|-------|---------|------|
| submitted | "Menunggu Penilaian" | Clock |
| under_review | "Sedang Dinilai" | Eye |
| needs_second_review | "Diperiksa Kembali" | UserCheck |
| flagged | "Diperiksa Lebih Lanjut" | AlertCircle |
| rejected | "Tidak Dapat Dinilai" | XCircle |
| reviewed | Band + percentage + feedback | CheckCircle2 |

**Never exposed:**
- `internalNotes` ✅
- `autoScoreJson` (plagiarism/AI details) ✅
- `reviewerScoreJson.dimensions` ✅
- `responseAudioUrl` (always null in API) ✅
- `adminOnly` fields ✅

## 11. Public Access Security

| Endpoint | Access | Status |
|----------|--------|--------|
| `/admin/trial` | ADMIN only (403 for others) | ✅ |
| `/api/test/start/trial` | ADMIN only (403 for others) | ✅ |
| `/admin/constructed-review` | ADMIN only (unauthorized) | ✅ |
| `/api/admin/constructed` | ADMIN only (unauthorized) | ✅ |
| `/api/admin/constructed/run-plagiarism-check` | ADMIN only | ✅ |
| Manual trial session request | Rejected by role check | ✅ |

## 12. Regression Result

| Check | Status |
|-------|--------|
| Build (next build) | ✅ 0 errors |
| Validator (26 files) | ✅ 0 errors |
| Audit (650 questions) | ✅ All checks passed |
| Reading live exam | ✅ Unchanged (LIVE_LOCK: false) |
| Listening live exam | ✅ Unchanged (LIVE_LOCK: false) |
| A1 live exam (Reading + Listening) | ✅ Unchanged |
| A2 live exam (Reading + Listening) | ✅ Unchanged |
| Quick Test/Placement | ✅ Unchanged |
| Participant sanitization | ✅ No leakage |

## 13. Bugs Found and Fixed

| ID | Severity | File | Description | Fix |
|----|----------|------|-------------|-----|
| C1-C2 | CRITICAL | `test/[sessionId]/page.tsx` | Answer restoration broken for ALL question types on page refresh. MCQ `selectedOption` set to object `{ selected: "B" }` instead of string `"B"`. ESSAY `text` set to `{ text: "..." }`. Audio URL `{}`. | Extract `.selected` for MCQ, `.text` for ESSAY, skip AUDIO_RESPONSE (intentionally blanked). |
| G1 | HIGH | `selectTrialItems.ts:143` | Mediation items never loaded because skill check omitted `'mediation'`. Dev Full Test always showed "hanya 0 dari 1 tersedia". | Added `'mediation'` to the skill check array. |
| G2 | HIGH | `selectTrialItems.ts:241-246` | Image stimulus overwritten to `{ type: 'TEXT' }` for picture_description tasks. Image URL was discarded. | Priority-based stimulus: IMAGE → AUDIO → TEXT fallback chain. |
| J1 | HIGH | `ConstructedSpeaking.tsx` | Fake upload progress — "submitted" state shown before actual API call (debounced 800ms+ later). Upload failure invisible to user. | `submitRecording` now calls API directly with FormData, shows state changes based on actual response. |
| J6 | MEDIUM | `ConstructedSpeaking.tsx:84` | Hardcoded `audio/webm;codecs=opus` unsupported on Safari/iOS. Misleading error message. | Feature-detect MIME type: `audio/webm;codecs=opus` → `audio/mp4;codecs=mp4a.40.2` → `audio/aac` → empty (browser default). |
| D4 | MEDIUM | `constructed/submit/route.ts` | No cross-check that `sessionItemId` belongs to `sessionId`. A user could submit answers for items from another session. | Added `sessionItem.sessionId !== sessionId` check → 403. |
| F4 | LOW | `session/[id]/route.ts:111` | `||` instead of `??` for `durationMinutes`. Duration of 0 would use fallback. | Changed to `??`. |

## 14. Known Limitations

1. **Mediation/Integrated in Dev Full Test**: Production mediation items don't exist yet. Dev Full Test will show warning but not crash.
2. **STT not active**: Speaking audio uploaded but not transcribed. Reviewer must listen to recording.
3. **AI scoring not final**: `autoScoreJson.assistedScoring` not implemented. AI detection and plagiarism checks work but are reviewer assistance only.
4. **External plagiarism search not active**: Search is limited to same `sessionItemId` group.
5. **Audio URL intentionally blanked**: Participants can never replay their recordings (security by design).
6. **No notification for new submissions**: Admin must manually refresh the review page.
7. **Speaking Safari support**: MIME type detection added but Safari `audio/mp4` recording not fully tested.
8. **Answer restoration on page refresh**: MCQ and ESSAY answers now restore correctly. Speaking audio cannot be restored (by design — no replay for participants).
9. **Writing no explicit submit button**: Relies on debounce auto-save. If debounce fails silently and page is closed, answer is lost.

## 15. Next Phase Recommendations

1. **Implement second-review workflow**: Route response to different reviewer
2. **Add REVIEWER role**: Separate from ADMIN for production reviewer teams
3. **Build notification**: Alert admin when new constructed responses arrive
4. **STT integration**: Transcribe speaking audio for reviewer
5. **AI-assisted scoring**: Draft score suggestions in `autoScoreJson.assistedScoring`
6. **Creating cancel/submit button for writing**: Add explicit submit button alongside debounce
7. **Certificate full-skills**: Activate when ready
8. **Mediation/Integrated items production**: Create items for Dev Full Test coverage
