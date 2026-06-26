export type TtsProviderName = 'elevenlabs' | 'google' | 'placeholder'

export interface TtsAudioResult {
  audioBuffer: Buffer
  fileSizeBytes: number
  provider: TtsProviderName
  voiceId: string
  durationMs: number
}

export interface SpeakerVoice {
  voiceId: string
  provider: TtsProviderName
  label: string
}

export interface TtsProvider {
  name: TtsProviderName
  synthesize(transcript: string, voice: SpeakerVoice, speed: 'slow' | 'normal' | 'fast'): Promise<TtsAudioResult>
}

export function getTtsProvider(): TtsProvider {
  const providerName = (process.env.TTS_PROVIDER || 'placeholder').toLowerCase() as TtsProviderName

  if (providerName === 'elevenlabs') {
    const { ElevenLabsProvider } = require('./elevenLabsProvider')
    return new ElevenLabsProvider()
  }
  if (providerName === 'google') {
    const { GoogleTtsProvider } = require('./googleTtsProvider')
    return new GoogleTtsProvider()
  }

  const { PlaceholderProvider } = require('./elevenLabsProvider')
  return new PlaceholderProvider()
}

export function getSpeedMultiplier(speed: 'slow' | 'normal' | 'fast'): number {
  switch (speed) {
    case 'slow': return 0.85
    case 'normal': return 1.0
    case 'fast': return 1.1
  }
}
