# BIGT Phase 19A — A1/A2 Writing & Speaking Expansion Set 02–03

## 1. Goal

Menambah bank soal Writing dan Speaking A1/A2 dari 20 tasks per skill/level menjadi 60 tasks per skill/level.

## 2. Files Created

| File | Tasks |
|------|-------|
| `data/question-bank/a1/writing/set-02.json` | 20 |
| `data/question-bank/a1/writing/set-03.json` | 20 |
| `data/question-bank/a1/speaking/set-02.json` | 20 |
| `data/question-bank/a1/speaking/set-03.json` | 20 |
| `data/question-bank/a2/writing/set-02.json` | 20 |
| `data/question-bank/a2/writing/set-03.json` | 20 |
| `data/question-bank/a2/speaking/set-02.json` | 20 |
| `data/question-bank/a2/speaking/set-03.json` | 20 |
| **Total** | **160** |

## 3. Item Count Per Skill/Level

| Skill/Level | Set 01 | Set 02 | Set 03 | Total |
|-------------|--------|--------|--------|-------|
| A1 Writing | 20 | 20 | 20 | 60 |
| A1 Speaking | 20 | 20 | 20 | 60 |
| A2 Writing | 20 | 20 | 20 | 60 |
| A2 Speaking | 20 | 20 | 20 | 60 |
| **Total** | **80** | **80** | **80** | **240** |

## 4. Task Type Distribution (Per 40 Tasks)

| Task Type | A1 Writing | A1 Speaking | A2 Writing | A2 Speaking |
|-----------|-----------|-------------|-----------|-------------|
| guided_sentence | 14 | — | — | — |
| short_text | 8 | — | 14 | — |
| form_completion | 6 | — | 6 | — |
| message_reply | 6 | — | 8 | — |
| picture_description | 6 | — | 6 | — |
| simple_mediation | — | — | 6 | 8 |
| voice_read_aloud | — | 16 | — | — |
| voice_short_answer | — | 16 | — | 16 |
| voice_picture_description | — | 8 | — | 8 |
| read_and_speak | — | — | — | 8 |

## 5. Themes

| Level | Themes |
|-------|--------|
| A1 Writing | personal_info, family, school, food, drink, hobby, daily_routine, friend, classroom_objects, colors, animals, weather, time, numbers, transportation, body_parts, clothes, home_rooms, toys |
| A1 Speaking | introduction, family, favorite_food, colors, classroom_objects, school, home, friends, hobbies, daily_activities, time, places, animals, weather, body_parts, clothes, numbers, greetings, feelings, transportation |
| A2 Writing | daily_routine, past_experience, weekend_plans, simple_vacation, message_to_friend, invitation, asking_for_help, giving_reasons, choosing_activities, comparing_choices, shopping, transportation, school_course, health, living_place, weather_activities, describing_people, describing_places, food_experience, celebrations |
| A2 Speaking | daily_routine, past_experience, plans, hobbies, choices_and_reasons, comparing_places, food_restaurant, transportation, school_course, simple_job, vacation, weather, health, shopping, describing_people, describing_places, celebrations, technology, environment, community |

## 6. CEFR Mapping

| Can-Do ID | Deskripsi | Digunakan di |
|-----------|-----------|-------------|
| BIGT-A1-WRITING-001 | Can write simple phrases and sentences about themselves. | A1 Writing |
| BIGT-A1-WRITING-002 | Can fill in basic personal information. | A1 Writing |
| BIGT-A1-WRITING-003 | Can write a short simple message. | A1 Writing |
| BIGT-A1-SPEAKING-001 | Can introduce themselves using simple phrases. | A1 Speaking |
| BIGT-A1-SPEAKING-002 | Can answer simple questions about personal details. | A1 Speaking |
| BIGT-A1-SPEAKING-003 | Can read short simple sentences aloud. | A1 Speaking |
| BIGT-A2-WRITING-001 | Can write short simple notes and messages. | A2 Writing |
| BIGT-A2-WRITING-002 | Can describe daily activities in simple sentences. | A2 Writing |
| BIGT-A2-WRITING-003 | Can give simple reasons for a choice. | A2 Writing |
| BIGT-A2-SPEAKING-001 | Can describe people, places, and routines in simple terms. | A2 Speaking |
| BIGT-A2-SPEAKING-002 | Can answer simple questions about familiar topics. | A2 Speaking |
| BIGT-A2-SPEAKING-003 | Can give a short explanation or reason. | A2 Speaking |

## 7. Rubric Mapping

| File | rubricRef |
|------|-----------|
| A1 Writing | `BIGT-RUBRIC-A1-WRITING` |
| A1 Speaking | `BIGT-RUBRIC-A1-SPEAKING` |
| A2 Writing | `BIGT-RUBRIC-A2-WRITING` |
| A2 Speaking | `BIGT-RUBRIC-A2-SPEAKING` |

## 8. ID Format

- A1 Writing: `BIGT-A1-WR-SET02-001` to `BIGT-A1-WR-SET03-020`
- A1 Speaking: `BIGT-A1-SP-SET02-001` to `BIGT-A1-SP-SET03-020`
- A2 Writing: `BIGT-A2-WR-SET02-001` to `BIGT-A2-WR-SET03-020`
- A2 Speaking: `BIGT-A2-SP-SET02-001` to `BIGT-A2-SP-SET03-020`

## 9. Bank Count Before/After

| Skill | Before | Added | After |
|-------|--------|-------|-------|
| Reading | 300 | 0 | 300 |
| Listening | 260 | 0 | 260 |
| Writing | 44 | 80 | 124 |
| Speaking | 44 | 80 | 124 |
| Integrated | 2 | 0 | 2 |
| **Total** | **650** | **160** | **810** |

## 10. Validator Result

- 34 files, 0 errors ✅

## 11. Audit Result

- 810 total questions, all checks pass ✅

## 12. Build Result

- 0 errors ✅

## 13. Known Limitations

1. Writing/Speaking masih belum live default
2. Scoring masih manual review (belum ada AI-assisted scoring)
3. STT (Speech-to-Text) belum aktif
4. AI-assisted scoring belum final
5. External plagiarism search belum aktif
6. picture_description masih pakai text stimulus (belum ada gambar aktual)
7. B1/B2 Writing/Speaking masih 0 tasks

## 14. Confirmation

- ✅ Live default tetap Reading + Listening
- ✅ Writing/Speaking belum aktif live default
- ✅ No participant leakage (adminOnly fields safe)
- ✅ adminOnly tidak bocor ke participant
- ✅ Semua ID unique
- ✅ Semua difficulty 0–1
- ✅ Semua rubricRef valid
- ✅ Semua constraints valid
