# BIGT Phase 17D — Writing/Speaking UI Polish + Admin Review Polish

## 1. Goal

Polish participant and admin experiences for constructed response (Writing/Speaking) before gradual A1–A2 production rollout.

**No** production questions added. **No** Writing/Speaking activated in live exam.

## 2. Writing UI Behavior

### Components
- `ConstructedWriting.tsx` — standalone writing component
- `QuestionRenderer.tsx` — delegates ESSAY → `ConstructedWriting`

### States
| State | Visual | Copy |
|-------|--------|------|
| Idle | Large textarea, placeholder text | "Tulis jawabanmu di bawah ini. Gunakan kalimat sederhana." |
| Typing | Autosave indicator (saving/saved/error), word counter bar | "Tersimpan" / "Menyimpan" / "Gagal Simpan" |
| Over limit | Red progress bar, red border, warning box | "Jawaban terlalu panjang. Maksimal X kata." |
| Under min | Yellow progress bar, yellow warning box | "Jawaban masih terlalu pendek. Minimal X kata." |
| Submitted | Success banner | "Jawaban tersimpan secara otomatis." |

### Features
- Word count progress bar (green → yellow → red)
- Auto-save indicator in bottom-left of textarea
- Min/max word count hints displayed above textarea
- Constraints shown as hints (`Minimal X kata · Maksimal X kata`)
- Focus/blur border state
- Mobile-responsive textarea (`min-h-[280px]`, `resize-y`)

### Never Displayed
- Sample answer
- Explanation
- Scoring notes
- Rubric internal
- AI detection result
- Plagiarism result

## 3. Speaking UI Behavior

### Components
- `ConstructedSpeaking.tsx` — standalone speaking component
- `QuestionRenderer.tsx` — delegates AUDIO_RESPONSE → `ConstructedSpeaking`

### States
| State | Visual | Copy |
|-------|--------|------|
| Idle | Mic icon, start button, duration hint | "Tekan tombol di bawah untuk mulai merekam jawaban." |
| Preparing | Countdown timer (if preparation time > 0) | "Waktu persiapan" |
| Recording | Red pulsing dot, timer, remaining time | "Merekam..." + live timer |
| Near limit | Red pulsing remaining time warning | "Rekaman akan berakhir sebentar lagi!" |
| Recorded | Checkmark, audio player, re-record/send buttons | "Dengarkan kembali sebelum mengirim." |
| Uploading | Spinner + progress bar | "Mengirim jawaban..." |
| Submitted | Checkmark, duration summary | "Jawaban terkirim" |
| Error | Error icon + message + retry button | "Mikrofon tidak dapat diakses." |

### Features
- Auto-stop at `maxDurationSec`
- Near-limit warning at 10 seconds remaining
- Playback before submit
- Re-record option
- Upload progress bar (simulated)
- Blob cleanup after submit (`URL.revokeObjectURL`)
- Mobile-friendly button layout (stack on mobile, row on desktop)

### Never Displayed
- Transcript
- Scoring notes
- AI/plagiarism result
- Internal rubric
- Sample response

## 4. Admin Review UI

### Filters
| Filter | Type | Options |
|--------|------|---------|
| Status | Button group | Semua, submitted, under_review, reviewed, flagged |
| Level | Button group | Semua, A1, A2 |
| Skill | Button group | Semua, Writing, Speaking |
| Unreviewed only | Toggle | Only show submitted/under_review |
| Search | Text input | Search by user name or response text |

### Detail Panel
- **Prompt** and instruction text
- **Constraints** (min/max words, max duration)
- **Candidate response** text (scrollable, max-h-48)
- **Audio playback** via signed URL (admin-only endpoint)
- **Transcript** (admin only — toggled)
- **Sample response** (admin only — toggled)
- **Scoring notes** (admin only — toggled)
- **Rubric per-dimension scoring** 0-5 with band preview
- **Band preview** (Kuat/Cukup/Hampir Cukup/Di Bawah)
- **AI score** draft (if exists)
- **Plagiarism/AI detection** section with reviewer warning
- **Feedback for participant** (green label, visible to participant after review)
- **Internal notes** (orange label, never visible to participant)

### Reviewer Warning
"Pemeriksaan ini hanya alat bantu review. Keputusan akhir tetap melalui penilaian reviewer."

## 5. Rubric Scoring UX

### Per Dimension
- Dimension name (`nameId`) and description
- Score selector 0-5 (inline buttons)
- Level label for selected score
- Total auto-calculated

### Score Summary
- Total / Max (e.g., `15 / 25 (60%)`)
- Band preview color-coded:
  - ≥80% → "Kuat" (green)
  - ≥60% → "Cukup" (blue)
  - ≥40% → "Hampir Cukup" (yellow)
  - <40% → "Di Bawah" (red)

### Rules
- All dimensions must be scored before save
- Missing dimension warning: "Semua dimensi harus dinilai."
- `finalScoreJson` only created after admin saves manual review
- `autoScoreJson` never becomes final
- `plagiarismReport` never auto-fills scores

## 6. Feedback Visibility Rules

| Field | Visible to Admin | Visible to Participant |
|-------|-----------------|----------------------|
| `feedback` | ✅ Yes | ✅ Yes (after `responseStatus === 'reviewed'`) |
| `internalNotes` | ✅ Yes | ❌ Never |
| `reviewerScoreJson` | ✅ Yes | ❌ Never |
| `finalScoreJson` | ✅ Yes | ✅ Only band + percentage |
| `autoScoreJson` | ✅ Yes | ❌ Never |
| `plagiarismReport` | ✅ Yes | ❌ Never |

## 7. Results Page Visibility

### Before Review
- "Jawaban Writing/Speaking kamu sudah terkirim."
- Status badge: "Menunggu" (submitted) or "Sedang Dinilai" (under_review)

### After Review
- Band label (e.g., "Kuat A1") from `finalScoreJson.band`
- Percentage from `finalScoreJson.percentage`
- Feedback text from `feedback` field
- Status badge: reviewed

### Never Displayed to Participant
- `autoScoreJson`
- AI detection results
- Plagiarism report
- `internalNotes`
- `scoringLogic`
- `sampleResponse`
- `transcript` (admin-only)
- Signed audio URL

## 8. Anti-Cheating UI Rules

- Plagiarism/AI detection section only visible in admin review
- Warning text displayed: "Pemeriksaan ini hanya alat bantu review."
- No matched user identity shown (only "Jawaban #1")
- AI detection never auto-fails candidate
- Results page never references plagiarism/AI

## 9. Mobile/Responsive Notes

| Page | Mobile | Desktop |
|------|--------|---------|
| Writing | Full-width textarea, stacked layout | Same with max-width constraint |
| Speaking | Stacked buttons, full-width audio player | Side-by-side buttons |
| Admin review list | Single column | Two-column grid (xl:grid-cols-2) |
| Admin detail panel | Full-width below list | Side panel right of list |
| Rubric scoring | 0-5 buttons horizontally scrollable if needed | Inline buttons |
| Results | Single column cards | Two-column grid (sm:grid-cols-2) |

## 10. QA Result

- [x] Writing UI mobile pass
- [x] Writing UI desktop pass
- [x] Speaking UI mobile pass
- [x] Speaking UI desktop pass
- [x] Textarea works with word counter
- [x] Min/max word warning works
- [x] Auto-save indicator works
- [x] Recorder permission error handled
- [x] Start/stop recording works
- [x] Near-limit warning works
- [x] Auto-stop at max duration works
- [x] Playback before submit works
- [x] Re-record works
- [x] Upload loading/progress works
- [x] Blob cleanup after submit
- [x] Admin list loads with filters
- [x] Admin filter by status/level/skill works
- [x] Unreviewed toggle works
- [x] Search by name/text works
- [x] Rubric per-dimension scoring works
- [x] Missing dimension warning works
- [x] Band preview displays correctly
- [x] Final score saved only after manual review
- [x] Feedback visible to participant only after reviewed
- [x] Internal notes never visible to participant
- [x] Plagiarism/AI detection visible only to admin
- [x] Results pending state works
- [x] Results reviewed state works
- [x] Reading/Listening regression pass
- [x] Live default still Reading + Listening

## 11. Known Limitations

1. **Constructed sample still 10** — not enough for production
2. **Writing/Speaking not live** — default exam remains Reading + Listening
3. **Speech-to-text not implemented** — speaking requires human review
4. **AI-assisted scoring not final** — `autoScoreJson` draft only
5. **No web plagiarism search** — only compares stored responses
6. **No per-dimension comment field** — admin can only write general feedback
7. **Audio recording limited to browser MediaRecorder** — no WebRTC fallback

## 12. Next Phase Recommendation

1. Mass production of Writing/Speaking items (100+ per level per skill)
2. Speech-to-text for speaking response transcription
3. AI-assisted scoring integration (OpenAI/Gemini)
4. Activate Writing/Speaking in blueprints when content + review flow are ready
5. Per-dimension comment field in admin review
6. Historical review analytics

## 13. Confirmation

- ✅ No participant leakage
- ✅ No auto-fail
- ✅ Final score only after manual review
- ✅ Live exam default still Reading + Listening
