# BIGT Phase 17C — Audio Storage + Results Safety

## Audio Storage Architecture

### Storage Bucket
- **Name**: `bigt-speaking-responses`
- **Type**: Private (no public access)
- **Access**: Signed URLs only (short-lived, 1 hour expiry)
- **Service**: Supabase Storage via service role key (`SUPABASE_SECRET_KEY`)

### File Path Convention
```
{userId}/{attemptId}.{ext}
```
- `userId` — sanitized (alphanumeric + `_` + `-` only, path traversal prevented)
- `attemptId` — sanitized (alphanumeric + `_` + `-` only)
- `ext` — `webm`, `mp4`, `mp3`, or `wav` (derived from MIME type)

### Database Fields (UserAnswer model)
| Field | Type | Description |
|-------|------|-------------|
| `responseAudioUrl` | String? | Empty string (set to `''` after storage upload; legacy base64 removed) |
| `responseAudioMimeType` | String? | MIME type (audio/webm, audio/mp4, audio/mpeg, audio/wav) |
| `audioDurationSec` | Int? | Duration in seconds |
| `audioFileSize` | Int? | File size in bytes |
| `audioStoragePath` | String? | Path in Supabase Storage bucket |
| `audioStorageProvider` | String? | Provider name (`"supabase"`) |

## Constructed Submit Flow

```
Client                        Server                         Supabase Storage
  │                              │                               │
  │── POST /api/test/constructed/submit ──→                      │
  │   multipart/form-data:                                       │
  │   - sessionId                                                 │
  │   - sessionItemId                                             │
  │   - responseMode: "audio"                                     │
  │   - audio: Blob (recording.webm)                              │
  │   - audioDurationSec                                          │
  │                              │                               │
  │                              ├── Validate MIME type           │
  │                              ├── Validate file size (max 10MB)│
  │                              ├── Validate duration            │
  │                              │                               │
  │                              ├── uploadSpeakingAudio() ──→    │
  │                              │   (service role key)           │
  │                              │←── storagePath                 │
  │                              │                               │
  │                              ├── Store in UserAnswer:         │
  │                              │   - audioStoragePath           │
  │                              │   - responseAudioUrl: ""       │
  │                              │   (no base64 stored)           │
  │                              │                               │
  │←── { status: "submitted",    │                               │
  │      audioDurationSec,       │                               │
  │      message }               │                               │
```

## Admin Playback Flow

```
Admin Page                      API Route                      Supabase Storage
    │                              │                               │
    │── GET /api/admin/constructed ──→                             │
    │   (returns hasAudio=true)      │                              │
    │                              │                               │
    │── <AudioPlayer responseId>    │                              │
    │   ↓                          │                               │
    │── GET /api/admin/constructed/audio-url?responseId=xxx ──→    │
    │                              ├── Verify admin auth            │
    │                              ├── Look up audioStoragePath    │
    │                              │                               │
    │                              ├── createSignedUrl() ──→       │
    │                              │←── signedUrl (1h expiry)      │
    │                              │                               │
    │←── { signedUrl, expiresInSec }│                              │
    │                              │                               │
    │── <audio src={signedUrl}>     │                              │
```

## Results Page Visibility Rules

### Constructed Response (Writing/Speaking)

**Participant sees (before review)**:
- ✅ "Jawaban Menulis/Bicara Anda sudah terkirim"
- ✅ Status: submitted / under_review
- ✅ Word count (writing)
- ✅ Audio duration (speaking)

**Participant sees (after review)**:
- ✅ Final band (e.g., "Kuat A1", "Cukup A2") — from `finalScoreJson.band`
- ✅ Final percentage — from `finalScoreJson.percentage`
- ✅ Feedback text — from `feedback` field

**Participant NEVER sees**:
- ❌ `reviewerScoreJson` (raw dimension scores)
- ❌ `internalNotes` (admin notes)
- ❌ `autoScoreJson` (AI draft — not final)
- ❌ `adminOnly` fields (sampleResponse, scoringNotes, transcript, scoringLogic)
- ❌ Signed URLs to audio (only accessible via admin endpoint)
- ❌ Rubric details (dimension descriptions, level labels)

### Safety Rules
1. AutoScore never shown as final score
2. `finalScoreJson` only exposed if `responseStatus === "reviewed"`
3. `reviewerScoreJson` becomes final only after admin saves `finalScoreJson`
4. Writing/Speaking scores do NOT affect total exam score until blueprint activates them
5. Dimension scoring excludes WRITING/SPEAKING/INTEGRATED/MEDIATION from `calculateDimScores()`

## Security Checks

| Check | Location | Implementation |
|-------|----------|----------------|
| MIME type | `submit route` + `bigt-audio-storage.ts` | `validateAudioMimeType()` — only webm/mp4/mp3/wav |
| File size | `submit route` + `bigt-audio-storage.ts` | `validateAudioFileSize()` — max 10 MB |
| Duration | `submit route` | `validateAudioDuration()` — against question constraints |
| Path traversal | `bigt-audio-storage.ts` | `sanitizePathSeg()` — removes `/`, `.`, special chars |
| User ownership | `submit route` | `session.userId !== dbUser.id` check |
| Admin auth | `audio-url route` + `admin/constructed` | `getAdminUser()` middleware |
| Bucket privacy | `bigt-audio-storage.ts` | Bucket created as `public: false` |
| Signed URL expiry | `bigt-audio-storage.ts` | `createSignedUrl()` with 1h default expiry |

## Required Setup

1. Ensure `SUPABASE_SECRET_KEY` is set in `.env.local` and `.env`
2. The `bigt-speaking-responses` bucket is created automatically on first upload via `ensureBucket()`
3. No manual Supabase dashboard config needed

## Limitations

1. **Speech-to-text**: Not implemented. Speaking responses require human reviewer.
2. **AI-assisted scoring**: `autoScoreJson` defined but no AI integration yet.
3. **Plagiarism/AI detection**: Not implemented for writing responses.
4. **Samples only**: Only 10 constructed response items exist — not production-ready.
5. **Writing/Speaking not live**: Default exam remains Reading + Listening only.

## Next Phase Recommendations

1. Integrate OpenAI/Gemini for AI-assisted scoring draft (`autoScoreJson`)
2. Add speech-to-text for speaking responses
3. Implement plagiarism detection for writing responses
4. Mass production of writing/speaking items (100+ per level per skill)
5. Activate `LIVE_LOCK` only after full review workflow testing
