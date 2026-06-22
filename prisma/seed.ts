import { PrismaClient, Dimension, QuestionType, CEFRLevel } from '@prisma/client'

const prisma = new PrismaClient()

const QUESTIONS = [
  // ─── LISTENING (5 soal) ─────────────────────────────────────────────────────
  {
    dimension: 'LISTENING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Dengarkan situasi berikut: Seorang mahasiswa berbicara dengan dosennya tentang perpanjangan tenggat waktu tugas. Dosen awalnya menolak, tetapi mahasiswa tersebut menjelaskan bahwa ia harus merawat orang tuanya yang sakit.\n\nMengapa dosen akhirnya setuju memberikan perpanjangan?',
      options: [
        'Karena mahasiswa tersebut adalah mahasiswa terbaik',
        'Karena alasan keluarga yang mendesak dan dapat dibuktikan',
        'Karena tugas tersebut belum dimulai oleh siapa pun',
        'Karena dosen merasa bersalah'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'LISTENING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Situasi: Dua orang berdiskusi tentang rencana liburan. Pembicara A mengusulkan Bali, tetapi Pembicara B menolak karena sudah pernah ke sana tiga kali.\n\nApa yang paling mungkin diusulkan Pembicara B selanjutnya?',
      options: [
        'Tetap pergi ke Bali',
        'Mengusulkan destinasi alternatif yang belum dikunjungi',
        'Membatalkan liburan',
        'Pergi ke luar negeri'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'LISTENING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Situasi: Dalam sebuah rapat perusahaan, manajer mengumumkan bahwa perusahaan akan beralih ke sistem kerja hybrid. Beberapa karyawan menyambut baik, tetapi ada yang khawatir tentang komunikasi tim.\n\nApa kekhawatiran utama karyawan yang tidak setuju?',
      options: [
        'Gaji akan dipotong',
        'Komunikasi dan kolaborasi tim akan terganggu',
        'Jam kerja akan bertambah',
        'Kantor akan ditutup'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'LISTENING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'A2' as CEFRLevel,
    content: {
      prompt: 'Situasi: Seseorang menelepon restoran untuk memesan meja untuk 4 orang pada hari Sabtu malam.\n\nApa informasi yang paling penting disampaikan penelepon?',
      options: [
        'Menu favoritnya',
        'Jumlah orang, hari, dan waktu kedatangan',
        'Nama chef restoran',
        'Harga makanan'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'LISTENING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Situasi: Dalam podcast kesehatan, seorang dokter menjelaskan bahwa tidur kurang dari 6 jam secara konsisten dapat meningkatkan risiko penyakit jantung hingga 48%.\n\nApa kesimpulan utama dari pernyataan dokter tersebut?',
      options: [
        'Semua orang harus tidur 6 jam',
        'Kurang tidur kronis berdampak serius pada kesehatan jantung',
        'Penyakit jantung hanya disebabkan oleh kurang tidur',
        'Tidur lebih dari 6 jam menjamin kesehatan jantung'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },

  // ─── READING (5 soal) ──────────────────────────────────────────────────────
  {
    dimension: 'READING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Baca paragraf berikut:\n\n"Media sosial telah mengubah cara kita berkomunikasi secara fundamental. Meskipun platform seperti Instagram dan Twitter memungkinkan koneksi lintas geografi yang belum pernah terjadi sebelumnya, mereka juga menciptakan ilusi kedekatan yang berbahaya. Kita merasa mengenal seseorang karena melihat postingan mereka setiap hari, padahal yang kita lihat hanyalah kurasi terbaik dari hidup mereka. Fenomena ini bukan hanya memengaruhi hubungan personal, tetapi juga membentuk ekspektasi yang tidak realistis tentang kehidupan sehari-hari. Oleh karena itu, regulasi yang mengatur transparansi konten di media sosial bukan lagi pilihan, melainkan keharusan."\n\nApa argumen utama penulis dalam paragraf tersebut?',
      options: [
        'Media sosial berbahaya dan harus dilarang',
        'Regulasi media sosial diperlukan untuk menjaga transparansi',
        'Remaja tidak boleh menggunakan media sosial',
        'Platform media sosial harus ditutup'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'READING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Baca teks berikut:\n\n"Program literasi digital yang diluncurkan Kementerian Pendidikan menargetkan 10 juta siswa di seluruh Indonesia. Program ini mencakup pelatihan mengenali hoaks, memahami privasi data, dan etika berkomunikasi di dunia maya. Menurut survei awal, 67% siswa sekolah menengah tidak dapat membedakan berita asli dan berita palsu di media sosial."\n\nBerdasarkan teks di atas, mengapa program literasi digital diperlukan?',
      options: [
        'Karena siswa tidak memiliki akses internet',
        'Karena mayoritas siswa kesulitan membedakan informasi benar dan palsu',
        'Karena guru tidak bisa menggunakan teknologi',
        'Karena pemerintah ingin mengontrol media sosial'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'READING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Baca paragraf berikut:\n\n"Bahasa Indonesia mengalami evolusi yang signifikan sejak pertama kali ditetapkan sebagai bahasa nasional pada Sumpah Pemuda 1928. Pengaruh globalisasi membawa masuk ribuan kata serapan baru, terutama dari bahasa Inggris, ke dalam kosakata sehari-hari. Fenomena campur kode (code-mixing) yang semakin umum di kalangan generasi muda menimbulkan kekhawatiran di kalangan linguistik tentang erosi kemurnian bahasa. Namun, beberapa ahli berpendapat bahwa evolusi ini justru menunjukkan vitalitas bahasa Indonesia sebagai bahasa yang hidup dan adaptif."\n\nApa pandangan para ahli yang disebutkan di akhir paragraf?',
      options: [
        'Bahasa Indonesia harus dilindungi dari pengaruh asing',
        'Campur kode adalah tanda kemunduran bahasa',
        'Perubahan bahasa menunjukkan bahwa bahasa Indonesia masih hidup dan berkembang',
        'Generasi muda harus kembali menggunakan bahasa baku'
      ],
      correctAnswer: 'C'
    },
    points: 10,
  },
  {
    dimension: 'READING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'A2' as CEFRLevel,
    content: {
      prompt: 'Baca pengumuman berikut:\n\n"Diberitahukan kepada seluruh penghuni apartemen bahwa mulai tanggal 1 Januari 2027, area parkir basement akan ditutup sementara untuk renovasi. Penghuni diminta memindahkan kendaraan ke area parkir terbuka di belakang gedung. Renovasi diperkirakan selesai dalam 3 bulan. Mohon maaf atas ketidaknyamanannya."\n\nApa yang harus dilakukan penghuni apartemen?',
      options: [
        'Membeli tempat parkir baru',
        'Memindahkan kendaraan ke area parkir belakang gedung',
        'Tidak menggunakan kendaraan selama 3 bulan',
        'Membayar biaya renovasi'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },
  {
    dimension: 'READING' as Dimension,
    type: 'MCQ' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Baca teks berikut:\n\n"Kecerdasan buatan (AI) kini digunakan dalam berbagai bidang, mulai dari diagnosis medis hingga penulisan kreatif. Di Indonesia, beberapa rumah sakit sudah mulai menggunakan AI untuk membantu mendeteksi penyakit kanker dari citra rontgen dengan akurasi mencapai 94%. Meskipun demikian, banyak dokter menekankan bahwa AI hanya alat bantu dan keputusan akhir tetap harus diambil oleh tenaga medis profesional."\n\nApa peran AI dalam konteks diagnosis medis menurut teks?',
      options: [
        'Menggantikan dokter sepenuhnya',
        'Sebagai alat bantu dengan keputusan akhir tetap pada dokter',
        'Hanya digunakan untuk penelitian',
        'Tidak dapat diandalkan sama sekali'
      ],
      correctAnswer: 'B'
    },
    points: 10,
  },

  // ─── SPEAKING (5 soal) ─────────────────────────────────────────────────────
  {
    dimension: 'SPEAKING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Jelaskan dalam 1-2 paragraf: Apa hal yang paling kamu sukai dari budaya Indonesia dan mengapa? Gunakan contoh konkret dari pengalaman atau pengamatan Anda.\n\n[Untuk MVP, gunakan text input sebagai proxy speaking]'
    },
    rubric: { fluency: 25, lexicalRange: 25, grammarAccuracy: 25, coherence: 25 },
    points: 10,
  },
  {
    dimension: 'SPEAKING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Bayangkan Anda sedang presentasi di depan kelas. Topik: "Apakah kerja jarak jauh (remote work) lebih produktif dibanding kerja di kantor?" Sampaikan argumen Anda dalam 2-3 paragraf, sertakan data atau contoh untuk mendukung pendapat Anda.'
    },
    rubric: { fluency: 20, lexicalRange: 20, grammarAccuracy: 20, coherence: 20, pragmaticCompetence: 20 },
    points: 10,
  },
  {
    dimension: 'SPEAKING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'A2' as CEFRLevel,
    content: {
      prompt: 'Ceritakan tentang rutinitas harian Anda dalam 1 paragraf (5-8 kalimat). Gunakan kata-kata penghubung waktu seperti "pertama", "kemudian", "setelah itu", "akhirnya".'
    },
    rubric: { fluency: 30, grammarAccuracy: 30, lexicalRange: 20, coherence: 20 },
    points: 10,
  },
  {
    dimension: 'SPEAKING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Anda bertemu dengan turis asing yang bertanya: "Bisa tolong jelaskan apa itu nasi goreng dan mengapa orang Indonesia sangat menyukainya?" Jawab pertanyaan ini dalam 1-2 paragraf dengan bahasa yang mudah dipahami.'
    },
    rubric: { fluency: 25, lexicalRange: 25, coherence: 25, pragmaticCompetence: 25 },
    points: 10,
  },
  {
    dimension: 'SPEAKING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Berikan pendapat Anda tentang pernyataan berikut: "Pemerintah seharusnya mewajibkan semua siswa belajar coding sejak SD." Setuju atau tidak? Jelaskan alasan Anda dalam 2-3 paragraf.'
    },
    rubric: { fluency: 20, lexicalRange: 20, grammarAccuracy: 20, coherence: 20, pragmaticCompetence: 20 },
    points: 10,
  },

  // ─── WRITING (5 soal) ──────────────────────────────────────────────────────
  {
    dimension: 'WRITING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Setuju atau tidak setuju: "Bahasa daerah harus diajarkan wajib di sekolah nasional."\n\nTulis argumen Anda dalam 200-300 kata. Sertakan minimal 2 alasan dan 1 contoh konkret.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },
  {
    dimension: 'WRITING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Tulis email formal (150-200 kata) kepada atasan Anda untuk meminta cuti selama 5 hari kerja. Jelaskan alasan cuti, rencana penyelesaian tugas sebelum cuti, dan bagaimana Anda bisa dihubungi jika diperlukan.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },
  {
    dimension: 'WRITING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Tulis esai argumentatif (250-300 kata) tentang topik berikut: "Apakah kecerdasan buatan akan menggantikan pekerjaan manusia dalam 10 tahun ke depan?" Ambil posisi yang jelas dan dukung dengan argumen logis.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },
  {
    dimension: 'WRITING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'A2' as CEFRLevel,
    content: {
      prompt: 'Tulis paragraf deskriptif (100-150 kata) tentang tempat favorit Anda di Indonesia. Deskripsikan apa yang Anda lihat, dengar, dan rasakan saat berada di sana.'
    },
    rubric: { taskCompletion: 30, coherence: 25, lexicalRange: 25, grammarAccuracy: 20 },
    points: 10,
  },
  {
    dimension: 'WRITING' as Dimension,
    type: 'ESSAY' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Tulis laporan singkat (150-200 kata) tentang sebuah acara yang baru saja Anda hadiri (seminar, workshop, atau konferensi). Sertakan: nama acara, tanggal, pembicara utama, dan 2-3 hal penting yang Anda pelajari.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },

  // ─── MEDIATION (5 soal) ────────────────────────────────────────────────────
  {
    dimension: 'MEDIATION' as Dimension,
    type: 'SHORT_ANSWER' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Baca abstract berikut dari jurnal ilmiah:\n\n"Penelitian ini mengevaluasi efektivitas intervensi berbasis kecerdasan artifisial dalam deteksi dini diabetes melitus tipe 2 pada populasi dewasa di Indonesia. Menggunakan dataset 50.000 rekam medis dari 12 rumah sakit, model machine learning yang dikembangkan menunjukkan sensitivitas 91.3% dan spesifisitas 88.7% dalam memprediksi onset diabetes dalam kurun waktu 3 tahun. Hasil ini secara signifikan melampaui metode skrining konvensional (p<0.001)."\n\nTulis penjelasan untuk orang awam (misalnya ibu rumah tangga) dalam 3-4 kalimat sederhana.'
    },
    points: 10,
  },
  {
    dimension: 'MEDIATION' as Dimension,
    type: 'SHORT_ANSWER' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Seorang turis Jepang yang tidak bisa berbahasa Indonesia tersesat dan menunjukkan peta kepada Anda. Dia ingin pergi ke Museum Nasional. Anda tahu bahwa museum tersebut sedang ditutup untuk renovasi.\n\nTuliskan apa yang akan Anda sampaikan kepada turis tersebut dalam 3-4 kalimat, termasuk alternatif tempat wisata yang bisa dikunjungi.'
    },
    points: 10,
  },
  {
    dimension: 'MEDIATION' as Dimension,
    type: 'SHORT_ANSWER' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Anda adalah mediator dalam konflik antara dua rekan kerja. Rekan A merasa rekan B tidak berkontribusi dalam proyek tim. Rekan B merasa kontribusinya tidak dihargai karena hanya bekerja di belakang layar (riset dan analisis data).\n\nTulis ringkasan situasi dan usulan solusi dalam 4-5 kalimat yang bisa disampaikan kepada kedua belah pihak.'
    },
    points: 10,
  },
  {
    dimension: 'MEDIATION' as Dimension,
    type: 'SHORT_ANSWER' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'Nenek Anda yang tinggal di desa menerima surat resmi dari pemerintah tentang program bantuan sosial. Surat tersebut menggunakan bahasa birokrasi yang rumit. Nenek Anda meminta Anda menjelaskan isinya.\n\nTulis penjelasan sederhana dalam 3-4 kalimat tentang isi surat tersebut (asumsikan surat berisi informasi tentang pencairan dana bantuan dan syarat yang harus dipenuhi).'
    },
    points: 10,
  },
  {
    dimension: 'MEDIATION' as Dimension,
    type: 'SHORT_ANSWER' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'Sebuah perusahaan teknologi multinasional akan membuka kantor di Indonesia. Tim HR dari kantor pusat (berbahasa Inggris) meminta Anda membuat ringkasan dalam bahasa Indonesia tentang budaya kerja Indonesia yang perlu mereka ketahui.\n\nTulis ringkasan 4-5 kalimat tentang norma-norma penting di tempat kerja Indonesia (misalnya: hierarki, komunikasi tidak langsung, pentingnya harmoni).'
    },
    points: 10,
  },

  // ─── INTEGRATED TASKS (5 soal) ─────────────────────────────────────────────
  {
    dimension: 'INTEGRATED' as Dimension,
    type: 'INTEGRATED_TASK' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'INTEGRATED TASK — Perubahan Iklim\n\nLangkah 1 - Baca artikel berikut:\n"Perubahan iklim telah menjadi ancaman terbesar bagi keberlangsungan hidup manusia di abad ke-21. Data dari BMKG menunjukkan bahwa suhu rata-rata di Indonesia telah meningkat 0.8°C dalam 30 tahun terakhir. Dampaknya sudah terasa: gagal panen di Jawa Timur meningkat 23%, permukaan air laut di pesisir utara Jakarta naik 8cm per dekade, dan frekuensi banjir di Kalimantan Selatan meningkat dua kali lipat sejak 2015. Para ahli memprediksi bahwa tanpa intervensi signifikan, Indonesia akan kehilangan 2.000 pulau kecil akibat naiknya permukaan laut pada tahun 2050."\n\nLangkah 2 - Jawab: Sebutkan 3 fakta utama dari artikel di atas.\n\nLangkah 3 - Tulis email singkat (80-100 kata) kepada teman yang menjelaskan mengapa isu perubahan iklim ini penting dan apa yang bisa dilakukan sebagai individu.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },
  {
    dimension: 'INTEGRATED' as Dimension,
    type: 'INTEGRATED_TASK' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'INTEGRATED TASK — Kesehatan Mental Remaja\n\nLangkah 1 - Baca:\n"Survei nasional 2025 menunjukkan bahwa 1 dari 4 remaja Indonesia mengalami gejala kecemasan (anxiety). Faktor utama: tekanan akademik (45%), cyberbullying (30%), dan ekspektasi media sosial (25%). Hanya 12% yang mencari bantuan profesional karena stigma dan keterbatasan akses."\n\nLangkah 2 - Jawab: Apa 3 faktor utama penyebab kecemasan pada remaja menurut data di atas?\n\nLangkah 3 - Tulis pesan singkat (50-80 kata) untuk diposting di media sosial yang mengajak remaja untuk tidak malu mencari bantuan kesehatan mental.'
    },
    rubric: { taskCompletion: 30, coherence: 30, lexicalRange: 20, grammarAccuracy: 20 },
    points: 10,
  },
  {
    dimension: 'INTEGRATED' as Dimension,
    type: 'INTEGRATED_TASK' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'INTEGRATED TASK — Ekonomi Digital Indonesia\n\nLangkah 1 - Baca:\n"Nilai ekonomi digital Indonesia diproyeksikan mencapai USD 130 miliar pada 2025, menjadikannya yang terbesar di Asia Tenggara. E-commerce menyumbang 60% dari total tersebut, diikuti fintech (20%) dan edtech (10%). Namun, tantangan utama meliputi: kesenjangan digital (hanya 54% populasi memiliki akses internet stabil), literasi digital yang rendah, dan regulasi yang belum mengikuti kecepatan inovasi."\n\nLangkah 2 - Analisis: Identifikasi 2 peluang dan 2 tantangan ekonomi digital Indonesia berdasarkan artikel.\n\nLangkah 3 - Tulis paragraf opini (100-120 kata) tentang apa yang harus dilakukan pemerintah untuk memaksimalkan potensi ekonomi digital.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },
  {
    dimension: 'INTEGRATED' as Dimension,
    type: 'INTEGRATED_TASK' as QuestionType,
    level: 'B1' as CEFRLevel,
    content: {
      prompt: 'INTEGRATED TASK — Pariwisata Berkelanjutan\n\nLangkah 1 - Baca:\n"Bali menerima 6.3 juta wisatawan pada 2024, menghasilkan pendapatan USD 15 miliar. Namun, overtourism menyebabkan: sampah plastik meningkat 40%, krisis air bersih di beberapa desa, dan kerusakan terumbu karang 30% dalam 10 tahun. Pemerintah kini mendorong konsep pariwisata berkelanjutan dengan membatasi jumlah pengunjung dan mempromosikan destinasi alternatif seperti Labuan Bajo dan Danau Toba."\n\nLangkah 2 - Jawab: Apa dampak negatif overtourism di Bali menurut artikel?\n\nLangkah 3 - Tulis brosur singkat (80-100 kata) yang mempromosikan pariwisata bertanggung jawab kepada wisatawan.'
    },
    rubric: { taskCompletion: 30, coherence: 25, lexicalRange: 25, grammarAccuracy: 20 },
    points: 10,
  },
  {
    dimension: 'INTEGRATED' as Dimension,
    type: 'INTEGRATED_TASK' as QuestionType,
    level: 'B2' as CEFRLevel,
    content: {
      prompt: 'INTEGRATED TASK — Pendidikan Vokasi\n\nLangkah 1 - Baca:\n"Pemerintah Indonesia menargetkan 50% lulusan SMA/SMK melanjutkan ke pendidikan vokasi pada 2030. Saat ini, angka pengangguran lulusan universitas (7.5%) lebih tinggi daripada lulusan vokasi (4.2%). Industri manufaktur dan teknologi melaporkan kekurangan 1.2 juta tenaga kerja terampil. Program link-and-match antara SMK dan industri telah meningkatkan tingkat penyerapan lulusan dari 65% menjadi 82%."\n\nLangkah 2 - Analisis: Mengapa pendidikan vokasi dianggap solusi untuk masalah pengangguran?\n\nLangkah 3 - Tulis surat (100-120 kata) kepada orang tua yang masih ragu tentang pendidikan vokasi, menjelaskan keuntungan dan prospeknya.'
    },
    rubric: { taskCompletion: 25, coherence: 25, lexicalRange: 25, grammarAccuracy: 25 },
    points: 10,
  },
]

async function main() {
  console.log('Seeding database...')

  for (const question of QUESTIONS) {
    await prisma.question.create({
      data: {
        dimension: question.dimension,
        type: question.type,
        level: question.level,
        content: question.content,
        rubric: (question as any).rubric || undefined,
        points: question.points,
      },
    })
  }

  console.log(`Seeded ${QUESTIONS.length} questions successfully!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
