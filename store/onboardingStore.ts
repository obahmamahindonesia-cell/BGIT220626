import { create } from 'zustand'
import { getDefaultOnboardingData, type OnboardingData } from '@/lib/onboarding/schema'

interface MicCheckState {
  state: 'idle' | 'testing' | 'pass' | 'fail'
  message: string
}

interface OnboardingStore {
  step: number
  data: OnboardingData
  userName: string
  loading: boolean
  saving: boolean
  mic: MicCheckState
  speaker: MicCheckState

  setStep: (step: number) => void
  updateData: (partial: Partial<OnboardingData>) => void
  setUserName: (name: string) => void
  setLoading: (v: boolean) => void
  setSaving: (v: boolean) => void
  setMic: (state: MicCheckState) => void
  setSpeaker: (state: MicCheckState) => void
  loadProfile: (profile: Partial<OnboardingData>) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  data: getDefaultOnboardingData(),
  userName: '',
  loading: true,
  saving: false,
  mic: { state: 'idle', message: '' },
  speaker: { state: 'idle', message: '' },

  setStep: (step) => set({ step }),
  updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  setUserName: (userName) => set({ userName }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setMic: (mic) => set({ mic }),
  setSpeaker: (speaker) => set({ speaker }),
  loadProfile: (profile) => set((s) => ({ data: { ...s.data, ...profile } })),
  reset: () => set({
    step: 0,
    data: getDefaultOnboardingData(),
    userName: '',
    loading: true,
    saving: false,
    mic: { state: 'idle', message: '' },
    speaker: { state: 'idle', message: '' },
  }),
}))
