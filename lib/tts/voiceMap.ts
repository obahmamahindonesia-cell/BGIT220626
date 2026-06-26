import type { SpeakerVoice, TtsProviderName } from './ttsProvider'

function envVoice(key: string, label: string, provider: TtsProviderName): SpeakerVoice {
  const envVal = process.env[key]
  return {
    voiceId: envVal || `env:${key}`,
    provider,
    label,
  }
}

function envOrFallback(key: string, fallback: string, label: string, provider: TtsProviderName): SpeakerVoice {
  const val = process.env[key] || fallback
  return { voiceId: val, provider, label }
}

export function getVoiceForSpeaker(speaker: string): SpeakerVoice {
  const provider = (process.env.TTS_PROVIDER || 'placeholder').toLowerCase() as TtsProviderName

  if (provider === 'placeholder') {
    return { voiceId: 'placeholder', provider: 'placeholder', label: speaker }
  }

  if (provider === 'elevenlabs') {
    const baseFallback = '21m00Tcm4TlvDq8ikWAM'
    switch (speaker) {
      case 'female_01': return envOrFallback('ELEVENLABS_VOICE_FEMALE_01', baseFallback, speaker, 'elevenlabs')
      case 'female_02': return envOrFallback('ELEVENLABS_VOICE_FEMALE_02', baseFallback, speaker, 'elevenlabs')
      case 'male_01': return envOrFallback('ELEVENLABS_VOICE_MALE_01', baseFallback, speaker, 'elevenlabs')
      case 'male_02': return envOrFallback('ELEVENLABS_VOICE_MALE_02', baseFallback, speaker, 'elevenlabs')
      case 'announcer_01': return envOrFallback('ELEVENLABS_VOICE_ANNOUNCER_01', baseFallback, speaker, 'elevenlabs')
      default: return envOrFallback('ELEVENLABS_VOICE_FEMALE_01', baseFallback, speaker, 'elevenlabs')
    }
  }

  if (provider === 'google') {
    switch (speaker) {
      case 'female_01':
      case 'female_02':
        return envOrFallback('GOOGLE_TTS_VOICE_FEMALE_01', 'id-ID-Standard-A', speaker, 'google')
      case 'male_01':
      case 'male_02':
        return envOrFallback('GOOGLE_TTS_VOICE_MALE_01', 'id-ID-Standard-D', speaker, 'google')
      default:
        return envOrFallback('GOOGLE_TTS_VOICE_FEMALE_01', 'id-ID-Standard-A', speaker, 'google')
    }
  }

  return { voiceId: 'placeholder', provider: 'placeholder', label: speaker }
}
