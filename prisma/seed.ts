import { PrismaClient } from '@prisma/client'
import { seedCanDo } from './seed-can-do'

const prisma = new PrismaClient()

const ALL_DIMS = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED'] as const
const ALL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

const BLUEPRINTS = [
  {
    product: 'ACADEMIC',
    name: 'BIGT Akademik',
    description: 'Asesmen komprehensif 6 dimensi untuk keperluan akademik dan sertifikasi resmi.',
    durationMinutes: 120,
    defaultQuestionCount: 50,
    dimensionWeights: { LISTENING: 0.2, READING: 0.2, SPEAKING: 0.2, WRITING: 0.15, MEDIATION: 0.15, INTEGRATED: 0.1 },
    levelDistribution: { A1: 0.05, A2: 0.1, B1: 0.25, B2: 0.3, C1: 0.2, C2: 0.1 },
    questionTypeDistribution: { MCQ: 0.4, SHORT_ANSWER: 0.2, ESSAY: 0.15, AUDIO_RESPONSE: 0.15, INTEGRATED_TASK: 0.1 },
  },
  {
    product: 'PROFESSIONAL',
    name: 'BIGT Profesional',
    description: 'Asesmen untuk dunia kerja dengan fokus pada konteks profesional dan komunikasi bisnis.',
    durationMinutes: 90,
    defaultQuestionCount: 40,
    dimensionWeights: { READING: 0.25, SPEAKING: 0.3, WRITING: 0.25, MEDIATION: 0.2 },
    levelDistribution: { A1: 0, A2: 0.05, B1: 0.2, B2: 0.35, C1: 0.3, C2: 0.1 },
    questionTypeDistribution: { MCQ: 0.3, SHORT_ANSWER: 0.25, ESSAY: 0.2, AUDIO_RESPONSE: 0.2, INTEGRATED_TASK: 0.05 },
  },
  {
    product: 'PLACEMENT',
    name: 'BIGT Penempatan',
    description: 'Tes adaptif-lite 3 tahap untuk menentukan level CEFR peserta secara cepat.',
    durationMinutes: 45,
    defaultQuestionCount: 25,
    dimensionWeights: { LISTENING: 0.25, READING: 0.25, SPEAKING: 0.25, WRITING: 0.25 },
    levelDistribution: { A1: 0.1, A2: 0.15, B1: 0.4, B2: 0.2, C1: 0.1, C2: 0.05 },
    questionTypeDistribution: { MCQ: 0.5, SHORT_ANSWER: 0.3, ESSAY: 0.1, AUDIO_RESPONSE: 0.1, INTEGRATED_TASK: 0 },
  },
  {
    product: 'PRACTICE',
    name: 'BIGT Latihan',
    description: 'Latihan mandiri fleksibel sesuai pilihan dimensi, level, dan jumlah soal.',
    durationMinutes: 30,
    defaultQuestionCount: 15,
    dimensionWeights: { LISTENING: 0.2, READING: 0.2, SPEAKING: 0.2, WRITING: 0.15, MEDIATION: 0.15, INTEGRATED: 0.1 },
    levelDistribution: { A1: 0.15, A2: 0.15, B1: 0.2, B2: 0.2, C1: 0.15, C2: 0.15 },
    questionTypeDistribution: { MCQ: 0.4, SHORT_ANSWER: 0.2, ESSAY: 0.15, AUDIO_RESPONSE: 0.15, INTEGRATED_TASK: 0.1 },
  },
]

async function seedBlueprints() {
  for (const bp of BLUEPRINTS) {
    await prisma.testBlueprint.upsert({
      where: { product: bp.product as any },
      update: {
        name: bp.name,
        description: bp.description,
        durationMinutes: bp.durationMinutes,
        defaultQuestionCount: bp.defaultQuestionCount,
        dimensionWeights: bp.dimensionWeights,
        levelDistribution: bp.levelDistribution,
        questionTypeDistribution: bp.questionTypeDistribution,
      },
      create: {
        product: bp.product as any,
        name: bp.name,
        description: bp.description,
        durationMinutes: bp.durationMinutes,
        defaultQuestionCount: bp.defaultQuestionCount,
        dimensionWeights: bp.dimensionWeights,
        levelDistribution: bp.levelDistribution,
        questionTypeDistribution: bp.questionTypeDistribution,
      },
    })
  }
}

const QUESTIONS: {
  dimension: string
  subskill: string
  questionType: string
  level: string
  difficulty: number
  topic: string
  prompt: string
  instruction: string | null
  correctAnswer: any
  explanation: string | null
  tags: string[]
  options: { label: string; text: string; isCorrect: boolean }[]
  stimulus: { type: string; title: string; content: string; transcript: string } | null
}[] = [
  // ===== A1 =====
  {
    dimension: 'LISTENING', subskill: 'phoneme_recognition', questionType: 'MCQ', level: 'A1', difficulty: 1,
    topic: 'perkenalan',
    prompt: 'Dengarkan percakapan: "Halo, nama saya Budi. Saya dari Jakarta."',
    instruction: 'Apa nama orang dalam percakapan?',
    correctAnswer: 'A',
    explanation: 'Orang tersebut memperkenalkan diri sebagai Budi.',
    tags: ['perkenalan', 'dasar'],
    options: [
      { label: 'A', text: 'Budi', isCorrect: true },
      { label: 'B', text: 'Jakarta', isCorrect: false },
      { label: 'C', text: 'Halo', isCorrect: false },
      { label: 'D', text: 'Saya', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Perkenalan', content: '', transcript: 'Halo, nama saya Budi. Saya dari Jakarta.' },
  },
  {
    dimension: 'READING', subskill: 'word_recognition', questionType: 'MCQ', level: 'A1', difficulty: 1,
    topic: 'keluarga',
    prompt: 'Bacalah teks: "Ini ibu saya. Namanya Sari. Ia seorang guru."',
    instruction: 'Apa pekerjaan ibu?',
    correctAnswer: 'C',
    explanation: 'Teks mengatakan ibu adalah seorang guru.',
    tags: ['keluarga', 'membaca'],
    options: [
      { label: 'A', text: 'Dokter', isCorrect: false },
      { label: 'B', text: 'Petani', isCorrect: false },
      { label: 'C', text: 'Guru', isCorrect: true },
      { label: 'D', text: 'Polisi', isCorrect: false },
    ],
    stimulus: null,
  },
  {
    dimension: 'SPEAKING', subskill: 'basic_greeting', questionType: 'AUDIO_RESPONSE', level: 'A1', difficulty: 1,
    topic: 'sapaan',
    prompt: 'Dengarkan dan ulangi: "Selamat pagi. Apa kabar?"',
    instruction: 'Rekam diri Anda mengucapkan kalimat tersebut.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan ketepatan pengucapan.',
    tags: ['berbicara', 'sapaan'],
    options: [],
    stimulus: { type: 'AUDIO', title: 'Sapaan Pagi', content: '', transcript: 'Selamat pagi. Apa kabar?' },
  },
  {
    dimension: 'WRITING', subskill: 'basic_vocabulary', questionType: 'SHORT_ANSWER', level: 'A1', difficulty: 2,
    topic: 'warna',
    prompt: 'Apa warna bendera Indonesia?',
    instruction: 'Tuliskan dua warna dalam bahasa Indonesia.',
    correctAnswer: 'merah putih',
    explanation: 'Bendera Indonesia berwarna merah dan putih.',
    tags: ['menulis', 'warna', 'kosakata'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'MEDIATION', subskill: 'basic_translation', questionType: 'SHORT_ANSWER', level: 'A1', difficulty: 2,
    topic: 'terjemahan',
    prompt: '"Good morning" dalam bahasa Indonesia adalah?',
    instruction: 'Tuliskan jawaban dalam bahasa Indonesia.',
    correctAnswer: 'selamat pagi',
    explanation: '"Good morning" berarti "selamat pagi" dalam bahasa Indonesia.',
    tags: ['mediasi', 'terjemahan'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'INTEGRATED', subskill: 'simple_instruction', questionType: 'MCQ', level: 'A1', difficulty: 2,
    topic: 'petunjuk',
    prompt: 'Bacalah petunjuk: "Buka buku halaman 5. Bacalah teks. Jawablah pertanyaan nomor 1-3."',
    instruction: 'Apa yang harus dilakukan setelah membaca teks?',
    correctAnswer: 'B',
    explanation: 'Petunjuk mengatakan "Jawablah pertanyaan nomor 1-3" setelah membaca teks.',
    tags: ['integrasi', 'petunjuk'],
    options: [
      { label: 'A', text: 'Membaca buku', isCorrect: false },
      { label: 'B', text: 'Menjawab pertanyaan', isCorrect: true },
      { label: 'C', text: 'Menutup buku', isCorrect: false },
      { label: 'D', text: 'Menulis nama', isCorrect: false },
    ],
    stimulus: null,
  },
  // ===== A2 =====
  {
    dimension: 'LISTENING', subskill: 'simple_conversation', questionType: 'MCQ', level: 'A2', difficulty: 4,
    topic: 'menyimak',
    prompt: 'Dengarkan percakapan:\nA: "Maaf, di mana pasar?"\nB: "Lurus saja, lalu belok kiri."\nA: "Terima kasih."',
    instruction: 'Ke mana orang tersebut ingin pergi?',
    correctAnswer: 'B',
    explanation: 'Orang A bertanya "di mana pasar?" — ia ingin pergi ke pasar.',
    tags: ['menyimak', 'arah'],
    options: [
      { label: 'A', text: 'Ke sekolah', isCorrect: false },
      { label: 'B', text: 'Ke pasar', isCorrect: true },
      { label: 'C', text: 'Ke rumah sakit', isCorrect: false },
      { label: 'D', text: 'Ke kantor', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Petunjuk Arah', content: '', transcript: 'A: "Maaf, di mana pasar?" B: "Lurus saja, lalu belok kiri." A: "Terima kasih."' },
  },
  {
    dimension: 'READING', subskill: 'short_text', questionType: 'MCQ', level: 'A2', difficulty: 4,
    topic: 'biografi',
    prompt: 'Bacalah teks:\n"Siti Nurhaliza lahir di Jakarta pada tahun 2000. Ia sekarang bekerja sebagai perawat di Rumah Sakit Pusat. Ia suka membaca buku dan berenang di waktu luangnya."',
    instruction: 'Di mana Siti bekerja?',
    correctAnswer: 'C',
    explanation: 'Teks menyebutkan Siti bekerja di Rumah Sakit Pusat.',
    tags: ['membaca', 'biografi'],
    options: [
      { label: 'A', text: 'Di sekolah', isCorrect: false },
      { label: 'B', text: 'Di perpustakaan', isCorrect: false },
      { label: 'C', text: 'Di Rumah Sakit Pusat', isCorrect: true },
      { label: 'D', text: 'Di kantor', isCorrect: false },
    ],
    stimulus: null,
  },
  {
    dimension: 'WRITING', subskill: 'descriptive_sentence', questionType: 'ESSAY', level: 'A2', difficulty: 5,
    topic: 'deskripsi',
    prompt: 'Deskripsikan rumah Anda dalam 3-5 kalimat.',
    instruction: 'Tulis deskripsi singkat tentang rumah Anda.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan struktur kalimat dan kosakata.',
    tags: ['menulis', 'deskripsi'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'SPEAKING', subskill: 'daily_routine', questionType: 'AUDIO_RESPONSE', level: 'A2', difficulty: 5,
    topic: 'rutinitas',
    prompt: 'Ceritakan kegiatan Anda setiap pagi dalam 2-3 kalimat.',
    instruction: 'Rekam penjelasan Anda tentang rutinitas pagi.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan kelancaran dan ketepatan kosakata.',
    tags: ['berbicara', 'rutinitas'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'MEDIATION', subskill: 'simple_summary', questionType: 'SHORT_ANSWER', level: 'A2', difficulty: 4,
    topic: 'ringkasan',
    prompt: 'Bacalah: "Hari ini cuaca sangat panas. Suhu mencapai 35 derajat. Banyak orang pergi ke pantai untuk berenang."',
    instruction: 'Apa ide utama dari teks tersebut? Tuliskan dalam satu kalimat.',
    correctAnswer: 'cuaca panas dan orang pergi ke pantai',
    explanation: 'Teks menjelaskan cuaca panas dan aktivitas orang pergi ke pantai.',
    tags: ['mediasi', 'ringkasan'],
    options: [],
    stimulus: null,
  },
  // ===== B1 =====
  {
    dimension: 'READING', subskill: 'main_idea', questionType: 'MCQ', level: 'B1', difficulty: 7,
    topic: 'artikel',
    prompt: 'Bacalah teks:\n\n"Polusi udara di kota-kota besar Indonesia semakin meningkat. Data dari Kementerian Lingkungan Hidup menunjukkan bahwa konsentrasi partikel PM2.5 di Jakarta, Surabaya, dan Bandung telah melampaui batas aman yang ditetapkan WHO. Sumber utama polusi adalah emisi kendaraan bermotor dan asap pabrik. Pemerintah telah mengumumkan kebijakan baru untuk mengurangi polusi, termasuk perluasan area bebas kendaraan bermotor dan insentif bagi pengguna kendaraan listrik."',
    instruction: 'Apa ide utama dari teks tersebut?',
    correctAnswer: 'A',
    explanation: 'Teks membahas polusi udara di kota besar Indonesia dan upaya pemerintah mengatasinya.',
    tags: ['membaca', 'polusi', 'lingkungan'],
    options: [
      { label: 'A', text: 'Polusi udara meningkat dan pemerintah berupaya mengatasinya', isCorrect: true },
      { label: 'B', text: 'Kendaraan listrik adalah solusi polusi udara', isCorrect: false },
      { label: 'C', text: 'WHO menetapkan batas aman polusi udara', isCorrect: false },
      { label: 'D', text: 'Ahli tidak setuju dengan kebijakan pemerintah', isCorrect: false },
    ],
    stimulus: null,
  },
  {
    dimension: 'LISTENING', subskill: 'detailed_info', questionType: 'MCQ', level: 'B1', difficulty: 8,
    topic: 'pengumuman',
    prompt: 'Dengarkan pengumuman:\n\n"Perhatian kepada seluruh penumpang. Penerbangan GA-207 menuju Denpasar mengalami penundaan karena kondisi cuaca buruk. Waktu keberangkatan yang semula pukul 14.30 WIB diundur menjadi pukul 16.45 WIB."',
    instruction: 'Mengapa penerbangan ditunda?',
    correctAnswer: 'B',
    explanation: 'Pengumuman menyebutkan penundaan karena kondisi cuaca buruk.',
    tags: ['menyimak', 'pengumuman'],
    options: [
      { label: 'A', text: 'Masalah teknis pesawat', isCorrect: false },
      { label: 'B', text: 'Kondisi cuaca buruk', isCorrect: true },
      { label: 'C', text: 'Kekurangan awak kabin', isCorrect: false },
      { label: 'D', text: 'Jadwal bandara padat', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Pengumuman Bandara', content: '', transcript: 'Perhatian kepada seluruh penumpang. Penerbangan GA-207 menuju Denpasar mengalami penundaan karena kondisi cuaca buruk. Waktu keberangkatan yang semula pukul 14.30 WIB diundur menjadi pukul 16.45 WIB.' },
  },
  {
    dimension: 'WRITING', subskill: 'opinion_essay', questionType: 'ESSAY', level: 'B1', difficulty: 8,
    topic: 'opini',
    prompt: 'Menurut Anda, apakah media sosial lebih banyak memberikan dampak positif atau negatif bagi remaja? Berikan argumen Anda dalam 5-7 kalimat.',
    instruction: 'Tulis esai pendek dengan setidaknya dua alasan.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan struktur argumen, koherensi, dan penggunaan kosakata B1.',
    tags: ['menulis', 'opini', 'media sosial'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'SPEAKING', subskill: 'narrate_experience', questionType: 'AUDIO_RESPONSE', level: 'B1', difficulty: 8,
    topic: 'pengalaman',
    prompt: 'Ceritakan pengalaman liburan Anda yang paling berkesan.',
    instruction: 'Rekam cerita Anda dalam 1-2 menit.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan kelancaran, intonasi, dan kosakata.',
    tags: ['berbicara', 'pengalaman'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'MEDIATION', subskill: 'paraphrase', questionType: 'SHORT_ANSWER', level: 'B1', difficulty: 7,
    topic: 'parafrase',
    prompt: 'Parafrase kalimat berikut: "Perusahaan memutuskan untuk menunda peluncuran produk baru karena kondisi pasar yang tidak stabil."',
    instruction: 'Tulis ulang dengan kata-kata Anda sendiri tanpa mengubah makna.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan ketepatan makna dan variasi kosakata.',
    tags: ['mediasi', 'parafrase'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'INTEGRATED', subskill: 'read_listen_synthesize', questionType: 'MCQ', level: 'B1', difficulty: 9,
    topic: 'sintesis',
    prompt: 'Bacalah teks:\n"Program penghijauan kota bertujuan mengurangi suhu perkotaan dan meningkatkan kualitas udara."\n\nDengarkan:\n"Pemerintah kota akan menanam 10.000 pohon di sepanjang jalan utama tahun ini."',
    instruction: 'Apa hubungan antara teks dan informasi yang didengar?',
    correctAnswer: 'C',
    explanation: 'Keduanya berkaitan dengan program penghijauan kota.',
    tags: ['integrasi', 'lingkungan'],
    options: [
      { label: 'A', text: 'Teks dan audio membahas topik yang berbeda', isCorrect: false },
      { label: 'B', text: 'Audio bertentangan dengan teks', isCorrect: false },
      { label: 'C', text: 'Audio memberikan contoh tindakan dari program di teks', isCorrect: true },
      { label: 'D', text: 'Teks menjelaskan hasil program, audio menjelaskan masalah', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Penghijauan Kota', content: '', transcript: 'Pemerintah kota akan menanam 10.000 pohon di sepanjang jalan utama tahun ini.' },
  },
  // ===== B2 =====
  {
    dimension: 'READING', subskill: 'inference', questionType: 'MCQ', level: 'B2', difficulty: 11,
    topic: 'ekonomi',
    prompt: 'Bacalah teks:\n\n"Meskipun tingkat inflasi nasional menunjukkan tren penurunan dalam tiga bulan terakhir, daya beli masyarakat kelas menengah ke bawah belum menunjukkan perbaikan signifikan. Hal ini disebabkan oleh stagnasi upah di sektor informal yang menyerap lebih dari 60 persen tenaga kerja Indonesia. Sementara itu, harga kebutuhan pokok masih bertahan di level tinggi akibat gangguan rantai pasok global."',
    instruction: 'Apa yang dapat disimpulkan tentang kondisi ekonomi saat ini?',
    correctAnswer: 'D',
    explanation: 'Teks menyiratkan bahwa meskipun inflasi menurun, daya beli belum membaik.',
    tags: ['membaca', 'ekonomi', 'inferensi'],
    options: [
      { label: 'A', text: 'Inflasi telah berhasil diatasi sepenuhnya', isCorrect: false },
      { label: 'B', text: 'Sektor informal tidak terpengaruh inflasi', isCorrect: false },
      { label: 'C', text: 'Bank Indonesia akan menaikkan suku bunga', isCorrect: false },
      { label: 'D', text: 'Penurunan inflasi belum menjamin perbaikan daya beli', isCorrect: true },
    ],
    stimulus: null,
  },
  {
    dimension: 'LISTENING', subskill: 'evaluate_argument', questionType: 'MCQ', level: 'B2', difficulty: 11,
    topic: 'debat',
    prompt: 'Dengarkan percakapan:\n\nA: "Saya rasa sekolah daring kurang efektif karena siswa mudah terdistraksi."\nB: "Namun, sekolah daring memberikan fleksibilitas waktu. Banyak siswa justru lebih percaya diri bertanya di forum daring."\nA: "Tapi interaksi sosial langsung tidak bisa digantikan oleh layar."\nB: "Saya setuju interaksi langsung penting, tetapi sekolah daring bisa menjadi solusi untuk daerah terpencil."',
    instruction: 'Apa titik temu antara kedua pembicara?',
    correctAnswer: 'B',
    explanation: 'Keduanya sepakat bahwa interaksi langsung penting.',
    tags: ['menyimak', 'evaluasi', 'debat'],
    options: [
      { label: 'A', text: 'Sekolah daring lebih baik', isCorrect: false },
      { label: 'B', text: 'Interaksi sosial langsung itu penting', isCorrect: true },
      { label: 'C', text: 'Sekolah daring hanya cocok untuk daerah terpencil', isCorrect: false },
      { label: 'D', text: 'Siswa lebih percaya diri di sekolah tatap muka', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Debat Pendidikan', content: '', transcript: 'A: "Saya rasa sekolah daring kurang efektif karena siswa mudah terdistraksi." B: "Namun, sekolah daring memberikan fleksibilitas waktu. Banyak siswa justru lebih percaya diri bertanya di forum daring." A: "Tapi interaksi sosial langsung tidak bisa digantikan oleh layar." B: "Saya setuju interaksi langsung penting, tetapi sekolah daring bisa menjadi solusi untuk daerah terpencil."' },
  },
  {
    dimension: 'WRITING', subskill: 'argumentative_essay', questionType: 'ESSAY', level: 'B2', difficulty: 12,
    topic: 'argumen',
    prompt: 'Beberapa negara memberlakukan larangan penggunaan smartphone di sekolah. Menurut Anda, apakah Indonesia perlu mengadopsi kebijakan serupa?',
    instruction: 'Tulis esai 8-10 kalimat dengan pro, kontra, dan kesimpulan.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan struktur argumen dan koherensi.',
    tags: ['menulis', 'argumen', 'pendidikan'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'SPEAKING', subskill: 'present_analysis', questionType: 'AUDIO_RESPONSE', level: 'B2', difficulty: 11,
    topic: 'analisis',
    prompt: 'Jelaskan kelebihan dan kekurangan bekerja dari rumah (work from home).',
    instruction: 'Rekam presentasi singkat Anda dalam 2-3 menit.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan struktur presentasi dan kelancaran.',
    tags: ['berbicara', 'analisis'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'MEDIATION', subskill: 'summarize_debate', questionType: 'MCQ', level: 'B2', difficulty: 10,
    topic: 'ringkasan',
    prompt: 'Bacalah dua pendapat:\n\nPendapat 1: "Pemerintah harus menaikkan pajak penghasilan orang kaya untuk mendanai program kesejahteraan sosial."\n\nPendapat 2: "Kenaikan pajak justru akan mengurangi investasi dan menghambat pertumbuhan ekonomi."',
    instruction: 'Apa inti perdebatan di atas?',
    correctAnswer: 'A',
    explanation: 'Perdebatan berpusat pada dampak kenaikan pajak orang kaya.',
    tags: ['mediasi', 'ringkasan', 'debat'],
    options: [
      { label: 'A', text: 'Dampak kenaikan pajak orang kaya terhadap ekonomi dan kesejahteraan', isCorrect: true },
      { label: 'B', text: 'Cara mengurangi kesenjangan ekonomi', isCorrect: false },
      { label: 'C', text: 'Investasi asing di Indonesia', isCorrect: false },
      { label: 'D', text: 'Program kesejahteraan sosial pemerintah', isCorrect: false },
    ],
    stimulus: null,
  },
  {
    dimension: 'INTEGRATED', subskill: 'data_interpretation', questionType: 'MCQ', level: 'B2', difficulty: 11,
    topic: 'data',
    prompt: 'Bacalah data:\n"Survei menunjukkan 72% remaja Indonesia memiliki akun media sosial. Rata-rata waktu layar remaja adalah 5,2 jam per hari."\n\nDengarkan:\n"Pakar psikologi anak mengatakan penggunaan media sosial berlebihan dapat mengganggu perkembangan sosial remaja."',
    instruction: 'Manakah pernyataan yang PALING DIDUKUNG oleh data dan pernyataan ahli?',
    correctAnswer: 'C',
    explanation: 'Data menunjukkan waktu layar tinggi dan ahli mengaitkannya dengan gangguan perkembangan.',
    tags: ['integrasi', 'data', 'media sosial'],
    options: [
      { label: 'A', text: 'Cyberbullying adalah masalah terbesar remaja', isCorrect: false },
      { label: 'B', text: 'Remaja harus dilarang menggunakan media sosial', isCorrect: false },
      { label: 'C', text: 'Penggunaan media sosial berpotensi berdampak negatif pada perkembangan remaja', isCorrect: true },
      { label: 'D', text: 'Semua remaja Indonesia memiliki akun media sosial', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Pendapat Ahli', content: '', transcript: 'Pakar psikologi anak mengatakan penggunaan media sosial berlebihan dapat mengganggu perkembangan sosial remaja.' },
  },
  // ===== C1 =====
  {
    dimension: 'READING', subskill: 'critical_evaluation', questionType: 'MCQ', level: 'C1', difficulty: 14,
    topic: 'kebijakan',
    prompt: 'Bacalah teks:\n\n"Kebijakan kuota impor beras yang diterapkan pemerintah sejak 2023 menuai pro dan kontra. Di satu sisi, kebijakan ini berhasil melindungi petani lokal dari fluktuasi harga global dan meningkatkan produksi dalam negeri sebesar 8 persen. Di sisi lain, harga beras di pasaran mengalami kenaikan rata-rata 12 persen yang memberatkan konsumen kelas bawah. Pendekatan hybrid yang menggabungkan tarif impor cerdas dengan subsidi langsung kepada petani kecil mungkin merupakan solusi yang lebih berimbang."',
    instruction: 'Bagaimana penulis menyusun argumen dalam teks tersebut?',
    correctAnswer: 'D',
    explanation: 'Penulis memaparkan sisi positif, lalu sisi negatif, kemudian menyimpulkan dengan solusi alternatif.',
    tags: ['membaca', 'evaluasi', 'kebijakan'],
    options: [
      { label: 'A', text: 'Hanya menyajikan data pendukung kebijakan', isCorrect: false },
      { label: 'B', text: 'Langsung menyimpulkan tanpa argumen pendukung', isCorrect: false },
      { label: 'C', text: 'Menolak kebijakan sepenuhnya', isCorrect: false },
      { label: 'D', text: 'Menyajikan pro dan kontra lalu mengusulkan alternatif', isCorrect: true },
    ],
    stimulus: null,
  },
  {
    dimension: 'LISTENING', subskill: 'nuance_interpretation', questionType: 'MCQ', level: 'C1', difficulty: 14,
    topic: 'wawancara',
    prompt: 'Dengarkan wawancara:\n\nWartawan: "Apakah transformasi digital di Indonesia sudah berjalan sesuai harapan?"\n\nNarasumber: "Saya melihat ada optimisme yang beralasan. Adopsi teknologi di sektor finansial melampaui ekspektasi. Namun, ketika kita berbicara tentang transformasi digital yang inklusif, kita masih menghadapi tantangan struktural. Bukan hanya infrastruktur, tapi juga literasi digital dan kesiapan regulasi. Kita berada di jalur yang tepat, tetapi masih panjang."',
    instruction: 'Nada bicara narasumber dapat digambarkan sebagai...',
    correctAnswer: 'B',
    explanation: 'Narasumber optimis-hati-hati: mengakui kemajuan namun juga menyoroti tantangan struktural.',
    tags: ['menyimak', 'nuansa', 'wawancara'],
    options: [
      { label: 'A', text: 'Sangat pesimistis dan kritis', isCorrect: false },
      { label: 'B', text: 'Optimis namun hati-hati (measured optimism)', isCorrect: true },
      { label: 'C', text: 'Netral tanpa pendapat jelas', isCorrect: false },
      { label: 'D', text: 'Antusias dan penuh keyakinan', isCorrect: false },
    ],
    stimulus: { type: 'AUDIO', title: 'Wawancara Digital', content: '', transcript: 'Wartawan: "Apakah transformasi digital di Indonesia sudah berjalan sesuai harapan?" Narasumber: "Saya melihat ada optimisme yang beralasan. Adopsi teknologi di sektor finansial melampaui ekspektasi. Namun, ketika kita berbicara tentang transformasi digital yang inklusif, kita masih menghadapi tantangan struktural. Bukan hanya infrastruktur, tapi juga literasi digital dan kesiapan regulasi. Kita berada di jalur yang tepat, tetapi masih panjang."' },
  },
  {
    dimension: 'WRITING', subskill: 'critical_analysis', questionType: 'ESSAY', level: 'C1', difficulty: 15,
    topic: 'analisis',
    prompt: 'Analisislah dampak kebijakan ekonomi digital terhadap sektor UMKM di Indonesia.',
    instruction: 'Tulis esai analitis 10-15 kalimat dengan pendahuluan, analisis, dan rekomendasi.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan kedalaman analisis dan koherensi argumen.',
    tags: ['menulis', 'analisis', 'ekonomi'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'SPEAKING', subskill: 'complex_explanation', questionType: 'AUDIO_RESPONSE', level: 'C1', difficulty: 14,
    topic: 'penjelasan',
    prompt: 'Jelaskan bagaimana perubahan iklim memengaruhi sektor pertanian di Indonesia.',
    instruction: 'Rekam penjelasan dalam 3-4 menit dengan contoh konkret.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan kedalaman penjelasan dan struktur.',
    tags: ['berbicara', 'perubahan iklim'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'MEDIATION', subskill: 'academic_synthesis', questionType: 'MCQ', level: 'C1', difficulty: 14,
    topic: 'sintesis',
    prompt: 'Bacalah:\n\nKutipan 1: "Project-based learning meningkatkan kemampuan berpikir kritis siswa sebesar 23 persen." (Jurnal Pendidikan)\n\nKutipan 2: "Implementasi PBL memerlukan pelatihan guru dan sumber daya yang memadai." (Kemendikbud)',
    instruction: 'Apa posisi paling berimbang berdasarkan kedua sumber?',
    correctAnswer: 'C',
    explanation: 'Kedua sumber menunjukkan PBL efektif tetapi memerlukan kesiapan sumber daya.',
    tags: ['mediasi', 'sintesis', 'akademik'],
    options: [
      { label: 'A', text: 'PBL harus segera diterapkan di semua sekolah', isCorrect: false },
      { label: 'B', text: 'PBL tidak layak diterapkan karena terlalu mahal', isCorrect: false },
      { label: 'C', text: 'PBL efektif, tetapi perlu diterapkan bertahap dengan kesiapan guru', isCorrect: true },
      { label: 'D', text: 'PBL hanya cocok untuk sekolah maju', isCorrect: false },
    ],
    stimulus: null,
  },
  // ===== C2 =====
  {
    dimension: 'READING', subskill: 'discourse_analysis', questionType: 'MCQ', level: 'C2', difficulty: 17,
    topic: 'analisis wacana',
    prompt: 'Bacalah teks:\n\n"Dalam diskursus kebangsaan kontemporer, konsep gotong royong sering dikontekstualisasikan ulang sebagai fondasi ekonomi kerakyatan di era digital. Fenomena crowdfunding dan koperasi digital dapat dilihat sebagai manifestasi modern dari semangat kolektif. Namun, transformasi digital juga menghadirkan paradoks: di satu sisi ia mendemokratisasi akses permodalan, di sisi lain ia berpotensi memperkuat ketimpangan struktural jika tidak diiringi kebijakan redistributif."',
    instruction: 'Apa paradoks utama yang diidentifikasi penulis?',
    correctAnswer: 'B',
    explanation: 'Penulis mengidentifikasi paradoks bahwa digitalisasi mendemokratisasi akses namun berpotensi memperkuat ketimpangan.',
    tags: ['membaca', 'wacana', 'analisis'],
    options: [
      { label: 'A', text: 'Gotong royong tidak relevan di era digital', isCorrect: false },
      { label: 'B', text: 'Digitalisasi mendemokratisasi akses namun berpotensi memperkuat ketimpangan', isCorrect: true },
      { label: 'C', text: 'Koperasi digital lebih efisien daripada crowdfunding', isCorrect: false },
      { label: 'D', text: 'Nilai gotong royong menghambat efisiensi ekonomi', isCorrect: false },
    ],
    stimulus: null,
  },
  {
    dimension: 'LISTENING', subskill: 'implicit_meaning', questionType: 'MCQ', level: 'C2', difficulty: 18,
    topic: 'makna tersirat',
    prompt: 'Dengarkan pidato:\n\n"Kita berdiri di persimpangan sejarah. Keputusan yang kita ambil hari ini akan menentukan apakah generasi mendatang akan mewarisi lautan yang subur atau gurun yang sunyi. Saya tidak perlu mengingatkan tentang data ilmiah yang sudah sering disampaikan. Yang kita butuhkan adalah keberanian untuk bertindak — sekarang."',
    instruction: 'Apa makna tersirat dari "Saya tidak perlu mengingatkan tentang data ilmiah"?',
    correctAnswer: 'D',
    explanation: 'Pembicara menekankan bahwa masalah sudah diketahui luas, fokus harus pada tindakan.',
    tags: ['menyimak', 'implisit', 'pidato'],
    options: [
      { label: 'A', text: 'Data ilmiah tidak penting', isCorrect: false },
      { label: 'B', text: 'Pembicara lupa data ilmiah', isCorrect: false },
      { label: 'C', text: 'Data ilmiah tidak meyakinkan', isCorrect: false },
      { label: 'D', text: 'Masalah sudah sangat jelas sehingga fokus harus pada tindakan', isCorrect: true },
    ],
    stimulus: { type: 'AUDIO', title: 'Pidato Lingkungan', content: '', transcript: 'Kita berdiri di persimpangan sejarah. Keputusan yang kita ambil hari ini akan menentukan apakah generasi mendatang akan mewarisi lautan yang subur atau gurun yang sunyi. Saya tidak perlu mengingatkan tentang data ilmiah yang sudah sering disampaikan. Yang kita butuhkan adalah keberanian untuk bertindak — sekarang.' },
  },
  {
    dimension: 'WRITING', subskill: 'scholarly_essay', questionType: 'ESSAY', level: 'C2', difficulty: 18,
    topic: 'ilmiah',
    prompt: 'Diskusikan hubungan antara revitalisasi bahasa daerah dan penguatan identitas nasional dalam konteks Masyarakat Ekonomi ASEAN.',
    instruction: 'Tulis esai akademis dengan struktur formal, argumen, dan simpulan.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan kedalaman analisis dan kosakata akademis.',
    tags: ['menulis', 'akademik', 'bahasa daerah'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'SPEAKING', subskill: 'persuasive_argument', questionType: 'AUDIO_RESPONSE', level: 'C2', difficulty: 17,
    topic: 'persuasi',
    prompt: 'Berikan pidato persuasif tentang pentingnya investasi riset bahasa Indonesia di era AI.',
    instruction: 'Rekam pidato 3-5 menit dengan struktur retoris yang kuat.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan struktur retoris dan kekuatan argumen.',
    tags: ['berbicara', 'persuasi'],
    options: [],
    stimulus: null,
  },
  {
    dimension: 'INTEGRATED', subskill: 'strategic_recommendation', questionType: 'ESSAY', level: 'C2', difficulty: 18,
    topic: 'rekomendasi strategis',
    prompt: 'Bacalah:\n"Indeks daya saing global Indonesia naik 5 peringkat, namun peringkat pendidikan dan keterampilan bahasa tetap stagnan."\n\nDengarkan:\n"CEO perusahaan menyatakan kemampuan bahasa Indonesia yang baik menjadi faktor pembeda dalam rekrutmen talenta lokal."\n\nBacalah:\n"Pemerintah menargetkan 10 juta wisatawan, namun sektor pariwisata kekurangan tenaga kerja kompeten."',
    instruction: 'Rumuskan rekomendasi strategis untuk meningkatkan kompetensi kebahasaan sebagai pengungkit daya saing nasional.',
    correctAnswer: null,
    explanation: 'Penilaian berdasarkan kemampuan integrasi data dan rekomendasi strategis.',
    tags: ['integrasi', 'strategis', 'kebahasaan'],
    options: [],
    stimulus: { type: 'AUDIO', title: 'Wawancara CEO', content: '', transcript: 'CEO perusahaan multinasional menyatakan bahwa kemampuan bahasa Indonesia yang baik menjadi faktor pembeda utama dalam rekrutmen talenta lokal untuk posisi manajerial.' },
  },
]

async function main() {
  console.log('Memulai seeding...')

  await seedBlueprints()
  console.log('Blueprint tes dibuat.')

  await seedCanDo()
  console.log('Can-do descriptors dibuat.')

  let createdCount = 0
  for (const q of QUESTIONS) {
    const optionsData = q.options.length > 0
      ? { create: q.options.map((o, i) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect, order: i })) }
      : undefined

    let stimulusConnect = undefined
    if (q.stimulus) {
      const stim = await prisma.questionStimulus.create({
        data: {
          type: q.stimulus.type as any,
          title: q.stimulus.title,
          content: q.stimulus.content,
          transcript: q.stimulus.transcript,
        },
      })
      stimulusConnect = { connect: { id: stim.id } }
    }

    await prisma.questionItem.create({
      data: {
        dimension: q.dimension as any,
        subskill: q.subskill,
        questionType: q.questionType as any,
        level: q.level as any,
        difficulty: q.difficulty,
        topic: q.topic,
        prompt: q.prompt,
        instruction: q.instruction,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        tags: q.tags,
        status: 'ACTIVE',
        options: optionsData,
        stimulus: stimulusConnect,
      },
    })
    createdCount++
  }

  console.log(`${createdCount} soal berhasil dibuat.`)
  console.log('Seeding selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
