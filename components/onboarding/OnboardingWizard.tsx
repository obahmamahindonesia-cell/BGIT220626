'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mic,
  Volume2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Globe,
  Users,
  Monitor,
  AlertCircle,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';

const onboardingSchema = z.object({
  fullName: z
    .string()
    .transform(val => val.trim())
    .pipe(
      z.string()
        .min(2, 'Nama minimal 2 karakter.')
        .max(50, 'Nama maksimal 50 karakter.')
    ),
  age: z
    .string()
    .refine(val => val.trim() !== '', { message: 'Umur belum diisi.' })
    .refine(val => !Number.isNaN(Number(val.trim())), { message: 'Umur harus berupa angka.' })
    .refine(val => Number(val.trim()) >= 3, { message: 'Umur minimal 3 tahun.' })
    .refine(val => Number(val.trim()) <= 12, { message: 'Umur maksimal 12 tahun.' }),
  profession: z.enum(['mahasiswa', 'guru', 'profesional', 'pelajar', 'bipa', 'lainnya']),
  goals: z.array(z.string()).min(1, 'Pilih minimal satu tujuan.'),
  experience: z.string(),
  preferredDuration: z.enum(['30', '60', '90']),
  wantPracticeFirst: z.boolean(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 1, title: 'Selamat Datang' },
  { id: 2, title: 'Data Diri' },
  { id: 3, title: 'Tujuan Tes' },
  { id: 4, title: 'Pengalaman' },
  { id: 5, title: 'Preferensi' },
  { id: 6, title: 'Persiapan Teknis' },
  { id: 7, title: 'Siap Memulai' },
];

const professionOptions = [
  { value: 'mahasiswa', label: 'Mahasiswa', icon: GraduationCap },
  { value: 'guru', label: 'Guru / Dosen', icon: Users },
  { value: 'profesional', label: 'Profesional', icon: Briefcase },
  { value: 'pelajar', label: 'Pelajar', icon: Monitor },
  { value: 'bipa', label: 'Pemelajar BIPA', icon: Globe },
  { value: 'lainnya', label: 'Lainnya', icon: Sparkles },
] as const;

const goalOptions = [
  { value: 'sertifikasi', label: 'Sertifikasi BIGT' },
  { value: 'kuliah', label: 'Masuk Perguruan Tinggi' },
  { value: 'karir', label: 'Keperluan Karir' },
  { value: 'self_dev', label: 'Pengembangan Diri' },
  { value: 'mengajar', label: 'Keperluan Mengajar' },
] as const;

const experienceOptions = [
  { value: 'pemula', label: 'Pemula', desc: 'Belum pernah tes BIGT sebelumnya' },
  { value: 'pernah', label: 'Pernah Tes', desc: 'Pernah mengikuti tes BIGT sebelumnya' },
  { value: 'aktif', label: 'Aktif Belajar', desc: 'Sedang aktif belajar Bahasa Indonesia' },
];

const durationOptions = [
  { value: '30', label: '30 Menit', desc: 'Cepat & ringkas' },
  { value: '60', label: '60 Menit', desc: 'Standar' },
  { value: '90', label: '90 Menit', desc: 'Lengkap & mendalam' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < current ? 'w-6 bg-[#007AFF]' : i === current ? 'w-6 bg-[#007AFF]' : 'w-1.5 bg-[#E5E5EA]'
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      age: '',
      profession: 'mahasiswa',
      goals: [],
      experience: '',
      preferredDuration: '60',
      wantPracticeFirst: true,
    },
  });

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = form;
  const values = watch();

  const nextStep = async () => {
    setSaveError(null);
    const fields = getStepFields(currentStep);
    const isValid = fields ? await trigger(fields) : true;
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getStepFields = (step: number): (keyof OnboardingForm)[] | undefined => {
    switch (step) {
      case 2: return ['fullName', 'age', 'profession'];
      case 3: return ['goals'];
      case 4: return ['experience'];
      case 5: return ['preferredDuration'];
      default: return undefined;
    }
  };

  const toggleGoal = (goal: string) => {
    const current = values.goals;
    if (current.includes(goal)) {
      setValue('goals', current.filter(g => g !== goal), { shouldValidate: true });
    } else {
      setValue('goals', [...current, goal], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: OnboardingForm) => {
    setIsSubmitting(true);
    setSaveError(null);
    try {
      localStorage.setItem('bigt_onboarding', JSON.stringify(data));

      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(data.age, 10),
          profession: data.profession,
          testGoals: data.goals,
          hasPreviousTest: true,
          previousTestType: data.experience || null,
          preferredDuration: parseInt(data.preferredDuration),
          practiceMode: data.wantPracticeFirst,
          onboardingCompleted: true,
          technicalCheckPassed: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan profil. Silakan coba lagi.');
      }

      const profileRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.fullName }),
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan nama.');
      }

      router.replace('/dashboard');
    } catch (error: any) {
      setSaveError(error.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-[#007AFF] rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-[#007AFF]/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-[#1C1C1E]">
                Selamat Datang di BIGT
              </h3>
              <p className="text-[#8E8E93] text-base max-w-md mx-auto leading-relaxed">
                BIGT akan membantu mengukur kemampuan Bahasa Indonesia Anda secara
                komprehensif. Ikuti panduan singkat ini untuk memulai.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-sm mx-auto">
              {['Tes Adaptif', 'Akurat', 'Sertifikat'].map((item) => (
                <div key={item} className="bg-[#F2F2F7] rounded-xl py-3 px-2 text-center">
                  <p className="text-xs font-medium text-[#007AFF]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#1C1C1E]">
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Masukkan nama Anda"
                className={`rounded-xl border h-12 px-4 text-base ${
                  errors.fullName ? 'border-red-400 focus-visible:ring-red-400' : 'border-[#E5E5EA]'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-[#1C1C1E]">
                Usia
              </Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                min={3}
                max={12}
                {...register('age')}
                placeholder="Masukkan usia Anda"
                className={`rounded-xl border h-12 px-4 text-base ${
                  errors.age ? 'border-red-400 focus-visible:ring-red-400' : 'border-[#E5E5EA]'
                }`}
              />
              {errors.age && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.age.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1C1C1E]">Profesi</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {professionOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = values.profession === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('profession', opt.value, { shouldValidate: true })}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-[#007AFF] bg-[#007AFF]/5'
                          : 'border-[#E5E5EA] bg-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                      <span className={`text-sm font-medium ${selected ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#8E8E93] mb-2">Pilih minimal satu tujuan mengikuti tes BIGT:</p>
            <div className="grid grid-cols-1 gap-2.5">
              {goalOptions.map((opt) => {
                const selected = values.goals.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleGoal(opt.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-[#E5E5EA] bg-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                      selected ? 'bg-[#007AFF] border-[#007AFF]' : 'border-[#C7C7CC]'
                    }`}>
                      {selected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      selected ? 'text-[#007AFF]' : 'text-[#1C1C1E]'
                    }`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.goals && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.goals.message}
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#8E8E93] mb-2">Pengalaman Anda dengan BIGT:</p>
            <div className="grid grid-cols-1 gap-2.5">
              {experienceOptions.map((opt) => {
                const selected = values.experience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('experience', opt.value, { shouldValidate: true })}
                    className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-[#E5E5EA] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected ? 'border-[#007AFF]' : 'border-[#C7C7CC]'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />}
                      </div>
                      <span className={`text-sm font-medium ${
                        selected ? 'text-[#007AFF]' : 'text-[#1C1C1E]'
                      }`}>{opt.label}</span>
                    </div>
                    <p className="text-xs text-[#8E8E93] ml-8">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-[#1C1C1E]">
                Durasi Tes yang Diinginkan
              </Label>
              <div className="grid grid-cols-3 gap-2.5">
                {durationOptions.map((opt) => {
                  const selected = values.preferredDuration === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('preferredDuration', opt.value as '30' | '60' | '90', { shouldValidate: true })}
                      className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-[#007AFF] bg-[#007AFF]/5'
                          : 'border-[#E5E5EA] bg-white'
                      }`}
                    >
                      <span className={`text-lg font-bold ${
                        selected ? 'text-[#007AFF]' : 'text-[#1C1C1E]'
                      }`}>{opt.value}</span>
                      <span className={`text-[11px] ${
                        selected ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                      }`}>menit</span>
                      <span className={`text-[10px] ${
                        selected ? 'text-[#007AFF]/70' : 'text-[#8E8E93]'
                      }`}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-[#1C1C1E]">
                Ingin mencoba latihan dulu?
              </Label>
              <div className="flex gap-2.5">
                {[{ value: true, label: 'Ya, latihan dulu' }, { value: false, label: 'Langsung tes' }].map((opt) => {
                  const selected = values.wantPracticeFirst === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setValue('wantPracticeFirst', opt.value, { shouldValidate: true })}
                      className={`flex-1 p-3.5 rounded-xl border-2 transition-all text-center ${
                        selected
                          ? 'border-[#007AFF] bg-[#007AFF]/5'
                          : 'border-[#E5E5EA] bg-white'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        selected ? 'text-[#007AFF]' : 'text-[#1C1C1E]'
                      }`}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 py-4">
            <div className="bg-[#F2F2F7] rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-[#007AFF]/10 rounded-2xl flex items-center justify-center mx-auto">
                <Mic className="w-8 h-8 text-[#007AFF]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-[#1C1C1E]">Cek Perangkat</h4>
                <p className="text-sm text-[#8E8E93]">
                  Pastikan mikrofon dan speaker Anda berfungsi dengan baik
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 text-center space-y-2">
                <Mic className="w-6 h-6 text-[#007AFF] mx-auto" />
                <p className="text-sm font-medium text-[#1C1C1E]">Mikrofon</p>
                <p className="text-[11px] text-[#8E8E93]">Untuk tes berbicara</p>
              </div>
              <div className="bg-white rounded-xl border border-[#E5E5EA] p-4 text-center space-y-2">
                <Volume2 className="w-6 h-6 text-[#007AFF] mx-auto" />
                <p className="text-sm font-medium text-[#1C1C1E]">Speaker</p>
                <p className="text-[11px] text-[#8E8E93]">Untuk tes mendengar</p>
              </div>
            </div>

            <div className="bg-[#FFF3CD]/50 rounded-xl p-4 border border-[#FFEAA7]">
              <p className="text-xs text-[#856404] text-center">
                Pastikan Anda berada di tempat yang tenang dan koneksi internet stabil
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-[#34C759] rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-[#34C759]/20">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-[#1C1C1E]">
                Siap Memulai!
              </h3>
              <p className="text-[#8E8E93] text-base max-w-md mx-auto leading-relaxed">
                Anda sudah siap mengikuti tes BIGT. Klik tombol di bawah untuk memulai
                perjalanan Anda.
              </p>
            </div>

            <div className="bg-[#F2F2F7] rounded-2xl p-5 max-w-sm mx-auto space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-[#8E8E93]">Nama</span>
                <span className="font-medium text-[#1C1C1E]">{values.fullName || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8E8E93]">Durasi</span>
                <span className="font-medium text-[#1C1C1E]">{values.preferredDuration} Menit</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8E8E93]">Tujuan</span>
                <span className="font-medium text-[#1C1C1E]">{values.goals.length} dipilih</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="bg-white px-8 pt-6 pb-4 border-b border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Logo variant="mark" className="h-8 w-8" />
            </div>
            <StepIndicator current={currentStep - 1} total={steps.length} />
          </div>

          <h2 className="text-2xl font-semibold text-[#1C1C1E]">
            {steps[currentStep - 1].title}
          </h2>
        </div>

        <CardContent className="p-8">
          {renderStep()}

          {saveError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-[#E5E5EA]">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="rounded-xl px-6 h-12 text-sm border-[#E5E5EA]"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Kembali
              </Button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={isSubmitting}
                className="ml-auto rounded-xl px-8 h-12 text-sm bg-[#007AFF] hover:bg-[#0066CC] shadow-lg shadow-[#007AFF]/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <>
                    Lanjut <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="ml-auto rounded-xl px-10 h-12 text-sm bg-[#34C759] hover:bg-[#2E9F4C] shadow-lg shadow-[#34C759]/20 font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  'Mulai Tes BIGT'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
