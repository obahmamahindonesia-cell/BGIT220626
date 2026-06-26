import type { TtsProvider, TtsAudioResult, SpeakerVoice } from './ttsProvider'
import { getSpeedMultiplier } from './ttsProvider'

export class GoogleTtsProvider implements TtsProvider {
  name = 'google' as const

  async synthesize(transcript: string, voice: SpeakerVoice, speed: 'slow' | 'normal' | 'fast'): Promise<TtsAudioResult> {
    const speakingRate = getSpeedMultiplier(speed)

    const voiceName = voice.voiceId || 'id-ID-Standard-A'
    const languageCode = 'id-ID'

    const apiKey = process.env.GOOGLE_TTS_API_KEY
    const credentialsJson = process.env.GOOGLE_TTS_CREDENTIALS_JSON

    let url = 'https://texttospeech.googleapis.com/v1/text:synthesize'
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (apiKey) {
      url += `?key=${apiKey}`
    } else if (credentialsJson) {
      const accessToken = await this.getAccessToken(credentialsJson)
      headers['Authorization'] = `Bearer ${accessToken}`
    } else {
      const accessToken = await this.getAdcAccessToken()
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: { text: transcript },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate,
        },
      }),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      throw new Error(`Google TTS API error ${response.status}: ${errBody}`)
    }

    const data = await response.json()
    const audioContent = data.audioContent as string

    const audioBuffer = Buffer.from(audioContent, 'base64')
    const estimatedDurationMs = estimateDurationMs(transcript, speed)

    return {
      audioBuffer,
      fileSizeBytes: audioBuffer.length,
      provider: 'google',
      voiceId: voiceName,
      durationMs: estimatedDurationMs,
    }
  }

  private async getAccessToken(credentialsJson: string): Promise<string> {
    try {
      const creds = JSON.parse(credentialsJson)
      const { client_email, private_key } = creds

      const { JWT } = await import('google-auth-library')
      const client = new JWT({
        email: client_email,
        key: private_key,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
      const credentials = await client.getAccessToken()
      return credentials?.token || ''
    } catch {
      throw new Error('Gagal mendapatkan access token Google TTS. Periksa GOOGLE_TTS_CREDENTIALS_JSON.')
    }
  }

  private async getAdcAccessToken(): Promise<string> {
    try {
      const { GoogleAuth } = await import('google-auth-library')
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
      const client = await auth.getClient()
      const accessToken = await client.getAccessToken()
      return accessToken?.token || ''
    } catch {
      throw new Error('Gagal mendapatkan access token ADC Google TTS. Pastikan gcloud auth application-default login sudah dijalankan, atau set GOOGLE_TTS_API_KEY / GOOGLE_TTS_CREDENTIALS_JSON.')
    }
  }
}

function estimateDurationMs(transcript: string, speed: 'slow' | 'normal' | 'fast'): number {
  const wordCount = transcript.split(/\s+/).length
  const wordsPerSecond = speed === 'slow' ? 2.0 : speed === 'normal' ? 2.8 : 3.5
  return Math.ceil((wordCount / wordsPerSecond) * 1000)
}
