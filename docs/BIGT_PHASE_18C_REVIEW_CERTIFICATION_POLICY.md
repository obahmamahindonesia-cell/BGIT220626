# BIGT Phase 18C — Reviewer Workflow & Certification Policy

## 1. Goal

Merapikan workflow reviewer dan kebijakan sertifikasi sebelum Writing/Speaking masuk ke live exam resmi.

Phase ini menjawab:
1. Bagaimana Writing/Speaking dinilai?
2. Kapan skor constructed response dianggap final?
3. Apa status review yang valid?
4. Bagaimana jika ada plagiarism/AI risk?
5. Kapan sertifikat boleh diterbitkan?
6. Apakah trial result boleh masuk certification?
7. Bagaimana hasil Reading/Listening digabung dengan Writing/Speaking nanti?
8. Apa yang peserta lihat sebelum dan sesudah review?

## 2. Current Live Policy

| Aspek | Nilai |
|-------|-------|
| Live skills | `reading`, `listening` |
| Constructed in live | `false` |
| Trial issues certificate | `false` |
| Manual review required | `true` |
| Anti-cheating auto-fail | `false` |
| Min certificate % | `0` (any score) |
| Weighting | Reading 50%, Listening 50% |
| **Full-skills certificate active** | **`false`** |

## 3. Trial Mode Policy

- Trial sessions (`product: TRIAL_A1|TRIAL_A2|DEV_FULL`) **tidak boleh** menerbitkan sertifikat resmi.
- Hasil trial hanya untuk QA/internal review.
- Complete route memeriksa `isTrialSession()` + `metadata.examMode` — defense in depth.
- Tidak ada `TestResult` atau `UserProfile.currentLevel` yang dibuat untuk trial session.

## 4. Future Full-Skills Policy (DISABLED)

Full-skills certificate (`BIGT_FULL_SKILLS_CERTIFICATE_ACTIVE = false`) akan aktif jika:

- Reading completed
- Listening completed
- Writing submitted dan reviewed
- Speaking submitted dan reviewed
- Tidak ada unresolved `flagged` / `needs_second_review`
- `finalScoreJson` Writing/Speaking tersedia
- Reviewer feedback selesai
- Result locked/finalized

Weighting recommendation (disabled):
| Skill | Weight |
|-------|--------|
| Reading | 25% |
| Listening | 25% |
| Writing | 25% |
| Speaking | 25% |

Saat ini live tetap 50/50 Reading/Listening.

## 5. Review Status Lifecycle

### Valid Statuses

```
draft → submitted → under_review → reviewed  (happy path)
                    → under_review → needs_second_review → under_review → reviewed
                    → flagged → reviewed | rejected
                    → rejected (terminal)
```

| Status | Meaning | Set when |
|--------|---------|----------|
| `draft` | Belum final submit | Not currently used by any endpoint |
| `submitted` | Peserta sudah mengirim | Default setelah submit constructed response |
| `under_review` | Sedang dinilai reviewer | Derivated when `reviewerScoreJson` exists |
| `reviewed` | Skor final tersedia | Admin menyimpan dengan status ini |
| `needs_second_review` | Butuh reviewer kedua | Admin memilih status ini |
| `flagged` | Perlu pemeriksaan risk/quality | Admin klik "Flag" atau pilih di dropdown |
| `rejected` | Jawaban tidak valid | Admin memilih status ini via dropdown |

### Rules

- `reviewed` hanya boleh jika semua rubric dimension valid (dicek frontend).
- `finalScoreJson` auto-computed saat status jadi `reviewed` (backend).
- `flagged` tidak otomatis berarti gagal — hanya sinyal untuk reviewer.
- `needs_second_review` tidak tampil sebagai gagal ke peserta.
- `rejected` harus punya alasan di `internalNotes`.
- Anti-cheating hanya mendorong `needs_second_review` / `flagged`, bukan auto-fail.

## 6. Reviewer Permissions

Saat ini (no role migration):

| Permission | ADMIN | TEST_TAKER |
|------------|-------|------------|
| `canReviewConstructedResponse` | ✅ | ❌ |
| `canFinalizeConstructedScore` | ✅ | ❌ |
| `canIssueCertificate` | ✅ | ❌ |
| `canOverrideStatus` | ✅ | ❌ |
| `canViewInternalNotes` | ✅ | ❌ |
| `canRejectResponse` | ✅ | ❌ |

Future roles (not implemented):
- `REVIEWER` — can score but not finalize
- `SENIOR_REVIEWER` — can second-review and finalize
- `CERTIFICATION_ADMIN` — can issue certificates

## 7. Score Finalization Rules

### Data Flow

```
Reviewer → reviewerScoreJson (dimension scores)
         → computeConstructedScore() → ConstructedScoreOutput
         → buildFinalScoreJson() → finalScoreJson
         → stored on UserAnswer
```

### Rules

- MCQ Reading/Listening: auto-scored via `scoring-engine.ts`
- Writing/Speaking: **harus manual reviewed**
- `autoScoreJson` hanya bantuan (plagiarism/AI detection)
- `reviewerScoreJson` adalah input reviewer (dimension scores)
- `finalScoreJson` adalah skor final (auto-computed dari reviewerScoreJson saat status `reviewed`)
- `finalScoreJson` hanya dibuat ketika:
  - Status `reviewed`
  - Semua dimension scores terisi
  - Rubrik valid
- Jika `flagged`: finalization dicegah (admin override possible)
- Jika `needs_second_review`: finalization dicegah sampai resolved
- Jika `rejected`: score 0, tidak bisa dinilai

### Blockers

`getConstructedReviewBlockers()` memeriksa:
- Status blocked (`flagged`, `needs_second_review`, `rejected`)
- Missing `reviewerScoreJson`
- Missing `finalScoreJson` saat status `reviewed`
- Response terlalu pendek
- Audio tidak tersedia untuk SPEAKING
- Plagiarism risk tinggi

## 8. Anti-Cheating Policy

- **Tidak ada auto-fail**. Plagiarism/AI detection hanya alat bantu reviewer.
- `autoScoreJson` berisi hasil deteksi yang hanya visible ke admin.
- Deteksi mendorong status `needs_second_review` atau `flagged`.
- Keputusan akhir tetap pada reviewer.
- Peserta tidak melihat:
  - Plagiarism details
  - AI detection details
  - Matched passages
  - Internal notes

## 9. Participant Result Visibility

| Participant state | What they see |
|-------------------|---------------|
| submitted | "Menunggu Penilaian" (clock icon) |
| under_review | "Sedang Dinilai" (eye icon) |
| needs_second_review | "Diperiksa Kembali" (user-check icon) |
| flagged | "Diperiksa Lebih Lanjut" (alert icon) — **NOT "curang"** |
| rejected | "Tidak Dapat Dinilai" (x-circle icon) + feedbackText if any |
| reviewed | Band (e.g. "pass") + percentage + feedbackText |

**Never exposed to participant:**
- `internalNotes`
- `reviewerScoreJson.dimensions`
- `autoScoreJson` (plagiarism/AI details)
- `adminOnly` fields
- Plagiarism match details
- Matched response IDs

## 10. Certificate Eligibility Rules

### Current (Reading + Listening only)

- Certificate bisa diterbitkan via `/api/certificates` POST endpoint
- Tidak ada threshold otomatis — admin bisa buat kapan saja
- Trial sessions tidak bisa menghasilkan certificate (blocked di complete route)

### Future (Full-Skills)

Tidak aktif. Jika diaktifkan, syaratnya:
- Reading completed ✅
- Listening completed ✅
- Writing submitted + reviewed ✅
- Speaking submitted + reviewed ✅
- No unresolved `flagged` / `needs_second_review`
- `finalScoreJson` tersedia untuk semua constructed items
- Score ≥ 30% (sama dengan CEFR A1 threshold)

## 11. Known Limitations

1. Writing/Speaking belum live default (`LIVE_LOCK: false`)
2. Reviewer role khusus (`REVIEWER`, `SENIOR_REVIEWER`) belum ada
3. Second-review workflow belum penuh — hanya status, belum routing
4. Certificate full-skills belum aktif
5. STT (speech-to-text) belum aktif
6. AI-assisted scoring belum final
7. `finalScoreJson` auto-computed dari `reviewerScoreJson.dimensions` — jika admin mengubah dimension setelah save, harus re-save
8. Rejected status tidak bisa diubah (hard block di PATCH)
9. No notification system — admin tidak dapat notifikasi saat ada response baru

## 12. Next Phase Recommendation

1. **Implement second-review workflow**: Route response to different reviewer
2. **Add REVIEWER role**: Separate from ADMIN for production reviewer teams
3. **Build notification**: Alert admin when new constructed responses arrive
4. **STT integration**: Transcribe speaking audio for reviewer
5. **AI-assisted scoring**: Draft score suggestions in `autoScoreJson`
6. **Certificate full-skills**: Activate `BIGT_FULL_SKILLS_CERTIFICATE_ACTIVE` when ready
7. **Weighted scoring**: Implement `getEffectiveWeighting()` in complete route
