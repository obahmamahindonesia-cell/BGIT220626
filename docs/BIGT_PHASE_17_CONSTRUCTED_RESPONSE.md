# PHASE 17 — BIGT Constructed Response Foundation for A1/A2 Writing & Speaking

## Tujuan Phase
Membangun fondasi sistem untuk constructed response: Writing, Speaking, Integrated Task, dan Mediation sederhana untuk A1/A2. Fokus pada sistem, schema, validator, storage, UI, admin review, dan scoring foundation — **bukan produksi soal massal**.

## File yang Dibuat / Diubah

### Types
- `types/question-bank.ts` — Ditambahkan:
  - `BIGTConstructedSkill`, `BIGTConstructedTaskType`, `BIGTResponseMode`, `BIGTScoringMode`
  - `ConstructedResponseItem` — Schema item constructed response
  - `ConstructedSet` — Set type untuk writing/speaking/integrated
  - Update `SanitizedQuestion` — Field baru untuk constructed response (instructionForCandidate, responseMode, constraints, dll.)
  - Update `QuestionSet` — Termasuk `ConstructedSet`

### Rubric
- `lib/rubrics/bigt-constructed-rubrics.ts` — Baru:
  - 5 rubrik: A1 Writing, A2 Writing, A1 Speaking, A2 Speaking, Integrated A1
  - `getRubric()`, `getRubricsForSkill()`, `getRubricsForLevel()`
  - `calculateConstructedScore()` — Hitung skor dari dimensi
  - `deriveBandFromScore()` — Tentukan band (below/borderline/pass/strong)
  - `validateReviewerScore()` — Validasi skor reviewer

### Validator
- `scripts/validate-question-bank.ts` — Diperbarui:
  - Validasi `ConstructedSet` dan `ConstructedResponseItem`
  - Cek taskType, responseMode, rubricRef, constraints, difficulty, adminOnly fields
  - ID format, level valid, skill valid
  - Constraint validation (min/max words, min/max duration)

### Prisma Schema
- `prisma/schema.prisma` — UserAnswer diperluas:
  - `responseText` — Jawaban teks untuk Writing
  - `responseAudioUrl` — URL audio untuk Speaking
  - `responseAudioMimeType`, `audioDurationSec`, `wordCount`
  - `reviewerId`, `reviewedAt`, `reviewerScoreJson`, `finalScoreJson`, `internalNotes`
  - `responseStatus` — Enum: draft/submitted/under_review/reviewed/flagged

### API Endpoints
- `app/api/test/constructed/submit/route.ts` — Baru:
  - `POST` — Submit jawaban constructed response
  - Validasi server: word count, duration, response mode
  - Storage ke UserAnswer dengan responseText/responseAudioUrl
  - Aman: tidak mengembalikan rubric/transcript/scoringLogic

- `app/api/admin/constructed/route.ts` — Baru:
  - `GET` — List responses dengan filter (status, sessionId, userId)
  - `PATCH` — Simpan reviewer score, feedback, internal notes
  - Enrich dengan user info (name, email)

### UI Components
- `components/test/ConstructedWriting.tsx` — Baru:
  - Textarea dengan word counter
  - Min/max word warning
  - Stimulus text/image/audio support
  - Copywriting Indonesia sederhana

- `components/test/ConstructedSpeaking.tsx` — Baru:
  - MediaRecorder API untuk merekam audio
  - Preparation timer
  - Recording timer dengan durasi maksimal
  - Playback sebelum submit
  - Re-record option
  - Error handling untuk permission mic

- `components/test/QuestionRenderer.tsx` — Diperbarui:
  - `renderEssay()` → menggunakan `ConstructedWriting`
  - `renderSpeaking()` → menggunakan `ConstructedSpeaking`

### Admin Review
- `app/admin/constructed-review/page.tsx` — Baru:
  - List semua constructed responses (filter by status)
  - Panel detail: prompt, jawaban, audio playback
  - Rubric-based per-dimension scoring (0-5)
  - Feedback untuk peserta
  - Internal notes
  - Flag response
  - Toggle admin-only content (sampleResponse, scoringNotes, transcript)
  - Admin-only fields tidak pernah bocor ke peserta

### Scoring Foundation
- `lib/scoring/constructed-scoring.ts` — Baru:
  - `computeConstructedScore()` — Hitung skor dari rubric + dimensi
  - `buildFinalScoreJson()` — Build final score object
  - `getConstructedResponseStatus()` — Status workflow

### Blueprint Integration
- `lib/test-blueprint/bigtLevelBlueprint.ts` — Diperbarui:
  - Semua blueprints punya `activeSkills` dan `futureSkills`
  - Default: `activeSkills: ['reading', 'listening']`
  - `futureSkills: ['writing', 'speaking', 'mediation', 'integrated']`
  - Writing/Speaking tidak aktif di live exam secara default

### Sample Items
- `data/question-bank/samples/` — 10 sample items untuk QA:
  - `a1-writing-sample.json` — 2 item (form_completion, message_reply)
  - `a2-writing-sample.json` — 2 item (short_text, picture_description)
  - `a1-speaking-sample.json` — 2 item (voice_read_aloud, voice_short_answer)
  - `a2-speaking-sample.json` — 2 item (voice_picture_description, voice_short_answer)
  - `integrated-sample.json` — 2 item (read_and_speak, simple_mediation)

### Admin Nav
- `app/admin/layout.tsx` — Ditambahkan link ke Review Menulis/Bicara

## Schema Constructed Response

```typescript
interface ConstructedResponseItem {
  id: string                    // BIGT-{CEFR}-{SKILL}-{SET}-{ITEM}
  level: 'A1' | 'A2'
  skill: 'WRITING' | 'SPEAKING' | 'INTEGRATED' | 'MEDIATION'
  taskType: string              // short_text, form_completion, dll.
  responseMode: 'text' | 'audio' | 'text_audio'
  prompt: string
  instructionForCandidate: string
  stimulus?: { type, text?, imageUrl?, audioUrl?, transcript? }
  constraints: { minWords?, maxWords?, minDurationSec?, maxDurationSec?, preparationTimeSec?, responseTimeSec? }
  rubricRef: string
  maxScore: number
  scoringMode: 'manual' | 'assisted' | 'auto_draft'
  cefrCanDo: string[]
  tags: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  adminOnly?: { sampleResponse?, explanation?, scoringNotes?, scoringLogic?, transcript? }
}
```

## Rubrik A1/A2

| Rubrik | Skill | Level | Dimensi | Max Score |
|--------|-------|-------|---------|-----------|
| BIGT-RUBRIC-A1-WRITING | WRITING | A1 | taskAchievement, vocabularyRange, grammarAccuracy, coherence, mechanics | 25 |
| BIGT-RUBRIC-A2-WRITING | WRITING | A2 | taskAchievement, vocabularyRange, grammarAccuracy, coherence, communicativeEffectiveness | 25 |
| BIGT-RUBRIC-A1-SPEAKING | SPEAKING | A1 | taskCompletion, pronunciation, fluency, vocabulary, grammarControl | 25 |
| BIGT-RUBRIC-A2-SPEAKING | SPEAKING | A2 | taskCompletion, pronunciation, fluency, vocabularyRange, grammarControl, interactionReadiness | 30 |
| BIGT-RUBRIC-INTEGRATED-A1 | INTEGRATED | A1 | comprehension, transferAccuracy, languageControl, clarity, taskCompletion | 25 |

Setiap dimensi diskor 0–5 dengan deskriptor per level.

## Sanitization Rules

Participant endpoint MENERIMA:
- id, level, skill, taskType, responseMode
- prompt, instructionForCandidate
- stimulus (text, imageUrl, audioUrl) — hanya field publik
- constraints (min/max words, duration, preparation time)

Participant TIDAK BOLEH MENERIMA:
- adminOnly (sampleResponse, explanation, scoringNotes, scoringLogic, transcript)
- rubric descriptor lengkap
- correctAnswer, correctOption

## Response Storage

Jawaban constructed response disimpan di `UserAnswer` dengan field:
- `responseText` — Jawaban teks (Writing)
- `responseAudioUrl` — URL audio (Speaking)
- `wordCount` — Dihitung server-side
- `audioDurationSec` — Durasi audio
- `reviewerScoreJson` — Skor per dimensi dari reviewer
- `finalScoreJson` — Skor final
- `responseStatus` — submitted → under_review → reviewed / flagged

## Flow Jawaban

1. Peserta melihat prompt + stimulus (teks/gambar/audio)
2. Menulis jawaban (Writing) atau merekam audio (Speaking)
3. Submit → validasi server (word count, duration)
4. Status: `submitted`
5. Admin review → beri skor per dimensi → feedback
6. Status: `reviewed`

## Known Limitations

1. **AI scoring belum final** — Writing/Speaking scoring 100% manual via admin review. AI score hanya draft/assisted jika diaktifkan nanti.
2. **Speaking pronunciation auto-analysis belum aktif** — Tidak ada speech-to-text atau analisis pelafalan otomatis.
3. **Writing/Speaking belum masuk live exam by default** — Masih `futureSkills`, hanya Reading + Listening yang aktif.
4. **Sample item masih dev/testing** — Hanya 10 sample item. Belum produksi massal.
5. **Human review masih diperlukan** — Semua Writing/Speaking harus direview admin sebelum mendapat skor final.
6. **Audio upload ke Supabase Storage** — Audio speaking disimpan sebagai base64 di state. Perlu upload ke Supabase Storage untuk production.
7. **Tidak ada anti-cheating untuk Writing** — Tidak ada deteksi copy-paste atau AI-generated text.

## Next Phase Recommendation

1. **Produksi soal Writing/Speaking massal** — Buat 100+ item per level per skill.
2. **AI-assisted scoring** — Integrasi dengan OpenAI/Gemini untuk draft score.
3. **Speech-to-text untuk Speaking** — Transkripsi otomatis untuk analisis pronunciation.
4. **Upload audio ke Supabase Storage** — Ganti base64 storage dengan signed URL.
5. **Integrasi Writing/Speaking ke blueprint** — Aktifkan `futureSkills` setelah konten dan review flow siap.
6. **Anti-cheating** — Tambahkan deteksi AI-generated text, plagiarism check.
7. **B1-C2 constructed response** — Perluas schema dan rubric untuk level atas.
