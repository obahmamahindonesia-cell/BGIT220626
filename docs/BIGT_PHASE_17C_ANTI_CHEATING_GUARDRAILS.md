# BIGT Phase 17C-2 — Anti-Cheating Guardrails & Reviewer Safety

## 1. Feature Overview

The anti-cheating system provides **reviewer assistance** for constructed response (Writing/Speaking) items:
- **AI Text Detection** — Classifies writing responses as human-written or AI-generated via `gpt-4o-mini`
- **Plagiarism Detection** — Compares 4-word n-gram similarity against other responses to the same prompt
- **Combined Risk Assessment** — Derives overall risk level (`low`/`medium`/`high`/`needs_review`/`not_applicable`)
- **Results stored** in `autoScoreJson.plagiarismReport` — never affects final scoring

## 2. AI Detection Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| A1/A2 short text | False positives for simple/repetitive answers | `insufficient_text` guardrail if <5 words or <20 chars |
| Form completion | Not applicable for guided/form-based tasks | `not_applicable` label for form_completion/guided_writing |
| A1/A2 simplicity | Simple vocab + short sentences are NORMAL for A1/A2 | System prompt explicitly warns about A1/A2 fairness |
| No speaking STT | Cannot analyze speaking audio text yet | Returns `not_applicable` for audio-only responses |
| OpenAI accuracy | Classification can be wrong | Never used as automatic punishment — only reviewer signal |

### Label Mapping

| Label | Meaning | Color |
|-------|---------|-------|
| `human` | Pasti tulisan manusia | Green |
| `likely_human` | Kemungkinan besar manusia | Blue |
| `uncertain` | Tidak yakin | Yellow |
| `needs_review` | Mencurigakan — perlu review manual | Orange |
| `likely_ai` | Kemungkinan besar buatan AI | Red |
| `insufficient_text` | Teks terlalu pendek untuk analisis | Gray |
| `not_applicable` | Deteksi tidak berlaku untuk tipe ini | Gray |

The `ai_generated` label is intentionally **never used** — it's impossible to be 100% certain. The highest label is `likely_ai`.

## 3. Plagiarism Matching Logic

### Comparison Scope
- Only compares responses to the **same sessionItem** (same question)
- **Excludes** current response, draft responses, and own user's other responses
- **Excludes** empty/too-short responses (<5 words)
- **Excludes** sample answers, admin-only content, explanations/transcripts
- Limited to most recent 50 comparable responses

### Similarity Thresholds
| N-gram Jaccard Similarity | Interpretation | Action |
|--------------------------|----------------|--------|
| < 30% | No significant match | Low risk |
| 30-50% | Some similarity | Needs review |
| 50-70% | Notable similarity | Medium risk |
| > 70% | High similarity | High risk |

### Risk Derivation
| Condition | Risk Level |
|-----------|------------|
| No comparable responses | `not_applicable` |
| Score < 20 | `low` |
| Score >= 20 | `needs_review` |
| Score >= 40 with matches | `medium` |
| Score >= 70 with matches | `high` |

## 4. A1/A2 Fairness Rules

```
1. Word count < 5 OR text length < 20 chars
   → insufficient_text (skip AI detection)

2. Task type = form_completion OR guided_writing
   → not_applicable (skip AI detection)

3. Level A1/A2 in system prompt
   → Explicit instruction: simple/repetitive = NORMAL for A1/A2

4. Response mode = audio AND no text response
   → not_applicable (no text to analyze)

5. short_answer items
   → excluded from plagiarism check (single word/phrase answers)
```

## 5. Participant Leakage Rules

### Never exposed to participants:
- `autoScoreJson` — entire field excluded from participant API
- `plagiarismReport` — nested inside autoScoreJson
- `aiDetection` — AI detection result
- `matchedResponseId` — other user's answer ID
- `matchingPassages` — quoted passages from other responses
- `internalNotes` — admin-only notes
- `responseAudioUrl` — set to `null` in participant API
- `reviewerScoreJson` — raw dimension scores
- `adminOnly` fields from snapshot

### Exposed to participants (after review):
- `feedback` — reviewer's written feedback
- `scoreText` — final band label
- `scorePercentage` — final percentage
- `responseStatus` — status only (submitted/under_review/reviewed)
- `wordCount` — their own word count
- `audioDurationSec` — their own audio duration

### Participant Endpoint Audit

| Endpoint | autoScoreJson returned? | Notes |
|----------|------------------------|-------|
| `GET /api/test/session/[id]` | ❌ No | Only safe fields exposed |
| `POST /api/test/constructed/submit` | ❌ No | Returns `{ status, wordCount, message }` only |
| `GET /test/[sessionId]/results` | ❌ No | Fetches from session API, no autoScoreJson display |
| `POST /api/test/start` | ❌ No | Not relevant |
| `POST /api/test/submit-answer` | ❌ No | MCQ only |

## 6. Scoring Guardrails

```
autoScoreJson.plagiarismReport → SIGNAL ONLY
                                ↓
                  DOES NOT MODIFY:
                  - finalScoreJson
                  - reviewerScoreJson
                  - exam totalScore
                  - cefrLevel
                  - certificate eligibility
                  - pass/fail status
```

- Plagiarism results can auto-set `responseStatus = 'flagged'` only if admin explicitly chooses
- The system can show `needs_review` risk but never auto-fails a candidate
- Admin must manually decide to flag or review
- "Pemeriksaan ini hanya alat bantu review" warning displayed in admin UI

## 7. Admin-Only Security Rules

| Rule | Implementation |
|------|----------------|
| Endpoint authentication | `getAdminUser()` middleware — returns 401 if not admin |
| Response ownership validation | Checks `session.userId !== dbUser.id` on submit |
| constructed-only check | Validates dimension is WRITING/SPEAKING/INTEGRATED/MEDIATION |
| No API key leakage | Server-side only — never sent to client |
| No prompt leakage | Internal AI system prompt never exposed in API response |
| No raw model output | Cleaned response returned — no full OpenAI response body |
| Signed audio URLs | 1-hour expiry, admin-only endpoint |
| Rate limiting | OpenAI rate limit handled gracefully |
| Error messages | User-friendly, no stack traces or internal details |

## 8. Review Workflow

```
1. Admin opens constructed review page
2. Selects a response
3. Clicks "Jalankan Pemeriksaan"
4. Server runs AI detection + plagiarism check
5. Results stored in autoScoreJson.plagiarismReport
6. UI shows:
   - Overall risk badge (color-coded)
   - AI detection label + confidence + details
   - Plagiarism score + matching passages
   - Reviewer warning text
7. Admin scores manually per rubric dimension
8. Admin saves review → finalScoreJson set
9. Participant sees final score on results page
```

## 9. QA Checklist

### Security
- [x] admin-only endpoint
- [x] responseId validated
- [x] constructed-only check
- [x] no API key exposed
- [x] no internal prompt exposed
- [x] no full OpenAI response body exposed
- [x] error messages are user-friendly

### Participant Leakage
- [x] participant cannot access plagiarism endpoint
- [x] participant result does not include autoScoreJson
- [x] participant result does not include plagiarismReport
- [x] participant result does not include aiDetection
- [x] matchedResponseId not exposed to participants
- [x] matchingPassages not exposed to participants
- [x] responseAudioUrl set to null for participants

### A1/A2 Fairness
- [x] short text returns insufficient_text
- [x] form completion returns not_applicable
- [x] A1/A2 level hint in system prompt
- [x] audio-only responses skip text detection
- [x] simple/repetitive A1/A2 not auto-flagged

### Plagiarism Matching
- [x] compares only same sessionItem
- [x] current response excluded
- [x] draft responses excluded
- [x] empty/too-short responses excluded
- [x] own user's responses excluded
- [x] sample/adminOnly content excluded

### Scoring Guardrails
- [x] high AI/plagiarism does not auto-fail
- [x] finalScoreJson not modified by plagiarism check
- [x] reviewerScoreJson not modified by plagiarism check
- [x] exam totalScore not affected
- [x] cefrLevel not affected
- [x] certificate eligibility not affected

### Admin UI
- [x] reviewer warning text displayed
- [x] proper risk badge colors
- [x] AI detection label + confidence
- [x] plagiarism score + passage matches
- [x] no matched user identity exposed
- [x] error messages are user-friendly

### Regression
- [x] Reading/Listening endpoints unaffected
- [x] MCQ submit endpoint unaffected
- [x] test session API unaffected
- [x] results page unaffected
- [x] constructed submit endpoint unaffected
- [x] build passes (0 errors)
- [x] constructed live default still disabled (Reading + Listening only)

## 10. Known Limitations

1. **AI detection can be wrong** — especially for non-native speakers writing in Indonesian
2. **Short A1/A2 text is hard to classify** — guardrails mitigate but don't eliminate false positives
3. **Plagiarism only detects similarity among stored responses** — no external web search
4. **No speech-to-text** — speaking responses require human review for content
5. **No anti-plagiarism for speaking** — only writing responses are checked
6. **No AI detection for audio** — no STT pipeline for spoken response analysis
7. **Context-limited** — only compares against latest 50 responses for performance
8. **No caching** — each plagiarism check re-queries the database
9. **Matched passages not linked to specific users** — privacy by design but limits context

## 11. Next Phase Recommendations

1. Implement speech-to-text for speaking response transcription
2. Add web-scale plagiarism search (Google Custom Search / external API)
3. Implement caching for plagiarism comparison results
4. Add AI-assisted scoring integration (OpenAI/Gemini)
5. Batch plagiarism check (run overnight on all submissions)
6. Historical trend analysis for repeated plagiarism
7. Expand to B1-C2 levels with appropriate rubrics and fairness calibration

## 12. Confirmation

- ✅ Anti-cheating result is **reviewer assistance only**
- ✅ No automatic fail or score modification
- ✅ No participant leakage
- ✅ Live exam default still Reading + Listening
