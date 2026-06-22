import { PrismaClient, CEFRLevel, Dimension } from '@prisma/client'

const prisma = new PrismaClient()

interface CanDoData {
  level: CEFRLevel
  skill: Dimension
  category: string
  descriptor: string
}

const canDoDescriptors: CanDoData[] = [
  // A1 - Pemula
  // LISTENING
  { level: 'A1', skill: 'LISTENING', category: 'Understanding', descriptor: 'Dapat memahami kata-kata dan ungkapan sangat dasar yang berkaitan dengan diri sendiri, keluarga, dan lingkungan terdekat ketika diucapkan perlahan dan jelas' },
  { level: 'A1', skill: 'LISTENING', category: 'Interaction', descriptor: 'Dapat memahami pertanyaan sederhana dan instruksi singkat dalam konteks familiar' },
  { level: 'A1', skill: 'LISTENING', category: 'Comprehension', descriptor: 'Dapat mengenali nama, kata, dan frasa sangat dasar yang digunakan dalam situasi sehari-hari' },

  // READING
  { level: 'A1', skill: 'READING', category: 'Understanding', descriptor: 'Dapat memahami nama, kata, dan kalimat sangat sederhana pada poster, iklan, atau katalog' },
  { level: 'A1', skill: 'READING', category: 'Comprehension', descriptor: 'Dapat mengenali kata-kata familiar dan frasa sangat dasar yang berkaitan dengan diri sendiri, keluarga, atau lingkungan terdekat' },

  // SPEAKING
  { level: 'A1', skill: 'SPEAKING', category: 'Production', descriptor: 'Dapat menggunakan ungkapan sederhana untuk mendeskripsikan di mana tinggal dan orang yang dikenal' },
  { level: 'A1', skill: 'SPEAKING', category: 'Interaction', descriptor: 'Dapat berinteraksi dengan cara sederhana jika lawan bicara bersedia mengulangi atau memparafrase dengan lebih lambat' },
  { level: 'A1', skill: 'SPEAKING', category: 'Fluency', descriptor: 'Dapat mengajukan dan menjawab pertanyaan sederhana dalam area kebutuhan langsung atau topik sangat familiar' },

  // WRITING
  { level: 'A1', skill: 'WRITING', category: 'Production', descriptor: 'Dapat menulis kartu pos singkat dan sederhana, misalnya ucapan liburan' },
  { level: 'A1', skill: 'WRITING', category: 'Interaction', descriptor: 'Dapat mengisi formulir dengan detail pribadi, misalnya nama, kebangsaan, dan alamat' },

  // MEDIATION
  { level: 'A1', skill: 'MEDIATION', category: 'Facilitating', descriptor: 'Dapat menyampaikan pesan sangat sederhana antara dua pihak dalam konteks terbatas' },
  { level: 'A1', skill: 'MEDIATION', category: 'Processing', descriptor: 'Dapat mengenali kata-kata kunci dalam teks sangat sederhana dan menyampaikannya kepada orang lain' },

  // INTEGRATED
  { level: 'A1', skill: 'INTEGRATED', category: 'Combined Skills', descriptor: 'Dapat menggabungkan keterampilan membaca dan menulis untuk tugas sangat sederhana seperti mengisi formulir berdasarkan instruksi tertulis' },

  // A2 - Dasar
  // LISTENING
  { level: 'A2', skill: 'LISTENING', category: 'Understanding', descriptor: 'Dapat memahami frasa dan kosakata yang paling sering digunakan terkait area kepentingan langsung (misalnya informasi pribadi, keluarga, belanja, geografi lokal, pekerjaan)' },
  { level: 'A2', skill: 'LISTENING', category: 'Interaction', descriptor: 'Dapat menangkap poin utama dalam pesan dan pengumuman singkat dan jelas' },
  { level: 'A2', skill: 'LISTENING', category: 'Comprehension', descriptor: 'Dapat memahami instruksi sederhana yang diberikan secara langsung dalam konteks familiar' },

  // READING
  { level: 'A2', skill: 'READING', category: 'Understanding', descriptor: 'Dapat membaca teks sangat pendek dan sederhana serta menemukan informasi spesifik yang dapat diprediksi dalam materi sehari-hari' },
  { level: 'A2', skill: 'READING', category: 'Comprehension', descriptor: 'Dapat memahami surat pribadi singkat dan sederhana' },
  { level: 'A2', skill: 'READING', category: 'Critical Reading', descriptor: 'Dapat mengenali poin utama dalam teks informatif pendek' },

  // SPEAKING
  { level: 'A2', skill: 'SPEAKING', category: 'Production', descriptor: 'Dapat menggunakan serangkaian frasa untuk mendeskripsikan dengan cara sederhana keluarga, kondisi kehidupan, latar belakang pendidikan, dan pekerjaan' },
  { level: 'A2', skill: 'SPEAKING', category: 'Interaction', descriptor: 'Dapat berkomunikasi dalam tugas sederhana dan rutin yang memerlukan pertukaran informasi sederhana dan langsung' },
  { level: 'A2', skill: 'SPEAKING', category: 'Fluency', descriptor: 'Dapat menangani pertukaran sosial yang sangat pendek meskipun biasanya tidak dapat memahami cukup untuk menjaga percakapan tetap berjalan' },

  // WRITING
  { level: 'A2', skill: 'WRITING', category: 'Production', descriptor: 'Dapat menulis serangkaian frasa dan kalimat sederhana yang dihubungkan dengan konektor sederhana seperti "dan", "tetapi", dan "karena"' },
  { level: 'A2', skill: 'WRITING', category: 'Interaction', descriptor: 'Dapat menulis catatan dan surat pribadi singkat dan sederhana' },

  // MEDIATION
  { level: 'A2', skill: 'MEDIATION', category: 'Facilitating', descriptor: 'Dapat menyampaikan informasi sederhana antara dua pihak dalam situasi sehari-hari' },
  { level: 'A2', skill: 'MEDIATION', category: 'Processing', descriptor: 'Dapat meringkas poin utama dari teks pendek sederhana untuk orang lain' },

  // INTEGRATED
  { level: 'A2', skill: 'INTEGRATED', category: 'Combined Skills', descriptor: 'Dapat menggabungkan mendengarkan dan berbicara untuk menyelesaikan tugas rutin seperti bertanya arah dan mengikuti petunjuk' },

  // B1 - Madya
  // LISTENING
  { level: 'B1', skill: 'LISTENING', category: 'Understanding', descriptor: 'Dapat memahami poin utama dari ucapan standar yang jelas tentang hal-hal familiar yang biasa ditemui dalam pekerjaan, sekolah, waktu luang' },
  { level: 'B1', skill: 'LISTENING', category: 'Interaction', descriptor: 'Dapat memahami poin utama dari program radio atau TV tentang isu terkini atau topik kepentingan pribadi/profesional ketika penyampaian relatif lambat dan jelas' },
  { level: 'B1', skill: 'LISTENING', category: 'Comprehension', descriptor: 'Dapat mengikuti kuliah atau presentasi singkat jika topik familiar dan penyampaian jelas' },

  // READING
  { level: 'B1', skill: 'READING', category: 'Understanding', descriptor: 'Dapat memahami teks yang terdiri terutama dari bahasa frekuensi tinggi atau terkait pekerjaan' },
  { level: 'B1', skill: 'READING', category: 'Comprehension', descriptor: 'Dapat memahami deskripsi peristiwa, perasaan, dan harapan dalam surat pribadi' },
  { level: 'B1', skill: 'READING', category: 'Critical Reading', descriptor: 'Dapat mengenali poin penting dalam artikel surat kabar pendek dan sederhana' },

  // SPEAKING
  { level: 'B1', skill: 'SPEAKING', category: 'Production', descriptor: 'Dapat menghubungkan frasa dengan cara sederhana untuk mendeskripsikan pengalaman dan peristiwa, impian, harapan, dan ambisi' },
  { level: 'B1', skill: 'SPEAKING', category: 'Interaction', descriptor: 'Dapat menangani sebagian besar situasi yang mungkin ditemui saat bepergian di area di mana bahasa tersebut digunakan' },
  { level: 'B1', skill: 'SPEAKING', category: 'Fluency', descriptor: 'Dapat memasuki percakapan tanpa persiapan tentang topik familiar, kepentingan pribadi, atau topik yang relevan dengan kehidupan sehari-hari' },

  // WRITING
  { level: 'B1', skill: 'WRITING', category: 'Production', descriptor: 'Dapat menulis teks terhubung sederhana tentang topik yang familiar atau kepentingan pribadi' },
  { level: 'B1', skill: 'WRITING', category: 'Interaction', descriptor: 'Dapat menulis surat pribadi yang mendeskripsikan pengalaman dan kesan' },
  { level: 'B1', skill: 'WRITING', category: 'Argumentation', descriptor: 'Dapat menulis esai atau laporan singkat yang menyampaikan informasi atau memberikan alasan yang mendukung atau menentang sudut pandang tertentu' },

  // MEDIATION
  { level: 'B1', skill: 'MEDIATION', category: 'Facilitating', descriptor: 'Dapat menjelaskan poin utama dari teks atau presentasi kepada orang lain dengan cara sederhana' },
  { level: 'B1', skill: 'MEDIATION', category: 'Processing', descriptor: 'Dapat meringkas informasi dari beberapa sumber untuk tujuan praktis' },
  { level: 'B1', skill: 'MEDIATION', category: 'Cultural Mediation', descriptor: 'Dapat menjelaskan perbedaan budaya sederhana dan memberikan konteks dasar' },

  // INTEGRATED
  { level: 'B1', skill: 'INTEGRATED', category: 'Combined Skills', descriptor: 'Dapat menggabungkan membaca, mendengarkan, dan berbicara untuk berpartisipasi dalam diskusi tentang topik familiar' },

  // B2 - Madya Atas
  // LISTENING
  { level: 'B2', skill: 'LISTENING', category: 'Understanding', descriptor: 'Dapat memahami kuliah dan presentasi panjang serta mengikuti argumen yang kompleks selama topik relatif familiar' },
  { level: 'B2', skill: 'LISTENING', category: 'Interaction', descriptor: 'Dapat memahami sebagian besar program TV dan film dalam bahasa standar' },
  { level: 'B2', skill: 'LISTENING', category: 'Comprehension', descriptor: 'Dapat memahami pengumuman dan pesan yang kompleks tentang topik abstrak dan konkret' },

  // READING
  { level: 'B2', skill: 'READING', category: 'Understanding', descriptor: 'Dapat membaca artikel dan laporan tentang masalah kontemporer di mana penulis mengambil sikap atau sudut pandang tertentu' },
  { level: 'B2', skill: 'READING', category: 'Comprehension', descriptor: 'Dapat memahami teks sastra kontemporer' },
  { level: 'B2', skill: 'READING', category: 'Critical Reading', descriptor: 'Dapat mengevaluasi argumen dan bukti dalam teks dan mengenali bias atau asumsi' },

  // SPEAKING
  { level: 'B2', skill: 'SPEAKING', category: 'Production', descriptor: 'Dapat memberikan deskripsi dan presentasi yang jelas dan terperinci tentang berbagai subjek yang terkait dengan bidang minat' },
  { level: 'B2', skill: 'SPEAKING', category: 'Interaction', descriptor: 'Dapat berinteraksi dengan tingkat kelancaran dan spontanitas yang memungkinkan interaksi reguler dengan penutur asli tanpa ketegangan bagi kedua belah pihak' },
  { level: 'B2', skill: 'SPEAKING', category: 'Fluency', descriptor: 'Dapat berpartisipasi aktif dalam diskusi dalam konteks familiar, memberikan dan mempertahankan pandangan dengan jelas' },

  // WRITING
  { level: 'B2', skill: 'WRITING', category: 'Production', descriptor: 'Dapat menulis teks yang jelas dan terperinci tentang berbagai subjek yang terkait dengan minat' },
  { level: 'B2', skill: 'WRITING', category: 'Interaction', descriptor: 'Dapat menulis surat yang mengungkapkan berbagai emosi dan menyoroti signifikansi pribadi dari peristiwa dan pengalaman' },
  { level: 'B2', skill: 'WRITING', category: 'Argumentation', descriptor: 'Dapat menulis esai atau laporan yang mengembangkan argumen secara sistematis dan memberikan alasan yang mendukung atau menentang sudut pandang tertentu' },

  // MEDIATION
  { level: 'B2', skill: 'MEDIATION', category: 'Facilitating', descriptor: 'Dapat memfasilitasi komunikasi antara pihak-pihak dengan latar belakang berbeda dan membantu mencapai pemahaman bersama' },
  { level: 'B2', skill: 'MEDIATION', category: 'Processing', descriptor: 'Dapat mensintesis informasi dari beberapa sumber dan menyajikannya dengan cara yang koheren' },
  { level: 'B2', skill: 'MEDIATION', category: 'Cultural Mediation', descriptor: 'Dapat menjelaskan nuansa budaya dan memberikan konteks yang lebih mendalam' },

  // INTEGRATED
  { level: 'B2', skill: 'INTEGRATED', category: 'Combined Skills', descriptor: 'Dapat menggabungkan beberapa keterampilan untuk menyelesaikan tugas kompleks seperti menulis laporan berdasarkan penelitian dan presentasi' },

  // C1 - Mahir
  // LISTENING
  { level: 'C1', skill: 'LISTENING', category: 'Understanding', descriptor: 'Dapat memahami bahasa lisan yang panjang bahkan ketika tidak terstruktur dengan jelas dan ketika hubungan hanya tersirat' },
  { level: 'C1', skill: 'LISTENING', category: 'Interaction', descriptor: 'Dapat memahami program televisi dan film tanpa terlalu banyak usaha' },
  { level: 'C1', skill: 'LISTENING', category: 'Comprehension', descriptor: 'Dapat memahami kuliah khusus dan presentasi teknis dengan tingkat detail yang tinggi' },

  // READING
  { level: 'C1', skill: 'READING', category: 'Understanding', descriptor: 'Dapat memahami teks faktual dan sastra yang panjang dan kompleks, menghargai perbedaan gaya' },
  { level: 'C1', skill: 'READING', category: 'Comprehension', descriptor: 'Dapat memahami artikel khusus dan instruksi teknis yang panjang bahkan ketika tidak terkait dengan bidang sendiri' },
  { level: 'C1', skill: 'READING', category: 'Critical Reading', descriptor: 'Dapat menganalisis dan mengevaluasi argumen dalam teks akademis dan profesional' },

  // SPEAKING
  { level: 'C1', skill: 'SPEAKING', category: 'Production', descriptor: 'Dapat menyajikan deskripsi atau argumen yang jelas dan terstruktur dengan gaya yang sesuai dengan konteks dan dengan struktur logis yang efektif' },
  { level: 'C1', skill: 'SPEAKING', category: 'Interaction', descriptor: 'Dapat mengekspresikan diri dengan lancar dan spontan, hampir tanpa usaha. Dapat menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial dan profesional' },
  { level: 'C1', skill: 'SPEAKING', category: 'Fluency', descriptor: 'Dapat merumuskan ide dan pendapat dengan presisi dan menghubungkan kontribusi dengan mahir dengan kontribusi pembicara lain' },

  // WRITING
  { level: 'C1', skill: 'WRITING', category: 'Production', descriptor: 'Dapat mengekspresikan diri dengan jelas dan terstruktur, mengekspresikan poin pandang dengan panjang' },
  { level: 'C1', skill: 'WRITING', category: 'Interaction', descriptor: 'Dapat menulis tentang topik kompleks dalam surat, esai, atau laporan, menyoroti apa yang dianggap sebagai poin penting' },
  { level: 'C1', skill: 'WRITING', category: 'Argumentation', descriptor: 'Dapat menulis argumen yang persuasif dan terstruktur dengan baik dengan bukti yang kuat dan gaya yang sesuai' },

  // MEDIATION
  { level: 'C1', skill: 'MEDIATION', category: 'Facilitating', descriptor: 'Dapat memediasi antara pihak-pihak dengan pandangan yang berbeda dan membantu mencapai konsensus' },
  { level: 'C1', skill: 'MEDIATION', category: 'Processing', descriptor: 'Dapat mensintesis dan mengevaluasi informasi dari berbagai sumber dan menyajikannya dengan cara yang kritis' },
  { level: 'C1', skill: 'MEDIATION', category: 'Cultural Mediation', descriptor: 'Dapat menjelaskan nuansa budaya yang kompleks dan memfasilitasi pemahaman lintas budaya' },

  // INTEGRATED
  { level: 'C1', skill: 'INTEGRATED', category: 'Combined Skills', descriptor: 'Dapat menggabungkan beberapa keterampilan untuk menghasilkan output yang koheren dan sophisticated dalam konteks akademis dan profesional' },

  // C2 - Sangat Mahir
  // LISTENING
  { level: 'C2', skill: 'LISTENING', category: 'Understanding', descriptor: 'Dapat memahami dengan mudah hampir semua yang didengar, termasuk bahasa lisan yang kompleks dan abstrak' },
  { level: 'C2', skill: 'LISTENING', category: 'Interaction', descriptor: 'Dapat mengikuti percakapan cepat antara penutur asli tanpa kesulitan' },
  { level: 'C2', skill: 'LISTENING', category: 'Comprehension', descriptor: 'Dapat memahami semua jenis bahasa lisan, baik langsung maupun disiarkan, bahkan ketika delivery cepat atau ada noise latar belakang' },

  // READING
  { level: 'C2', skill: 'READING', category: 'Understanding', descriptor: 'Dapat membaca dengan mudah hampir semua bentuk bahasa tertulis, termasuk teks abstrak, struktural kompleks, atau sangat kolokial' },
  { level: 'C2', skill: 'READING', category: 'Comprehension', descriptor: 'Dapat memahami teks sastra dan non-fiksi yang panjang dan kompleks, menghargai perbedaan gaya halus' },
  { level: 'C2', skill: 'READING', category: 'Critical Reading', descriptor: 'Dapat menganalisis dan mengevaluasi teks secara kritis, mengenali implikasi dan asumsi tersembunyi' },

  // SPEAKING
  { level: 'C2', skill: 'SPEAKING', category: 'Production', descriptor: 'Dapat menyajikan argumen atau deskripsi yang jelas, lancar, dan terstruktur dengan gaya yang sesuai dengan konteks dan dengan struktur logis yang efektif yang membantu penerima untuk memperhatikan dan mengingat poin penting' },
  { level: 'C2', skill: 'SPEAKING', category: 'Interaction', descriptor: 'Dapat berpartisipasi dengan mudah dalam semua percakapan dan diskusi dengan penutur asli dan juga sangat sadar akan ekspresi idiomatik dan kolokial' },
  { level: 'C2', skill: 'SPEAKING', category: 'Fluency', descriptor: 'Dapat mengekspresikan diri dengan lancar dan spontan, hampir tanpa usaha. Dapat menyampaikan nuansa makna dengan presisi' },

  // WRITING
  { level: 'C2', skill: 'WRITING', category: 'Production', descriptor: 'Dapat menulis teks yang jelas, lancar, dan bergaya canggih dalam gaya yang sesuai' },
  { level: 'C2', skill: 'WRITING', category: 'Interaction', descriptor: 'Dapat menulis surat, laporan, atau artikel yang kompleks dengan struktur yang efektif dan gaya yang sesuai' },
  { level: 'C2', skill: 'WRITING', category: 'Argumentation', descriptor: 'Dapat menulis argumen yang sangat persuasif dan sophisticated dengan bukti yang kuat dan gaya yang sangat efektif' },

  // MEDIATION
  { level: 'C2', skill: 'MEDIATION', category: 'Facilitating', descriptor: 'Dapat memediasi dalam situasi yang sangat kompleks dan sensitif, membantu mencapai pemahaman yang mendalam dan konsensus' },
  { level: 'C2', skill: 'MEDIATION', category: 'Processing', descriptor: 'Dapat mensintesis dan mengevaluasi informasi dari berbagai sumber yang kompleks dan menyajikannya dengan cara yang sangat kritis dan sophisticated' },
  { level: 'C2', skill: 'MEDIATION', category: 'Cultural Mediation', descriptor: 'Dapat memfasilitasi pemahaman lintas budaya yang mendalam dan menjelaskan nuansa budaya yang sangat halus' },

  // INTEGRATED
  { level: 'C2', skill: 'INTEGRATED', category: 'Combined Skills', descriptor: 'Dapat menggabungkan semua keterampilan dengan mahir untuk menghasilkan output yang sangat sophisticated dalam konteks akademis, profesional, dan kreatif' },
]

async function main() {
  console.log('Seeding can-do descriptors...')

  for (const descriptor of canDoDescriptors) {
    await prisma.canDoDescriptor.create({
      data: descriptor,
    })
  }

  console.log(`Seeded ${canDoDescriptors.length} can-do descriptors successfully!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
