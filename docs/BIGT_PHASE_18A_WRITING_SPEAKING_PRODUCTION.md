# Phase 18A — BIGT A1/A2 Writing & Speaking Controlled Task Production

## 1. Goal

Mulai produksi massal task Writing dan Speaking untuk A1 dan A2 secara bertahap, terstruktur, tervalidasi, dan aman. Phase ini menambah **80 production-ready constructed response tasks** ke bank soal BIGT.

**Keputusan penting:**
- Task baru tidak diaktifkan ke live exam default
- Semua task melewati validator dan audit
- Task cocok dengan CEFR A1/A2 Can-Do
- Semua task menggunakan constructed response schema Phase 17
- Admin-only field tidak bocor ke participant

## 2. Item Count Produced

| Skill | Level | Task Type Distribution | Count |
|-------|-------|----------------------|-------|
| Writing | A1 | guided_sentence (4), form_completion (4), message_reply (4), short_text (4), picture_description (4) | 20 |
| Speaking | A1 | voice_read_aloud (7), voice_short_answer (7), voice_picture_description (6) | 20 |
| Writing | A2 | short_text (5), message_reply (4), picture_description (4), simple_mediation (3), form_completion (4) | 20 |
| Speaking | A2 | voice_short_answer (6), voice_picture_description (5), read_and_speak (5), simple_mediation (4) | 20 |
| **Total** | | | **80** |

## 3. File List

| File Path | Items |
|-----------|-------|
| `data/question-bank/a1/writing/set-01.json` | 20 |
| `data/question-bank/a1/speaking/set-01.json` | 20 |
| `data/question-bank/a2/writing/set-01.json` | 20 |
| `data/question-bank/a2/speaking/set-01.json` | 20 |

## 4. A1 Writing Design Notes

**Pendekatan:**
- Kalimat sangat sederhana (2–3 kalimat)
- Fokus: perkenalan diri, keluarga, makanan, hobi, rumah
- Task type: guided_sentence, form_completion, message_reply, short_text, picture_description
- Stimulus teks untuk items picture_description (tanpa gambar aktual)
- Batas kata: min 5–10, max 25–40

**Konteks:**
- Self-introduction (nama, asal kota)
- Keluarga (anggota, jumlah)
- Makanan favorit (nama, rasa)
- Hobi (kegiatan, waktu)
- Formulir (kursus, perpustakaan, hotel, acara)
- Balas pesan (undangan, keluarga, sekolah, bantuan)
- Deskripsi (rumah, sekolah, rutinitas, teman)
- Deskripsi gambar (kelas, taman, dapur, pasar)

## 5. A1 Speaking Design Notes

**Pendekatan:**
- Sangat pendek (5–30 detik)
- Fokus: pelafalan, frasa sederhana, perkenalan, jawaban singkat
- Task type: voice_read_aloud, voice_short_answer, voice_picture_description
- Preparation time: 10–20 detik
- Stimulus teks untuk read_aloud dan picture_description

**Konteks:**
- Read aloud: sapaan, perkenalan, keluarga, rutinitas, makanan, cuaca, tempat
- Short answer: perkenalan diri, makanan favorit, hobi, tempat tinggal, keluarga, rutinitas, musik
- Picture description: ruang tamu, kebun binatang, restoran, pantai, toko buah, stasiun

## 6. A2 Writing Design Notes

**Pendekatan:**
- Teks lebih panjang (4–5 kalimat)
- Fokus: rutinitas, pengalaman, alasan sederhana, perbandingan
- Task type: short_text, message_reply, picture_description, simple_mediation, form_completion
- Batas kata: min 25–30, max 60–90
- Mediasi ringan: menjelaskan menu, jadwal, tradisi ke orang asing
- Formulir lebih kompleks (9–10 field)

**Konteks:**
- Rutinitas harian, liburan, deskripsi kota, cita-cita, teman
- Balas pesan (kunjungan, tugas terlambat, undangan, rekomendasi)
- Deskripsi gambar (kafe, ulang tahun, perpustakaan, stadion)
- Mediasi (menu restoran, acara lingkungan, tradisi nikah)
- Formulir (kursus lanjutan, survei, lomba, tiket kereta)

## 7. A2 Speaking Design Notes

**Pendekatan:**
- Lebih panjang (25–60 detik)
- Fokus: deskripsi, pendapat, alasan, mediasi sederhana
- Task type: voice_short_answer, voice_picture_description, read_and_speak, simple_mediation
- Preparation time: 20–30 detik

**Konteks:**
- Short answer: rutinitas, akhir pekan, opini kota vs desa, liburan, makanan khas, rencana
- Picture description: pasar, pantai, konser, kantor, rumah sakit
- Read and speak: cerita Budi, pengumuman, resep jus, cerita kucing, info wisata
- Simple mediation: aturan perpustakaan, petunjuk arah, info lingkungan, cara pesan restoran

## 8. CEFR Can-Do Mapping

### A1 Writing
| Can-Do | Deskripsi |
|--------|-----------|
| BIGT-A1-WRITING-001 | Menulis kalimat sangat sederhana tentang diri sendiri dan lingkungan |
| BIGT-A1-WRITING-002 | Mengisi formulir dengan data pribadi |
| BIGT-A1-WRITING-003 | Menulis pesan pendek dan sederhana |
| BIGT-A1-WRITING-004 | Mendeskripsikan benda/orang/tempat secara sangat sederhana |

### A1 Speaking
| Can-Do | Deskripsi |
|--------|-----------|
| BIGT-A1-SPEAKING-001 | Membaca kalimat pendek dengan pelafalan jelas |
| BIGT-A1-SPEAKING-002 | Menjawab pertanyaan pribadi sederhana |
| BIGT-A1-SPEAKING-003 | Memperkenalkan diri dan menyebutkan benda/orang/tempat |

### A2 Writing
| Can-Do | Deskripsi |
|--------|-----------|
| BIGT-A2-WRITING-001 | Menulis serangkaian frasa dan kalimat sederhana dengan konektor |
| BIGT-A2-WRITING-002 | Menulis catatan dan pesan pribadi singkat sederhana |

### A2 Speaking
| Can-Do | Deskripsi |
|--------|-----------|
| BIGT-A2-SPEAKING-001 | Menggunakan serangkaian frasa untuk deskripsi sederhana |
| BIGT-A2-SPEAKING-002 | Berkomunikasi dalam tugas sederhana yang memerlukan pertukaran informasi |
| BIGT-A2-SPEAKING-003 | Menangani pertukaran sosial pendek |

## 9. Rubric Mapping

| Rubric Ref | Skill | Level | Max Score |
|------------|-------|-------|-----------|
| BIGT-RUBRIC-A1-WRITING | WRITING | A1 | 25 |
| BIGT-RUBRIC-A1-SPEAKING | SPEAKING | A1 | 25 |
| BIGT-RUBRIC-A2-WRITING | WRITING | A2 | 25 |
| BIGT-RUBRIC-A2-SPEAKING | SPEAKING | A2 | 30 |

Rubrik sudah ada di `lib/rubrics/bigt-constructed-rubrics.ts`. Tidak ada rubric baru yang dibuat.

## 10. Validator Result

```text
🔍  Validating 26 question set file(s)...

✅  All question sets passed validation!
   Files validated: 26
   Total questions: 560
```

0 errors. All 4 new files valid:
- IDs format benar (`BIGT-A1-WR-SET01-001` dll)
- Level/skill valid
- Task type valid
- Constraints valid
- Difficulty 0–1
- RubricRef valid

## 11. Audit Result

```text
============================================================
  QUESTION BANK AUDIT REPORT (File-Based)
============================================================
📊  OVERVIEW
  Total sets:          26
  Total questions:     650

🎯  QUESTIONS BY CEFR LEVEL
  A1       300  (46.2%)
  A2       260  (40.0%)

📐  QUESTIONS BY SKILL
  reading        300  (46.2%)
  listening      260  (40.0%)
  writing         44  (6.8%)
  speaking        44  (6.8%)
  integrated       2  (0.3%)

✅  All checks passed
```

Total bank meningkat dari 570 menjadi 650 (+80).

## 12. Sanitization Result

Semua task baru aman untuk participant endpoint karena:
- Menggunakan schema `ConstructedResponseItem` yang sudah terbukti aman (Phase 17)
- Field `adminOnly` dipisahkan dan hanya tersedia di admin endpoint
- Tidak ada `answer`, `correctOption`, `scoringLogic` di level public
- Rubrik hanya dirujuk via `rubricRef`, tidak dikirim ke participant
- Tidak ada transcript atau AI/plagiarism metadata

Sanitasi dilakukan oleh `sanitizeSnapshot()` di `lib/scoring/constructed-scoring.ts`.

## 13. Known Limitations

1. **Writing/Speaking belum aktif live default** — `activeSkills` tetap `['reading', 'listening']`
2. **STT (Speech-to-Text) belum aktif** — Speaking review masih manual dengan audio
3. **AI-assisted scoring belum final** — `autoScoreJson.assistedScoring` masih null
4. **Plagiarism detection hanya untuk text response** — audio tidak bisa di-cek plagiarisme
5. **Speaking review masih manual** — tidak ada transkripsi otomatis
6. **External plagiarism search belum ada** — hanya membandingkan dalam session yang sama
7. **Gambar aktual belum tersedia** — stimulus picture_description masih berupa teks deskripsi (tanpa imageUrl)
8. **Rubrik A2 Speaking maxScore 30** — berbeda dengan A1 Writing/Speaking (25) dan A2 Writing (25)
9. **Hanya A1/A2** — B1–C2 Writing/Speaking belum ada
10. **Sampel lama tetap terpisah** — dev sample (status: draft) tidak dicampur dengan production (status: review)

## 14. Next Phase Recommendation

1. **Produksi B1/B2 Writing/Speaking** — 40+ items per level
2. **Integrasi STT** — untuk transkripsi otomatis respon speaking
3. **AI-assisted scoring** — integrasi dengan OpenAI/Gemini untuk draft scoring
4. **Aktivasi Writing/Speaking** — di blueprints setelah scoring policy final
5. **Gambar aktual** — upload gambar stimulus ke CDN/Supabase Storage
6. **External plagiarism** — integrasi dengan layanan plagiarism eksternal

## 15. Production Flag Safety

```typescript
// lib/features/constructed-response.ts
LIVE_LOCK: false  // Writing/Speaking tidak aktif di live exam
activeSkills: ['reading', 'listening']
futureSkills: ['writing', 'speaking', 'mediation', 'integrated']

// Semua blueprints (lib/test-blueprint/bigtLevelBlueprint.ts)
activeSkills: ['reading', 'listening']  // LIVE DEFAULT
futureSkills: ['writing', 'speaking', 'mediation', 'integrated']
```

Writing/Speaking production items sudah masuk bank tetapi belum diaktifkan.
