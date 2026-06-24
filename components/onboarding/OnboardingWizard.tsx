'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Nama harus diisi'),
  age: z.number().min(12).max(100),
  profession: z.enum(['mahasiswa', 'guru', 'profesional', 'pelajar', 'bipa', 'lainnya']),
  goals: z.array(z.string()).min(1, 'Pilih minimal satu tujuan'),
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

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      age: 25,
      profession: 'mahasiswa',
      goals: [],
      experience: '',
      preferredDuration: '60',
      wantPracticeFirst: true,
    },
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: OnboardingForm) => {
    setIsSubmitting(true);
    try {
      localStorage.setItem('bigt_onboarding', JSON.stringify(data));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="bg-white px-8 py-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007AFF] rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h1 className="font-semibold text-2xl text-[#1C1C1E]">BIGT</h1>
                <p className="text-sm text-gray-500">Onboarding</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Langkah {currentStep} dari {steps.length}</p>
              <div className="w-32 h-1 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-[#007AFF] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-[#1C1C1E] mb-2">
            {steps[currentStep - 1].title}
          </h2>
        </div>

        <CardContent className="p-8">
          {/* Step Content akan diisi sesuai step */}
          {/* ... (saya ringkas dulu, bisa dikembangkan) */}

          <div className="flex justify-between mt-10">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="rounded-2xl px-8 py-6 text-base"
              >
                <ArrowLeft className="mr-2" /> Kembali
              </Button>
            )}

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="ml-auto rounded-2xl px-10 py-6 text-base bg-[#007AFF] hover:bg-[#0066CC]"
              >
                Lanjut <ArrowRight className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="ml-auto rounded-2xl px-12 py-6 text-base bg-[#34C759] hover:bg-[#2E9F4C] font-semibold"
              >
                {isSubmitting ? 'Menyimpan...' : 'Mulai Tes BIGT Sekarang'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
