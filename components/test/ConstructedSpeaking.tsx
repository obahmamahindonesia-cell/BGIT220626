'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTestStore } from '@/store/testStore'
import { Mic, Square, Play, RotateCcw, Send, CheckCircle2, AlertCircle, Loader2, Volume2 } from 'lucide-react'

interface Props {
  questionId: string
  prompt: string
  instruction: string
  constraints?: {
    minDurationSec?: number
    maxDurationSec?: number
    preparationTimeSec?: number
    responseTimeSec?: number
  }
  stimulus?: {
    type: string
    text?: string
    imageUrl?: string
    audioUrl?: string
  } | null
}

type RecordingState = 'idle' | 'preparing' | 'recording' | 'recorded' | 'uploading' | 'submitted' | 'error'

export default function ConstructedSpeaking({ questionId, prompt, instruction, constraints, stimulus }: Props) {
  const { answers } = useTestStore()
  const answer = answers[questionId]
  const [state, setState] = useState<RecordingState>('idle')
  const [audioUrl, setAudioUrl] = useState<string>(answer?.audioUrl || '')
  const [duration, setDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [prepRemaining, setPrepRemaining] = useState(constraints?.preparationTimeSec || 0)
  const [recRemaining, setRecRemaining] = useState(constraints?.maxDurationSec || 60)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [nearLimit, setNearLimit] = useState(false)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordedBlob = useRef<Blob | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (recTimerRef.current) clearInterval(recTimerRef.current)
    timerRef.current = null
    recTimerRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      cleanup()
      if (audioUrl && state === 'idle') URL.revokeObjectURL(audioUrl)
    }
  }, [cleanup, audioUrl, state])

  const startPreparation = useCallback(async () => {
    setState('preparing')
    setErrorMsg('')

    if (constraints?.preparationTimeSec && constraints.preparationTimeSec > 0) {
      setPrepRemaining(constraints.preparationTimeSec)
      timerRef.current = setInterval(() => {
        setPrepRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            startRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      startRecording()
    }
  }, [constraints])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Use browser-supported MIME type; Safari does not support audio/webm
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')
          ? 'audio/mp4;codecs=mp4a.40.2'
          : MediaRecorder.isTypeSupported('audio/aac')
            ? 'audio/aac'
            : ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorder.current = recorder
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks.current, { type: mimeType || 'audio/webm' })
        recordedBlob.current = blob
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('recorded')
        setNearLimit(false)
        if (recTimerRef.current) clearInterval(recTimerRef.current)
      }

      recorder.start(100)
      setState('recording')
      setDuration(0)
      setRecRemaining(constraints?.maxDurationSec || 60)
      setNearLimit(false)

      recTimerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDur = prev + 1
          const maxDur = constraints?.maxDurationSec || 60
          setRecRemaining(maxDur - newDur)

          // Warning at 10s remaining
          if (maxDur - newDur <= 10 && maxDur - newDur > 0) {
            setNearLimit(true)
          }

          if (newDur >= maxDur) {
            stopRecording()
          }
          return newDur
        })
      }, 1000)
    } catch (err: any) {
      setErrorMsg('Mikrofon tidak dapat diakses. Periksa izin mikrofon di pengaturan browser, lalu coba lagi.')
      setState('error')
    }
  }, [constraints])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
    }
  }, [])

  const reRecord = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl('')
    recordedBlob.current = null
    setDuration(0)
    setNearLimit(false)
    setState('idle')
    cleanup()
  }, [audioUrl, cleanup])

  const submitRecording = useCallback(async () => {
    if (!recordedBlob.current) return
    setState('uploading')
    setUploadProgress(0)
    const blob = recordedBlob.current

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 80))
      }, 200)

      const formData = new FormData()
      const store = useTestStore.getState()
      formData.append('sessionId', store.sessionId || '')
      formData.append('sessionItemId', questionId)
      formData.append('responseMode', 'audio')
      formData.append('responseText', '')
      formData.append('audio', blob, 'recording.webm')
      formData.append('audioDurationSec', String(duration))

      const res = await fetch('/api/test/constructed/submit', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Gagal mengirim rekaman')
      }

      setUploadProgress(100)
      await new Promise(r => setTimeout(r, 300))

      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl('')
      recordedBlob.current = null
      setState('submitted')
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim rekaman. Silakan coba lagi.')
      setState('error')
    }
  }, [duration, questionId, audioUrl])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const renderIdle = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5">
        <Mic className="w-9 h-9 text-[#10B981]" />
      </div>
      <p className="text-white/70 text-sm text-center mb-2">
        {constraints?.preparationTimeSec
          ? 'Bersiaplah. Anda akan mendapat waktu persiapan sebelum merekam.'
          : 'Tekan tombol di bawah untuk mulai merekam jawaban.'}
      </p>
      {constraints?.maxDurationSec && (
        <p className="text-white/40 text-xs mb-6">Maksimal durasi: {formatTime(constraints.maxDurationSec)}</p>
      )}
      <button
        onClick={startPreparation}
        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#10B981]/90 active:scale-[0.98] transition-all shadow-lg shadow-[#10B981]/25"
      >
        <Mic className="w-5 h-5" />
        Mulai Rekam
      </button>
      <p className="text-white/20 text-xs mt-4">Pastikan mikrofon terhubung dan diizinkan.</p>
    </div>
  )

  const renderPreparing = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-24 h-24 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mb-5 animate-pulse">
        <span className="text-3xl font-bold text-[#F59E0B]">{prepRemaining}</span>
      </div>
      <p className="text-white/60 text-sm">Waktu persiapan</p>
      <p className="text-white/30 text-xs mt-2">Bersiaplah untuk merekam jawaban Anda.</p>
    </div>
  )

  const renderRecording = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
        <div className="w-5 h-5 rounded-full bg-red-500 animate-pulse" />
      </div>
      <p className="text-white/60 text-sm mb-2">Merekam...</p>
      <p className="text-white/90 text-2xl font-bold tracking-wider">{formatTime(duration)}</p>
      {constraints?.maxDurationSec && (
        <p className={`text-xs mt-2 ${nearLimit ? 'text-red-400 animate-pulse font-medium' : 'text-white/30'}`}>
          {nearLimit ? 'Rekaman akan berakhir sebentar lagi!' : `Sisa ${formatTime(recRemaining)}`}
        </p>
      )}
      <button
        onClick={stopRecording}
        className="mt-8 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all"
      >
        <Square className="w-4 h-4" />
        Hentikan Rekaman
      </button>
      {nearLimit && (
        <p className="text-red-400/60 text-xs mt-3">Segera akhiri rekaman Anda.</p>
      )}
    </div>
  )

  const renderRecorded = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5">
        <CheckCircle2 className="w-9 h-9 text-[#10B981]" />
      </div>
      <p className="text-white/70 text-sm mb-1">Rekaman selesai</p>
      <p className="text-white/40 text-xs mb-6">Durasi: {formatTime(duration)}</p>

      <div className="w-full max-w-sm mb-6">
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-white/40" />
            <span className="text-xs text-white/40">Dengarkan kembali rekaman Anda</span>
          </div>
          <audio
            ref={audioRef}
            controls
            src={audioUrl}
            className="w-full h-9 rounded-lg"
            style={{ filter: 'invert(1) hue-rotate(180deg)' }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
        <button
          onClick={reRecord}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.15] text-white/70 text-sm font-medium hover:bg-white/[0.06] active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Rekam Ulang
        </button>
        <button
          onClick={submitRecording}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#10B981]/90 active:scale-[0.98] transition-all shadow-lg shadow-[#10B981]/20"
        >
          <Send className="w-4 h-4" />
          Kirim Jawaban
        </button>
      </div>
      <p className="text-white/20 text-xs mt-4">Dengarkan kembali sebelum mengirim.</p>
    </div>
  )

  const renderUploading = () => (
    <div className="flex flex-col items-center py-8">
      <Loader2 className="w-12 h-12 text-[#10B981] animate-spin mb-5" />
      <p className="text-white/60 text-sm mb-3">Mengirim jawaban...</p>
      <div className="w-48 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#10B981] transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  )

  const renderSubmitted = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5">
        <CheckCircle2 className="w-9 h-9 text-[#10B981]" />
      </div>
      <p className="text-white/80 text-sm font-semibold">Jawaban terkirim</p>
      <p className="text-white/30 text-xs mt-1">Durasi: {formatTime(duration)}</p>
    </div>
  )

  const renderError = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-9 h-9 text-red-400" />
      </div>
      <p className="text-red-400 text-sm text-center max-w-sm">{errorMsg}</p>
      <button
        onClick={() => { setState('idle'); setErrorMsg('') }}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] text-white/70 text-sm font-medium hover:bg-white/[0.1] active:scale-[0.98] transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Coba Lagi
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Stimulus */}
      {stimulus?.text && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{stimulus.text}</p>
        </div>
      )}
      {stimulus?.imageUrl && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <img src={stimulus.imageUrl} alt="Stimulus gambar" className="w-full max-h-64 object-contain rounded-lg" />
        </div>
      )}
      {stimulus?.audioUrl && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <audio controls src={stimulus.audioUrl} className="w-full h-9 rounded-lg" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
            Browser tidak mendukung pemutar audio.
          </audio>
        </div>
      )}

      {/* Prompt */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-white/90 leading-relaxed">{prompt}</h2>
        {instruction && (
          <p className="text-xs text-white/40 mt-2 italic">{instruction}</p>
        )}
      </div>

      {/* Constraints hint */}
      {constraints?.maxDurationSec && (
        <p className="text-xs text-white/40">
          Maksimal durasi: {formatTime(constraints.maxDurationSec)}
          {constraints.minDurationSec && <span> · Minimal {formatTime(constraints.minDurationSec)}</span>}
        </p>
      )}

      {/* State renderers */}
      {state === 'idle' && renderIdle()}
      {state === 'preparing' && renderPreparing()}
      {state === 'recording' && renderRecording()}
      {state === 'recorded' && renderRecorded()}
      {state === 'uploading' && renderUploading()}
      {state === 'submitted' && renderSubmitted()}
      {state === 'error' && renderError()}
    </div>
  )
}
