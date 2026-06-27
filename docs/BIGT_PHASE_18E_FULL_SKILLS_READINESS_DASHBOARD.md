# BIGT Phase 18E — Full-Skills Readiness Dashboard

## 1. Goal

Membuat dashboard admin untuk melihat kesiapan Writing/Speaking sebelum dipertimbangkan masuk live resmi. Dashboard membantu founder/admin menjawab:

1. Apakah bank Writing/Speaking cukup?
2. Apakah validator/audit aman?
3. Apakah trial full-skills berhasil?
4. Apakah constructed responses sudah direview?
5. Apakah ada blocker dari plagiarism/AI detection?
6. Apakah audio speaking aman?
7. Apakah results page aman?
8. Apakah sistem siap untuk pilot terbatas?
9. Apa yang masih belum siap untuk live public?

## 2. Dashboard Route

| Route | Halaman | Admin-only |
|-------|---------|------------|
| `/admin/full-skills-readiness` | Dashboard page | ✅ (via `getAdminUser()`) |
| `/api/admin/full-skills-readiness` | API endpoint | ✅ (unauthorized 401 for non-admin) |

Sidebar: "Kesiapan Full Skills" dengan icon `Gauge`.

## 3. Metrics Displayed

### Bank Soal
- Total items, Reading, Listening, Writing, Speaking, Integrated, Mediation
- Threshold per skill dengan indicator ✅/⚠️

### Trial Sessions
- Total, A1, A2, Dev Full, Completed
- Last trial date, link to `/admin/trial`

### Review Metrics
- Total constructed responses, pending, under review, reviewed, needs second review, flagged, rejected
- Review completion rate, average review time
- Warnings for reviewed-without-finalScoreJson, rejected-without-feedback
- Link to `/admin/constructed-review`

### Anti-Cheating / Risk Signals
- Low/Medium/High/Needs Review/Insufficient breakdown
- Disclaimer: "Risk signal adalah alat bantu reviewer, bukan keputusan final."

### Audio Speaking
- Total responses, with audio, missing audio
- Average duration, MIME type distribution
- Storage readiness note

### Safety Checklist
11 items covering: participant sanitization, adminOnly leakage, trial certificate, live default, finalScoreJson, anti-cheating, public access, build/validator/audit.

## 4. Readiness Score Logic

```ts
type ReadinessLevel = 'blocked' | 'needs_work' | 'pilot_ready' | 'live_ready_candidate'
```

- **blocked**: Safety checklist fail or bank < 100 items
- **needs_work**: Blockers > 3 or pending > 5 or insufficient trial/review data
- **pilot_ready**: Blockers ≤ 2, trials ≥ 2, review workflow running
- **live_ready_candidate**: Not currently achievable — requires explicit activation

Score 0–100 computed from 8 factors (bank, trials, reviews, flagged, audio, completion rate, risk, safety).

## 5. Blockers Logic

Blockers are dynamically computed from metrics:
- Safety checklist fail
- Trial sessions insufficient (< 2)
- Pending reviews > 10
- Flagged responses unresolved
- Reviewed without finalScoreJson
- Minimal reviewed responses not met
- Audio storage not production-grade

## 6. Recommendations Logic

Recommendations are derived from blockers plus general suggestions:
- Review pending responses
- Run more trial sessions
- Resolve flagged responses
- Finalize audio storage
- Activate full-skills certificate if ready
- Keep live default Reading + Listening
- Prepare limited pilot group

## 7. Security Rules

- Dashboard and API: **admin-only** (getAdminUser() check)
- No participant private data exposed
- No raw answers in summary
- No "Activate Live" button
- Risk signals are advisory, not auto-fail
- Build/validator/audit are static checks from docs

## 8. Limitations

1. **Readiness dashboard is advisory** — not a live activation system
2. **Build/validator/audit are hardcoded** — no runtime job to verify latest state
3. **STT not active** — speaking audio not transcribed
4. **AI-assisted scoring not final** — `autoScoreJson.assistedScoring` not implemented
5. **Full-skills certificate not active** — `BIGT_FULL_SKILLS_CERTIFICATE_ACTIVE = false`
6. **Mediation items don't exist** — shown as 0
7. **No real-time updates** — data refreshes on page load

## 9. QA Result

| Check | Status |
|-------|--------|
| Readiness page admin-only | ✅ |
| Non-admin blocked | ✅ |
| Bank counts display | ✅ |
| Trial metrics display | ✅ |
| Review metrics display | ✅ |
| Risk metrics display | ✅ |
| Audio readiness display | ✅ |
| Safety checklist display | ✅ |
| Readiness level calculated | ✅ |
| Blockers display | ✅ |
| Recommendations display | ✅ |
| No participant data leakage | ✅ |
| No raw answers exposed | ✅ |
| No Activate Live button | ✅ |
| Live default still Reading + Listening | ✅ |
| Writing/Speaking still not live default | ✅ |
| Build pass | ✅ |
| Validator pass | ✅ |
| Audit pass | ✅ |

## 10. Next Phase Recommendations

1. **Add real-time build/validator/audit checks** via CI job
2. **Implement second-review workflow** — route to different reviewer
3. **Add REVIEWER role** — separate from ADMIN
4. **STT integration** — transcribe speaking audio
5. **AI-assisted scoring** — draft score suggestions
6. **Create Mediation/Integrated items** — for Dev Full Test coverage
7. **Activate full-skills certificate** when ready
