export type SkillCode = 'reading' | 'listening' | 'writing' | 'speaking' | 'mediation' | 'integrated'

export interface SkillInfo {
  code: SkillCode
  name: string
  nameEn: string
  status: 'available' | 'not_ready'
  description: string
}

const SKILL_REGISTRY: Record<SkillCode, SkillInfo> = {
  reading: {
    code: 'reading',
    name: 'Membaca',
    nameEn: 'Reading',
    status: 'available',
    description: 'Memahami teks tertulis seperti artikel, pengumuman, dan instruksi.',
  },
  listening: {
    code: 'listening',
    name: 'Menyimak',
    nameEn: 'Listening',
    status: 'available',
    description: 'Memahami percakapan lisan, pengumuman, dan penjelasan.',
  },
  writing: {
    code: 'writing',
    name: 'Menulis',
    nameEn: 'Writing',
    status: 'not_ready',
    description: 'Menulis teks seperti email, esai, dan laporan.',
  },
  speaking: {
    code: 'speaking',
    name: 'Berbicara',
    nameEn: 'Speaking',
    status: 'not_ready',
    description: 'Berbicara dalam situasi formal dan informal.',
  },
  mediation: {
    code: 'mediation',
    name: 'Mediasi',
    nameEn: 'Mediation',
    status: 'not_ready',
    description: 'Menyampaikan informasi antarbahasa dan antarbudaya.',
  },
  integrated: {
    code: 'integrated',
    name: 'Tugas Terintegrasi',
    nameEn: 'Integrated',
    status: 'not_ready',
    description: 'Menggabungkan beberapa keterampilan dalam satu tugas.',
  },
}

export function getSkillInfo(code: string): SkillInfo | undefined {
  return SKILL_REGISTRY[code as SkillCode]
}

export function getAvailableSkills(): SkillInfo[] {
  return Object.values(SKILL_REGISTRY).filter(s => s.status === 'available')
}

export function getNotReadySkills(): SkillInfo[] {
  return Object.values(SKILL_REGISTRY).filter(s => s.status === 'not_ready')
}

export function getAllSkills(): SkillInfo[] {
  return Object.values(SKILL_REGISTRY)
}

export function isSkillAvailable(code: string): boolean {
  return SKILL_REGISTRY[code as SkillCode]?.status === 'available'
}
