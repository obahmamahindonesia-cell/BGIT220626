# Phase 19A — A1/A2 Writing & Speaking Expansion Set 02–03

## 1. Goal

Expand BIGT constructed response bank from 20 tasks per skill/level to 60 tasks per skill/level for A1 and A2 Writing and Speaking.

| Skill/Level | Before | After |
|---|---|---|
| A1 Writing | 20 | 60 |
| A1 Speaking | 20 | 60 |
| A2 Writing | 20 | 60 |
| A2 Speaking | 20 | 60 |

**Total added: 160 production tasks**

## 2. Files Created

| File | Items |
|---|---|
| `data/question-bank/a1/writing/set-02.json` | 20 |
| `data/question-bank/a1/writing/set-03.json` | 20 |
| `data/question-bank/a1/speaking/set-02.json` | 20 |
| `data/question-bank/a1/speaking/set-03.json` | 20 |
| `data/question-bank/a2/writing/set-02.json` | 20 |
| `data/question-bank/a2/writing/set-03.json` | 20 |
| `data/question-bank/a2/speaking/set-02.json` | 20 |
| `data/question-bank/a2/speaking/set-03.json` | 20 |

## 3. Item Count Per Skill/Level

| Level | Skill | Count |
|---|---|---|
| A1 | Writing | 60 |
| A1 | Speaking | 60 |
| A2 | Writing | 60 |
| A2 | Speaking | 60 |

## 4. Coverage Themes

### A1 Writing

- personal info (umur, nama, asal)
- keluarga
- makanan dan minuman
- hobi dan kegiatan
- form completion (acara, pendaftaran, kuesioner)
- message reply (undangan, konfirmasi, minta tolong)
- picture description (taman, kamar, supermarket, dapur, sekolah)
- teman dan kelas
- jadwal harian

### A1 Speaking

- greetings and introductions
- colors and objects
- family members
- numbers and ages
- daily routine
- short answer tentang makanan, hobi, cuaca
- picture description (ruang tamu, dapur, halaman, kamar tidur, toko buku)
- read aloud berbagai tema

### A2 Writing

- weekend activities
- past experiences (belajar, belanja, perjalanan)
- message reply (teman lama, konfirmasi, rekomendasi, undangan)
- picture description (restoran, museum, pusat perbelanjaan, bandara, stasiun)
- simple mediation (resep masakan, aturan wisata, pengumuman)
- form completion (pendaftaran kompetisi, survei, pemesanan)

### A2 Speaking

- hobbies and reasons
- past experiences
- plans and opinions
- food and restaurant
- picture description (hotel, museum, terminal, taman bermain, supermarket)
- read and speak (profile desa wisata, aturan kolam renang, info puskesmas)
- simple mediation (cara memesan tiket, penjelasan acara)

## 5. CEFR Can-Do Mapping

- **A1 Writing**: `BIGT-A1-WRITING-001` (write simple phrases about self), `BIGT-A1-WRITING-002` (fill in basic forms), `BIGT-A1-WRITING-003` (write short simple messages)
- **A1 Speaking**: `BIGT-A1-SPEAKING-001` (read short sentences aloud), `BIGT-A1-SPEAKING-002` (answer simple questions), `BIGT-A1-SPEAKING-003` (describe simple pictures)
- **A2 Writing**: `BIGT-A2-WRITING-001` (describe daily activities), `BIGT-A2-WRITING-002` (write short notes and messages)
- **A2 Speaking**: `BIGT-A2-SPEAKING-001` (describe people/places/routines), `BIGT-A2-SPEAKING-002` (answer familiar questions), `BIGT-A2-SPEAKING-003` (give short explanations)

## 6. Rubric Mapping

| Level | Skill | Rubric Ref |
|---|---|---|
| A1 | Writing | `BIGT-RUBRIC-A1-WRITING` |
| A1 | Speaking | `BIGT-RUBRIC-A1-SPEAKING` |
| A2 | Writing | `BIGT-RUBRIC-A2-WRITING` |
| A2 | Speaking | `BIGT-RUBRIC-A2-SPEAKING` |

## 7. Validator Result

```
✅  All question sets passed validation!
   Files validated: 34
   Total questions: 560 (MCQ + constructed items)
```

## 8. Audit Result

```
📊  OVERVIEW
  Total sets:          34
  Total questions:     810

📐  QUESTIONS BY SKILL
  reading        300  (37.0%)
  listening      260  (32.1%)
  writing        124  (15.3%)
  speaking       124  (15.3%)
  integrated       2  (0.2%)

✅  All checks passed
```

## 9. Build Result

- `npx tsc --noEmit`: 0 errors
- `npm run build`: 0 errors, 0 new warnings
- Only pre-existing warnings (img → Image, useEffect deps)

## 10. Known Limitations

- Writing/Speaking still not activated as live default (Reading + Listening only)
- Scoring still manual (no AI-assisted scoring for constructed responses yet)
- Speech-to-text (STT) for speaking transcription not yet active
- AI-assisted scoring integration (OpenAI/Gemini) not yet finalized
- External plagiarism search not yet integrated
- B1/B2 Writing/Speaking content not yet produced (40+ items per level needed)
- Real image assets (upload to CDN/Supabase Storage) not yet implemented for picture_description stimuli

## 11. Next Recommendations

1. Activate Writing/Speaking in live blueprints when scoring policy + content review are final
2. Implement AI-assisted scoring with `autoScoreJson.assistedScoring`
3. B1/B2 Writing/Speaking production (40+ items per level)
4. Upload actual images for picture_description stimuli
5. Integrate STT for speaking response transcription
6. External plagiarism search integration
7. Expand to B1+ levels
