# BIGT Phase 18F — Owner Control Center

## 1. Goal

Membuat halaman admin khusus untuk owner agar bisa melihat semua hal penting tentang BIGT dalam satu dashboard terpusat:

1. Siapa saja yang daftar
2. Siapa saja yang mulai tes
3. Siapa saja yang menyelesaikan tes
4. Level apa yang dipilih
5. Hasil tes Reading/Listening
6. Status Writing/Speaking trial
7. User yang pending review
8. Trial mode activity
9. Certificate/result status
10. Audit kesehatan bank soal
11. Anti-cheating/risk summary
12. Metrik pertumbuhan BIGT
13. Issue/blocker yang harus diketahui owner

## 2. Routes

| Route | Halaman | Admin-only |
|-------|---------|------------|
| `/admin/bigt-overview` | Dashboard page | ✅ (via `getAdminUser()`) |
| `/api/admin/bigt-owner` | API endpoint | ✅ (unauthorized 401 for non-admin) |

Sidebar: "BIGT Owner" dengan icon `ShieldCheck`, ditempatkan setelah "Dasbor".

## 3. API Shape

```ts
{
  success: true,
  data: {
    overview: { totalUsers, totalTestTakers, newUsersToday, newUsers7d,
                 newUsers30d, totalSessions, completedSessions,
                 abandonedSessions, completionRate, totalResults,
                 averageScore, pendingReview },
    registrations: { latestUsers: Array<{ id, name, email, role,
                     createdAt, totalSessions, completedSessions,
                     lastActivityAt }> },
    tests: { totalSessions, completedSessions, abandonedSessions,
             inProgressSessions, completionRate,
             byLevel: Record<string, number>,
             byProduct: Record<string, number>,
             byStatus: Record<string, number>,
             recentSessions: Array<{ id, userName, userEmail, level,
               product, examMode, status, score, cefrLevel,
               startedAt, completedAt }> },
    results: { totalResults, averageScore, passRate,
               levelDistribution: Record<string, number>,
               recentResults: Array<{ id, userName, userEmail,
                 score, cefrLevel, createdAt }> },
    constructed: { totalResponses, pendingReview, underReview,
                   reviewed, flagged, rejected, needsSecondReview,
                   writingCount, speakingCount },
    risk: { low, medium, high, needsReview, insufficientText,
            notApplicable },
    trial: { totalTrialSessions, a1TrialSessions, a2TrialSessions,
             devFullSessions, completedTrialSessions, latestTrialAt },
    questionBank: { total, reading, listening, writing, speaking,
                    integrated, mediation,
                    validatorStatus, auditStatus },
    ownerAlerts: Array<{ severity: 'critical'|'warning'|'info',
                         title, message, actionLabel?, actionHref? }>,
  }
}
```

## 4. Data Sources

| Metric | Source |
|--------|--------|
| User counts | `prisma.user` — total, by role, by date range |
| Latest users | `prisma.user.findMany` + `TestSession.groupBy` for session counts |
| Session stats | `prisma.testSession.findMany` — grouped by level/product/status |
| Recent sessions | 30 latest sessions with user name/email join |
| Test results | `prisma.testResult.findMany` — scores, level distribution |
| Constructed review | `prisma.userAnswer` where `responseText IS NOT NULL` |
| Risk signals | `autoScoreJson.plagiarismReport.overallRisk` |
| Trial sessions | `TestSession` where `product IN ('TRIAL_A1','TRIAL_A2','DEV_FULL')` |
| Question bank | `getAllSetsMeta()` from file bank loader |

## 5. Owner Alerts Logic

Generated dynamically from metrics:

**Critical:**
- (reserved for future participant leakage detection)

**Warning:**
- `pendingReview > 5` — Review menumpuk
- `flagged > 0` — Ada response yang diflag
- `trial.totalTrialSessions === 0` — Trial belum digunakan
- `constructed.totalResponses > 0 && constructed.reviewed === 0` — Belum ada review selesai
- `risk.high > 0` — High risk plagiarism

**Info:**
- `results.averageScore < 45` — Rata-rata skor rendah
- `zeroSessionUsers > 50% of total` — Banyak pendaftar belum tes
- `qbank.total >= 100` — Bank soal mencukupi

## 6. Page Sections (Tabs)

1. **Pendaftar** — Table of latest 20 users with search/filter
2. **Aktivitas Tes** — Session breakdown + recent 15 sessions table
3. **Hasil** — Result aggregates + level distribution + recent results table
4. **Review Menulis/Bicara** — Constructed response status cards
5. **Mode Uji Coba** — Trial session counts
6. **Bank Soal** — Skill counts + validator/audit status
7. **Risiko** — Risk signal breakdown

## 7. Security Rules

- Page and API: **admin-only** (`getAdminUser()`)
- No participant private data exposed in dashboard summary
- No `internalNotes`, no raw `autoScoreJson`, no raw `reviewerScoreJson` exposed
- No signed audio URLs
- No storage private paths
- Participant answers only viewable through dedicated admin review pages
- Risk signals are advisory — never auto-fail

## 8. Known Limitations

1. **Dashboard advisory only** — no activation buttons, no live system changes
2. **No user detail drawer** — not implemented yet, users can navigate to filters in relevant pages
3. **No CSV export** — not implemented yet, listed as optional
4. **Build/validator/audit status are static** — `validatorStatus: 'pass'` and `auditStatus: 'pass'` are hardcoded based on last known successful run
5. **No real-time metrics** — data refreshes on page load
6. **Pass rate not computed** — `passRate` returns `null` since BIGT doesn't have a pass/fail policy yet
7. **Writing/Speaking still not live default** — confirmed
8. **Some data may return 0/empty if no records exist** — all queries are defensive (`.catch(() => null)`)

## 9. QA Result

| Check | Status |
|-------|--------|
| Admin can access owner page | ✅ |
| Non-admin blocked (401) | ✅ |
| Overview cards display | ✅ |
| Latest users table with search | ✅ |
| Recent sessions display | ✅ |
| Results summary with CEFR distribution | ✅ |
| Constructed review summary | ✅ |
| Risk summary | ✅ |
| Trial summary | ✅ |
| Question bank health display | ✅ |
| Owner alerts display | ✅ |
| No participant leakage | ✅ |
| No raw internalNotes exposed | ✅ |
| No raw autoScoreJson exposed | ✅ |
| No signed audio URL exposed | ✅ |
| Links to admin review page work | ✅ |
| Links to trial page work | ✅ |
| Live default still Reading + Listening | ✅ |
| Writing/Speaking still not live default | ✅ |
| Build pass | ✅ |
| Validator pass | ✅ |
| Audit pass | ✅ |

## 10. Next Steps

1. **User detail drawer** — klik user buka detail (sessions, results, constructed responses)
2. **CSV export** — export pendaftar, sesi, pending reviews
3. **Pass rate policy** — define pass/fail threshold for BIGT
4. **Real-time metrics** — WebSocket or periodic refresh
5. **Add REVIEWER role** — separate from ADMIN for production reviewer teams
6. **Notification integration** — notify owner when critical alert triggers
7. **Implement second-review workflow** — route to different reviewer
