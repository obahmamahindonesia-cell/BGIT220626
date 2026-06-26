import type { TtsProvider, TtsAudioResult, SpeakerVoice } from './ttsProvider'
import { getSpeedMultiplier } from './ttsProvider'

export class ElevenLabsProvider implements TtsProvider {
  name = 'elevenlabs' as const

  async synthesize(transcript: string, voice: SpeakerVoice, speed: 'slow' | 'normal' | 'fast'): Promise<TtsAudioResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY tidak ditemukan. Set environment variable.')
    }

    const voiceId = voice.voiceId
    const stability = 0.5
    const similarityBoost = 0.75
    const speakingRate = getSpeedMultiplier(speed)

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: transcript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          speed: speakingRate,
        },
      }),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      throw new Error(`ElevenLabs API error ${response.status}: ${errBody}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)

    const estimatedDurationMs = estimateDurationMs(transcript, speed)

    return {
      audioBuffer,
      fileSizeBytes: audioBuffer.length,
      provider: 'elevenlabs',
      voiceId,
      durationMs: estimatedDurationMs,
    }
  }
}

function estimateDurationMs(transcript: string, speed: 'slow' | 'normal' | 'fast'): number {
  const wordCount = transcript.split(/\s+/).length
  const wordsPerSecond = speed === 'slow' ? 2.0 : speed === 'normal' ? 2.8 : 3.5
  return Math.ceil((wordCount / wordsPerSecond) * 1000)
}

export class PlaceholderProvider implements TtsProvider {
  name = 'placeholder' as const

  async synthesize(transcript: string, _voice: SpeakerVoice, speed: 'slow' | 'normal' | 'fast'): Promise<TtsAudioResult> {
    const durationMs = estimateDurationMs(transcript, speed)
    const durationSec = Math.ceil(durationMs / 1000)

    const audioBuffer = generateSilentMp3(durationSec)

    return {
      audioBuffer,
      fileSizeBytes: audioBuffer.length,
      provider: 'placeholder',
      voiceId: 'placeholder',
      durationMs,
    }
  }
}

function generateSilentMp3(durationSec: number): Buffer {
  const sampleRate = 44100
  const bitrateKbps = 128
  const samplesPerFrame = 1152

  const frameSize = Math.floor((144 * bitrateKbps * 1000) / sampleRate)
  const framesPerSec = sampleRate / samplesPerFrame
  const frameCount = Math.ceil(durationSec * framesPerSec)

  const frames: Buffer[] = []

  for (let f = 0; f < frameCount; f++) {
    const header = Buffer.alloc(4)
    header[0] = 0xFF
    header[1] = 0xFB
    const bitrateIndex = 9
    const sampleRateIndex = 0
    const paddingBit = 0
    header[2] = (bitrateIndex << 4) | (sampleRateIndex << 2) | (paddingBit << 1) | 0
    header[3] = 0x00

    const sideInfoSize = 32
    const mainDataSize = frameSize - 4 - sideInfoSize
    const sideInfo = Buffer.alloc(sideInfoSize, 0)
    const mainData = Buffer.alloc(mainDataSize, 0)

    frames.push(Buffer.concat([header, sideInfo, mainData]))
  }

  return Buffer.concat(frames)
}
