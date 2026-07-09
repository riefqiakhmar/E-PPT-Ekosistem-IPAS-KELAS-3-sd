import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion } from './types';
import GardenObservation from './components/GardenObservation';
import GameBiotikAbiotik from './components/GameBiotikAbiotik';
import { 
  playClickSound, 
  playCorrectSound, 
  playIncorrectSound, 
  playVictorySound 
} from './utils/audio';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Award, 
  PenTool, 
  Youtube, 
  Eye, 
  HelpCircle, 
  Trophy, 
  Compass, 
  Heart, 
  Check, 
  CheckSquare, 
  Square, 
  Home,
  MousePointer,
  GraduationCap,
  Info,
  X,
  Tv,
  Printer,
  Undo,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Quiz Questions definition (Slides 11-14)
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Ekosistem adalah ....",
    options: [
      "A. Kumpulan kendaraan bermotor di jalan raya",
      "B. Hubungan timbal balik antara makhluk hidup dan lingkungannya",
      "C. Kumpulan rumah-rumah di pedesaan",
      "D. Tempat bermain anak-anak di taman sekolah"
    ],
    answer: "B",
    explanation: "Ekosistem adalah hubungan saling mempengaruhi antara makhluk hidup (biotik) dengan lingkungan di sekitarnya (abiotik)."
  },
  {
    id: 2,
    question: "Yang termasuk ke dalam komponen biotik (makhluk hidup) adalah ....",
    options: [
      "A. Air mengalir",
      "B. Tanah subur",
      "C. Pohon mangga",
      "D. Batu sungai"
    ],
    answer: "C",
    explanation: "Pohon mangga adalah tumbuhan, yang merupakan makhluk hidup (biotik) karena bernapas, tumbuh, dan berkembang biak."
  },
  {
    id: 3,
    question: "Yang termasuk ke dalam komponen abiotik (benda tak hidup) adalah ....",
    options: [
      "A. Ayam peliharaan",
      "B. Pohon kelapa",
      "C. Kucing anggora",
      "D. Air minum"
    ],
    answer: "D",
    explanation: "Air adalah benda tak hidup (abiotik) yang sangat penting bagi kehidupan makhluk hidup."
  },
  {
    id: 4,
    question: "Cahaya matahari sangat berguna untuk ....",
    options: [
      "A. Membantu tumbuhan membuat makanan (fotosintesis)",
      "B. Membantu menumpuk sampah",
      "C. Mengotori udara di sekitar",
      "D. Merusak tanaman padi"
    ],
    answer: "A",
    explanation: "Cahaya matahari memberikan energi bagi tumbuhan hijau untuk melakukan fotosintesis agar dapat tumbuh subur."
  }
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ignorePortraitWarning, setIgnorePortraitWarning] = useState(false);
  
  // Interactive tools
  const [laserActive, setLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [penActive, setPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [penWidth, setPenWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Quiz states
  const [quizScores, setQuizScores] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizFeedback, setQuizFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    questionId: number;
    chosen: string;
  } | null>(null);

  // Auto slideshow state
  const [autoPlay, setAutoPlay] = useState(false);
  
  // Custom interactive data
  const [studentName, setStudentName] = useState('');
  const [certAwarded, setCertAwarded] = useState(false);
  
  // Slide 3: Apersepsi interactive cards clicked
  const [apersepsiRevealed, setApersepsiRevealed] = useState<string[]>([]);
  
  // Slide 4: Ecosystem examples clicked
  const [activeEcosystemDetail, setActiveEcosystemDetail] = useState<string | null>(null);
  
  // Slide 6: Biotik characteristics clicked
  const [activeBiotikCharacteristic, setActiveBiotikCharacteristic] = useState<string | null>(null);

  // Slide 16: Sikap Menjaga Ekosistem checkboxes
  const [sikapSatu, setSikapSatu] = useState(false); // Menanam pohon
  const [sikapDua, setSikapDua] = useState(false); // Membuang sampah
  const [sikapTiga, setSikapTiga] = useState(false); // Menghemat air
  const [sikapEmpat, setSikapEmpat] = useState(false); // Merawat tanaman

  // Slide 17: Refleksi checklist
  const [refleksiChecked, setRefleksiChecked] = useState<Record<string, boolean>>({
    pengertian: false,
    biotik: false,
    abiotik: false,
    menjaga: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  // Sound triggers
  const triggerSound = (type: 'click' | 'correct' | 'incorrect' | 'victory') => {
    if (!soundEnabled) return;
    if (type === 'click') playClickSound();
    if (type === 'correct') playCorrectSound();
    if (type === 'incorrect') playIncorrectSound();
    if (type === 'victory') playVictorySound();
  };

  // Canvas drawing handlers
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [penActive, currentSlide]); // Redraw when slide changes or pen toggled

  const clearCanvas = () => {
    triggerSound('click');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!penActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !penActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Laser position tracking
  const handleMouseMoveOnSlide = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!laserActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Auto play effect
  useEffect(() => {
    let timer: any;
    if (autoPlay) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev < SLIDES.length - 1) return prev + 1;
          setAutoPlay(false);
          return prev;
        });
      }, 7000); // 7 seconds per slide
    }
    return () => clearInterval(timer);
  }, [autoPlay]);

  // Navigate slides helper
  const goToSlide = (index: number) => {
    triggerSound('click');
    setPenActive(false); // turn off pen
    setLaserActive(false); // turn off laser
    setQuizFeedback(null); // clear feedback
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const handleRestart = () => {
    // Reset all interactive states
    setQuizScores({});
    setSelectedAnswers({});
    setQuizFeedback(null);
    setApersepsiRevealed([]);
    setActiveEcosystemDetail(null);
    setActiveBiotikCharacteristic(null);
    setSikapSatu(false);
    setSikapDua(false);
    setSikapTiga(false);
    setSikapEmpat(false);
    setRefleksiChecked({
      pengertian: false,
      biotik: false,
      abiotik: false,
      menjaga: false
    });
    setStudentName('');
    setCertAwarded(false);
    goToSlide(0);
  };

  // Quiz Answer selected handler
  const handleSelectQuizAnswer = (qId: number, optionLetter: string, correctLetter: string) => {
    const isCorrect = optionLetter === correctLetter;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
    setQuizScores((prev) => ({ ...prev, [qId]: isCorrect }));

    if (isCorrect) {
      triggerSound('correct');
    } else {
      triggerSound('incorrect');
    }

    setQuizFeedback({
      show: true,
      isCorrect,
      questionId: qId,
      chosen: optionLetter
    });
  };

  // Slides configuration data
  const SLIDES = [
    { id: 1, title: 'Sampul Depan', icon: '🏠', notes: 'Buka presentasi dengan suara ceria. Sambut siswa kelas 3 SD dan tanyakan apa mereka sudah siap bertualang di taman sekitar sekolah hari ini.' },
    { id: 2, title: 'Tujuan Pembelajaran', icon: '🎯', notes: 'Bacakan 4 misi utama belajar hari ini agar siswa merasa tertantang dan termotivasi untuk menguasai materi ekosistem.' },
    { id: 3, title: 'Apersepsi Mandiri', icon: '🌱', notes: 'Gunakan tombol interaktif di slide ini untuk mengajak siswa merenungkan benda apa saja yang pernah mereka lihat di lingkungan sekitar.' },
    { id: 4, title: 'Apa Itu Ekosistem?', icon: '🤔', notes: 'Terangkan definisi ekosistem secara sederhana. Klik jenis-jenis ekosistem di bawah untuk menampilkan gambar sawah, sungai, kebun, atau hutan.' },
    { id: 5, title: 'Komponen Ekosistem', icon: '📊', notes: 'Bagi ekosistem menjadi dua keluarga besar: Biotik (hidup) dan Abiotik (tak hidup). Tekan tombol Biotik/Abiotik untuk beralih penjelasan visual.' },
    { id: 6, title: 'Komponen Biotik', icon: '🦁', notes: 'Tunjukkan makhluk hidup di sekitar kita. Klik ikon ciri-ciri makhluk hidup untuk melatih siswa kelas 3 mengingat bernapas, bergerak, tumbuh, dan berbiak.' },
    { id: 7, title: 'Komponen Abiotik', icon: '☀️', notes: 'Jelaskan benda mati pendukung kehidupan. Tekan tiap ikon untuk melihat kontribusinya bagi makhluk biotik bertahan hidup.' },
    { id: 8, title: 'Hubungan Rantai Makanan', icon: '🔄', notes: 'Tekan tombol "Mulai Rantai Makanan" untuk memperlihatkan animasi aliran energi dari rumput ke kambing hingga dimanfaatkan manusia.' },
    { id: 9, title: 'Video Pembelajaran', icon: '🎥', notes: 'Putar video pembelajaran ekosistem interaktif ini. Minta siswa menyimak baik-baik untuk persiapan kuis sesudahnya.' },
    { id: 10, title: 'Ayo Mengamati!', icon: '🔎', notes: 'Minta siswa mencari dan mengeklik benda-benda biotik dan abiotik di ilustrasi taman sekolah ini secara lisan/bersama.' },
    { id: 11, title: 'Kuis 1: Pengertian', icon: '📝', notes: 'Pertanyaan pertama menguji definisi dasar ekosistem. Ada popup feedback interaktif jika benar/salah.' },
    { id: 12, title: 'Kuis 2: Komponen Biotik', icon: '📝', notes: 'Pertanyaan kedua tentang mengenali komponen hidup (biotik). Arahkan siswa berdiskusi sebelum menekan tombol.' },
    { id: 13, title: 'Kuis 3: Komponen Abiotik', icon: '📝', notes: 'Pertanyaan ketiga mengidentifikasi benda tak hidup (abiotik). Beri penguatan pada siswa setelah menjawab.' },
    { id: 14, title: 'Kuis 4: Fungsi Matahari', icon: '📝', notes: 'Pertanyaan keempat mengenai pentingnya energi matahari. Berikan tepuk tangan meriah setelah seluruh kuis selesai!' },
    { id: 15, title: 'Game Pengelompokan', icon: '🎮', notes: 'Game Interaktif! Beri giliran siswa maju ke depan kelas untuk memasukkan benda ke dalam keranjang Biotik & Abiotik.' },
    { id: 16, title: 'Sikap Menjaga Alam', icon: '🛡️', notes: 'Klik keempat ceklis ramah lingkungan untuk melihat perubahan luar biasa: halaman yang kotor akan berubah menjadi asri, bersih, dan berbungaan!' },
    { id: 17, title: 'Refleksi Belajar', icon: '💡', notes: 'Cek bersama siswa materi apa saja yang sudah berhasil dipahami hari ini dengan mencentang kotak refleksi.' },
    { id: 18, title: 'Kesimpulan Penting', icon: '📌', notes: 'Rangkum materi hari ini secara ringkas. Kuatkan pemahaman siswa sebelum menutup kelas.' },
    { id: 19, title: 'Penghargaan & Sertifikat', icon: '🎉', notes: 'Tulis nama siswa di sertifikat kelulusan! Berikan apresiasi berupa sertifikat bintang lima atas keberhasilan mereka.' }
  ];

  // Helper calculation for total quiz score
  const correctQuizCount = QUIZ_QUESTIONS.filter(q => quizScores[q.id] === true).length;
  const totalQuizzes = QUIZ_QUESTIONS.length;

  // Render Slide Content Switcher
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0: // Slide 1 - Sampul
        return (
          <div className="flex flex-col items-center justify-between min-h-full h-auto md:h-full p-4 md:p-6 text-center bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green relative overflow-hidden">
            {/* Sun floating in sky */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 right-4 text-5xl md:text-7xl pointer-events-none select-none animate-wiggle"
            >
              ☀️
            </motion.div>

            {/* Clouds floating */}
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 left-8 text-3xl md:text-4xl opacity-75 pointer-events-none select-none"
            >
              ☁️
            </motion.div>

            <div className="my-auto space-y-4 md:space-y-6 max-w-2xl py-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-3 py-1.5 bg-art-accent text-art-green font-black border-2 border-art-green text-[10px] md:text-sm uppercase tracking-wider rounded-xl shadow-art-handdrawn-sm"
              >
                🎒 IPAS KELAS III SD
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl md:text-5xl lg:text-6xl font-black text-art-green leading-tight tracking-tight drop-shadow-xs"
              >
                EKOSISTEM <br />
                <span className="text-art-green underline decoration-art-accent decoration-wavy">DI SEKITARKU</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-art-green/80 font-bold text-xs md:text-base max-w-md mx-auto leading-relaxed"
              >
                Mari belajar bersama mengenali hubungan seru antara makhluk hidup dan alam sekitar! 🌱🐾💧
              </motion.p>
            </div>

            {/* Animated landscape elements */}
            <div className="w-full bg-white rounded-2xl p-2 md:p-3 border-2 md:border-3 border-art-green shadow-art-handdrawn flex items-center justify-around gap-1 md:gap-2 text-3xl md:text-6xl mt-2 md:mt-4 select-none">
              <motion.span whileHover={{ scale: 1.3, rotate: 10 }} className="cursor-pointer">🐓</motion.span>
              <motion.span whileHover={{ scale: 1.3, y: -10 }} className="cursor-pointer">🌳</motion.span>
              <motion.span whileHover={{ scale: 1.3, rotate: -15 }} className="cursor-pointer">🌊</motion.span>
              <motion.span whileHover={{ scale: 1.3, rotate: 10 }} className="cursor-pointer">🌻</motion.span>
              <motion.span whileHover={{ scale: 1.3, y: -10 }} className="cursor-pointer">🦋</motion.span>
            </div>

            <button
              onClick={() => goToSlide(1)}
              className="px-6 py-2.5 md:px-8 md:py-3.5 bg-art-accent hover:bg-white text-art-green font-black text-sm md:text-lg rounded-xl md:rounded-2xl border-2 md:border-3 border-art-green shadow-art-handdrawn hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex items-center gap-2 mt-4"
            >
              🚀 MULAI BELAJAR
            </button>
          </div>
        );

      case 1: // Slide 2 - Tujuan Pembelajaran
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">🎯</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Misi Belajar Hari Ini</h2>
              </div>
              <p className="text-xs md:text-sm text-art-green/85 font-semibold">
                Setelah berpetualang di presentasi ini, kamu harus berhasil menguasai 4 misi penting berikut:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
              {[
                { num: '1', title: 'Arti Ekosistem', desc: 'Menjelaskan apa itu ekosistem dengan bahasa sederhanamu sendiri.', bg: 'bg-white', emoji: '🤔' },
                { num: '2', title: 'Dua Keluarga Besar', desc: 'Menyebutkan dan membedakan komponen Biotik & Abiotik.', bg: 'bg-white', emoji: '🦁' },
                { num: '3', title: 'Kelompok Benda', desc: 'Membedakan makhluk hidup dan benda mati di sekeliling kita.', bg: 'bg-white', emoji: '💧' },
                { num: '4', title: 'Pahlawan Lingkungan', desc: 'Membiasakan sikap peduli menjaga kebersihan ekosistem sekitar.', bg: 'bg-white', emoji: '🌱' }
              ].map((misi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-2xl border-3 border-art-green flex items-start gap-3 shadow-art-handdrawn-sm hover:shadow-art-handdrawn hover:-translate-y-1 transition-all ${misi.bg} text-art-green`}
                >
                  <span className="text-3xl p-1 bg-art-green-light rounded-xl border border-art-green shadow-inner">{misi.emoji}</span>
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-art-green text-art-cream text-[10px] font-bold">
                        {misi.num}
                      </span>
                      {misi.title}
                    </h3>
                    <p className="text-xs mt-1 text-art-green/80 leading-relaxed font-semibold">{misi.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center text-xs text-art-green font-bold bg-white/70 py-2 rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
              Ayo melangkah ke halaman berikutnya untuk memulai petualangan! 👇
            </div>
          </div>
        );

      case 2: // Slide 3 - Apersepsi
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">💭</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Ayo Mengingat Sejenak!</h2>
              </div>
              <p className="text-xs md:text-sm text-art-green/85 font-semibold leading-relaxed">
                Pernahkah kalian melihat <b>taman sekolah</b>, <b>kebun belakang rumah</b>, atau <b>sawah milik pak tani</b>?
                Di sana kalian pasti melihat benda-benda ini. <b>Klik setiap kartu</b> di bawah untuk melihat rahasianya!
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3.5 my-auto">
              {[
                { id: 'tumbuhan', name: 'Tumbuhan', emoji: '🌳', fact: 'Pohon dan rumput membuat udara sekitar menjadi sejuk dan menghasilkan makanan!' },
                { id: 'hewan', name: 'Hewan', emoji: '🐦', fact: 'Burung, serangga, dan cacing tanah meramaikan suasana dan menggemburkan tanah!' },
                { id: 'matahari', name: 'Matahari', emoji: '☀️', fact: 'Sinar matahari menghangatkan bumi dan membantu tanaman tumbuh tegak!' },
                { id: 'air', name: 'Air', emoji: '💧', fact: 'Air segar dikonsumsi semua tanaman dan hewan agar tidak kekeringan!' }
              ].map((card) => {
                const isRevealed = apersepsiRevealed.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      triggerSound('click');
                      if (!isRevealed) {
                        setApersepsiRevealed([...apersepsiRevealed, card.id]);
                        triggerSound('correct');
                      }
                    }}
                    className={`p-2 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 flex flex-col items-center justify-center text-center transition-all min-h-[110px] md:min-h-[140px] cursor-pointer
                      ${isRevealed 
                        ? 'bg-white border-art-green shadow-art-handdrawn scale-103' 
                        : 'bg-art-green-light border-art-green/40 hover:bg-white hover:border-art-green hover:shadow-art-handdrawn-sm text-art-green'
                      }
                    `}
                  >
                    <span className="text-3xl md:text-4xl mb-1 md:mb-2">{card.emoji}</span>
                    <h4 className="font-extrabold text-art-green text-xs md:text-base">{card.name}</h4>
                    
                    <div className="mt-1 md:mt-2 text-[9px] md:text-[10px] text-art-green/90 min-h-8 md:h-10 flex items-center justify-center font-bold">
                      {isRevealed ? (
                        <p className="leading-tight">{card.fact}</p>
                      ) : (
                        <span className="px-2 py-0.5 bg-art-accent text-art-green border border-art-green rounded-full font-bold">Klik!</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white p-2.5 md:p-3 rounded-xl border-2 border-art-green shadow-art-handdrawn-sm text-center text-[11px] md:text-xs text-art-green max-w-2xl mx-auto font-bold">
              💡 <b>Tahukah kamu?</b> Semua benda di atas tidak hidup sendirian. Mereka semua saling berhubungan erat membentuk sebuah kesatuan yang utuh! Itulah yang disebut <b>Ekosistem</b>.
            </div>
          </div>
        );

      case 3: // Slide 4 - Apa Itu Ekosistem?
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch flex-1">
              
              {/* Left Column: Information */}
              <div className="space-y-2 md:space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl md:text-4xl">🤔</span>
                  <h2 className="text-xl md:text-3xl font-black text-art-green">Apa Itu Ekosistem?</h2>
                </div>
                
                <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 border-art-green shadow-art-handdrawn space-y-1.5 md:space-y-2 text-art-green">
                  <p className="text-xs md:text-base leading-relaxed font-semibold">
                    <b>Ekosistem</b> adalah hubungan timbal balik yang serasi antara <span className="text-art-green font-black underline decoration-art-accent decoration-wavy">makhluk hidup</span> dengan <span className="text-blue-700 font-bold">lingkungan tak hidup</span> di sekelilingnya.
                  </p>
                  <p className="text-[10px] md:text-xs text-art-green/70 font-bold italic">
                    (Mereka berinteraksi, bekerja sama, dan saling membutuhkan untuk bertahan hidup!)
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] md:text-xs font-black text-art-green uppercase tracking-wider mb-1.5">Contoh Ekosistem di Indonesia:</h4>
                  <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                    {[
                      { id: 'sawah', name: '🌾 Sawah Pak Tani', desc: 'Ekosistem buaman manusia tempat padi ditanam, dihuni burung sawah, ular, dan kodok.' },
                      { id: 'sungai', name: '🌊 Sungai Jernih', desc: 'Ekosistem air mengalir tempat ikan berenang bebas, batu-batu kali, air segar, dan lumut.' },
                      { id: 'kebun', name: '🏡 Kebun Sekolah', desc: 'Ekosistem tanah kering berisi tanaman sayur, buah, bunga matahari, kupu-kupu, dan ulat.' },
                      { id: 'hutan', name: '🌳 Hutan Belantara', desc: 'Ekosistem alami sangat lebat dipenuhi pohon raksasa, harimau, gajah, dan mata air.' }
                    ].map((eco) => (
                      <button
                        key={eco.id}
                        onClick={() => {
                          triggerSound('click');
                          setActiveEcosystemDetail(activeEcosystemDetail === eco.id ? null : eco.id);
                        }}
                        className={`p-1.5 md:p-2 rounded-lg md:rounded-xl text-left border-2 text-[11px] md:text-xs font-bold transition-all cursor-pointer
                          ${activeEcosystemDetail === eco.id 
                            ? 'bg-art-accent border-art-green text-art-green shadow-art-handdrawn-sm' 
                            : 'bg-white border-art-green/30 hover:bg-art-green-light hover:border-art-green hover:shadow-art-handdrawn-sm text-art-green'
                          }
                        `}
                      >
                        {eco.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Illustration / Details */}
              <div className="bg-white rounded-xl md:rounded-2xl border-2 md:border-3 border-art-green p-3 md:p-4 h-full flex flex-col justify-between min-h-[140px] md:min-h-[180px] shadow-art-handdrawn relative text-art-green">
                <AnimatePresence mode="wait">
                  {activeEcosystemDetail ? (
                    <motion.div
                      key={activeEcosystemDetail}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-2 h-full flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-extrabold text-xs md:text-sm text-art-green border-b border-art-green/20 pb-1 flex justify-between items-center">
                          <span>
                            {activeEcosystemDetail === 'sawah' && '🌾 DETAIL: SAWAH'}
                            {activeEcosystemDetail === 'sungai' && '🌊 DETAIL: SUNGAI'}
                            {activeEcosystemDetail === 'kebun' && '🏡 DETAIL: KEBUN'}
                            {activeEcosystemDetail === 'hutan' && '🌳 DETAIL: HUTAN'}
                          </span>
                          <button onClick={() => { triggerSound('click'); setActiveEcosystemDetail(null); }} className="text-art-green hover:opacity-75">
                            <X className="w-4 h-4" />
                          </button>
                        </h4>
                        
                        <p className="text-[11px] md:text-xs text-art-green/85 leading-relaxed mt-1.5 font-bold">
                          {activeEcosystemDetail === 'sawah' && 'Di sawah, ada hubungan timbal balik antara tanaman padi (biotik) yang disiram air sawah (abiotik), disinari matahari, dan cacing di dalam tanah membantu akar padi bernapas.'}
                          {activeEcosystemDetail === 'sungai' && 'Air sungai yang mengalir deras membawa oksigen untuk ikan bernapas. Ikan berenang di sela batu sungai (abiotik) untuk bertelur dan berlindung.'}
                          {activeEcosystemDetail === 'kebun' && 'Tanah kebun gembur menampung pupuk (abiotik) yang diserap akar pohon buah (biotik). Lebah membantu bunga melakukan penyerbukan.'}
                          {activeEcosystemDetail === 'hutan' && 'Pohon hutan lebat menangkap air hujan di akarnya sehingga mencegah banjir. Hewan liar berlindung di sela pohon rimbun.'}
                        </p>
                      </div>

                      {/* Visual representations */}
                      <div className="bg-art-green-light p-2 rounded-xl border-2 border-art-green flex items-center justify-around text-3xl">
                        {activeEcosystemDetail === 'sawah' && (
                          <><span>🌾</span><span>🐍</span><span>🐸</span><span>☀️</span><span>💧</span></>
                        )}
                        {activeEcosystemDetail === 'sungai' && (
                          <><span>🐟</span><span>💧</span><span>🪨</span><span>🦐</span><span>🌿</span></>
                        )}
                        {activeEcosystemDetail === 'kebun' && (
                          <><span>🌻</span><span>🦋</span><span>🐛</span><span>🌱</span><span>🍎</span></>
                        )}
                        {activeEcosystemDetail === 'hutan' && (
                          <><span>🐅</span><span>🐘</span><span>🌳</span><span>🏔️</span><span>🌦️</span></>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center p-2">
                      {/* Default Sawah Illustration representation */}
                      <div className="text-4xl md:text-5xl mb-1.5 animate-bounce">🌾🏞️</div>
                      <h4 className="font-extrabold text-xs md:text-sm text-art-green">Ilustrasi Ekosistem Sawah</h4>
                      <p className="text-[10px] text-art-green/75 max-w-xs mt-1 font-bold">
                        Padi subur membutuhkan tanah basah berlumpur, air mengalir, dan sinar matahari cerah. Klik tombol-tombol di samping untuk melihat ilustrasi ekosistem lainnya!
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        );

      case 4: // Slide 5 - Komponen Ekosistem
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">📊</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Komponen Utama Ekosistem</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Ekosistem diatur oleh dua keluarga besar komponen yang bekerja sama siang dan malam:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5 my-auto">
              
              {/* Biotik Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border-2 md:border-3 border-art-green rounded-xl md:rounded-2xl p-3 md:p-4 shadow-art-handdrawn relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-art-green text-art-cream font-bold text-[9px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-bl-xl border-l border-b border-art-green uppercase">
                  Biotik
                </div>
                <h3 className="text-sm md:text-lg font-black text-art-green flex items-center gap-1.5 mb-1.5">
                  <span>🟢</span> Makhluk Hidup (Biotik)
                </h3>
                <p className="text-[11px] md:text-xs text-art-green/80 mb-2 md:mb-3 leading-relaxed font-semibold">
                  Biotik berasal dari kata "Bio" yang artinya <b>hidup</b>. Semua anggota keluarga ini bernapas, makan, tumbuh, dan beranak pinak!
                </p>
                <div className="bg-art-green-light p-2 rounded-xl border-2 border-art-green flex items-center justify-around gap-1.5 md:gap-2 text-2xl md:text-3xl">
                  <span title="Manusia">👧</span>
                  <span title="Hewan">🦁</span>
                  <span title="Tumbuhan">🌳</span>
                  <span title="Burung">🐦</span>
                  <span title="Kupu-kupu">🦋</span>
                </div>
              </motion.div>

              {/* Abiotik Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border-2 md:border-3 border-art-green rounded-xl md:rounded-2xl p-3 md:p-4 shadow-art-handdrawn relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold text-[9px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-bl-xl border-l border-b border-art-green uppercase">
                  Abiotik
                </div>
                <h3 className="text-sm md:text-lg font-black text-blue-800 flex items-center gap-1.5 mb-1.5">
                  <span>🔵</span> Benda Tak Hidup (Abiotik)
                </h3>
                <p className="text-[11px] md:text-xs text-art-green/80 mb-2 md:mb-3 leading-relaxed font-semibold">
                  Abiotik berasal dari kata "A" (tidak) dan "Bio" (hidup). Benda-benda kokoh tak bernapas, tapi mutlak dibutuhkan biotik untuk bertahan hidup!
                </p>
                <div className="bg-blue-50 p-2 rounded-xl border-2 border-art-green flex items-center justify-around gap-1.5 md:gap-2 text-2xl md:text-3xl">
                  <span title="Air">💧</span>
                  <span title="Tanah">🌱</span>
                  <span title="Udara/Angin">🌬️</span>
                  <span title="Matahari">☀️</span>
                  <span title="Batu">🪨</span>
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 5: // Slide 6 - Komponen Biotik
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">🟢</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Mengenal Komponen Biotik</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Semua yang tergolong makhluk hidup di sekeliling kita. Contohnya: <b>Pohon 🌳</b>, <b>Ayam 🐔</b>, <b>Sapi 🐄</b>, dan <b>Manusia 👧</b>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 my-auto items-center">
              
              {/* Left: Interactive list of characteristics */}
              <div className="md:col-span-7 space-y-2 md:space-y-2.5">
                <h4 className="text-[10px] md:text-xs font-black text-art-green uppercase tracking-wider mb-1">
                  🔍 Apa saja Ciri-Ciri Makhluk Hidup? (Klik untuk melihat!)
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'napas', name: '💨 1. Bernapas', desc: 'Menghirup udara segar (oksigen) dan membuang karbondioksida.' },
                    { id: 'tumbuh', name: '📈 2. Tumbuh', desc: 'Dari bayi/biji kecil menjadi besar, tinggi, dan kokoh berkembang.' },
                    { id: 'gerak', name: '🏃 3. Bergerak', desc: 'Bisa berpindah tempat: berlari, terbang, berenang, atau condong ke matahari.' },
                    { id: 'biak', name: '🐣 4. Berkembang Biak', desc: 'Bertelur, melahirkan, atau berbuah agar keturunannya tidak punah!' }
                  ].map((ciri) => (
                    <button
                      key={ciri.id}
                      onClick={() => {
                        triggerSound('click');
                        setActiveBiotikCharacteristic(activeBiotikCharacteristic === ciri.id ? null : ciri.id);
                      }}
                      className={`p-2.5 md:p-3 rounded-xl border-2 transition-all text-xs cursor-pointer
                        ${activeBiotikCharacteristic === ciri.id
                          ? 'bg-art-green border-art-green text-art-cream font-extrabold shadow-art-handdrawn-sm'
                          : 'bg-white border-art-green/30 text-art-green hover:bg-art-green-light hover:border-art-green hover:shadow-art-handdrawn-sm'
                        }
                      `}
                    >
                      {ciri.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Characteristic animation preview */}
              <div className="md:col-span-5 bg-white rounded-xl md:rounded-2xl border-2 md:border-3 border-art-green p-3 md:p-4 h-full min-h-[120px] md:min-h-[140px] flex flex-col justify-between shadow-art-handdrawn">
                <AnimatePresence mode="wait">
                  {activeBiotikCharacteristic ? (
                    <motion.div
                      key={activeBiotikCharacteristic}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center space-y-1.5 md:space-y-2 h-full flex flex-col justify-between text-art-green"
                    >
                      <span className="text-4xl md:text-6xl animate-bounce inline-block">
                        {activeBiotikCharacteristic === 'napas' && '😤💨'}
                        {activeBiotikCharacteristic === 'tumbuh' && '🌱🌳'}
                        {activeBiotikCharacteristic === 'gerak' && '🏃🤸'}
                        {activeBiotikCharacteristic === 'biak' && '🐣🐓'}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-[11px] md:text-xs text-art-green">
                          {activeBiotikCharacteristic === 'napas' && 'BERNAPAS'}
                          {activeBiotikCharacteristic === 'tumbuh' && 'TUMBUH'}
                          {activeBiotikCharacteristic === 'gerak' && 'BERGERAK'}
                          {activeBiotikCharacteristic === 'biak' && 'BERKEMBANG BIAK'}
                        </h4>
                        <p className="text-[10px] md:text-[11px] text-art-green/80 leading-tight mt-1 font-bold">
                          {activeBiotikCharacteristic === 'napas' && 'Semua makhluk hidup butuh napas! Tumbuhan pun bernapas melalui pori-pori daunnya.'}
                          {activeBiotikCharacteristic === 'tumbuh' && 'Sapi kecil tumbuh jadi Sapi dewasa. Benih mangga tumbuh jadi pohon raksasa!'}
                          {activeBiotikCharacteristic === 'gerak' && 'Hewan berlari mencari makan. Daun tanaman bergerak meliuk mengikuti arah cahaya.'}
                          {activeBiotikCharacteristic === 'biak' && 'Ayam bertelur menetas jadi anak ayam lucu, melestarikan jenisnya!'}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-art-green/60 py-3 md:py-4 text-center font-bold">
                      <span className="text-3xl md:text-4xl mb-1 animate-pulse">🦁🐰🌳</span>
                      <p className="text-[10px] md:text-[11px]">Klik tombol ciri-ciri di sebelah kiri untuk melihat penjelasannya!</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        );

      case 6: // Slide 7 - Komponen Abiotik
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">🔵</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Mengenal Komponen Abiotik</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Abiotik adalah <b>benda-benda tak hidup</b> di lingkungan kita. Walau tak bernapas, mereka adalah pahlawan yang membantu makhluk hidup bertahan hidup!
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 my-auto">
              {[
                { emoji: '☀️', title: 'Matahari', utility: 'Menghangatkan bumi, membantu penjemuran, dan memberi daya hidup tanaman melakukan fotosintesis.' },
                { emoji: '💧', title: 'Air', utility: 'Bahan utama cairan tubuh. Tanpa air untuk diminum, semua hewan dan tumbuhan akan layu kering!' },
                { emoji: '🌱', title: 'Tanah', utility: 'Tempat berpijak kokohnya akar pohon, rumah bagi cacing tanah, dan mengandung nutrisi makanan.' },
                { emoji: '🌬️', title: 'Udara', utility: 'Mengandung oksigen untuk manusia & hewan bernapas, serta karbon dioksida untuk tanaman bertumbuh.' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white border-2 md:border-3 border-art-green rounded-xl md:rounded-2xl p-2 md:p-3 shadow-art-handdrawn flex flex-col justify-between items-center text-center h-full text-art-green min-h-[140px] md:min-h-[180px]"
                >
                  <div className="text-3xl md:text-4xl mb-1 md:mb-1.5 p-1 md:p-1.5 bg-art-green-light border-2 border-art-green rounded-xl">{item.emoji}</div>
                  <h4 className="font-extrabold text-art-green text-xs md:text-sm">{item.title}</h4>
                  <p className="text-[9px] md:text-[10px] text-art-green/80 mt-1 md:mt-2 leading-tight font-semibold">{item.utility}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-100 text-art-green font-bold text-center text-[11px] md:text-xs p-2 rounded-xl border-2 border-art-green shadow-art-handdrawn-sm max-w-2xl mx-auto">
              ❓ <b>Cobalah bayangkan:</b> Jika bumi ini kehilangan air dan cahaya matahari, apakah sapi dan pohon mangga bisa tetap hidup? Jawabannya: Tentu tidak bisa!
            </div>
          </div>
        );

      case 7: // Slide 8 - Hubungan dalam Ekosistem
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">🔄</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Hubungan Rantai Makanan</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Makhluk hidup saling membutuhkan. Contohnya adalah <b>aliran energi (makanan)</b> dari rumput ke kambing, lalu dikonsumsi manusia.
              </p>
            </div>

            {/* Simulated Interactive Food Chain */}
            <div className="my-auto bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green shadow-art-handdrawn">
              <div className="flex flex-col md:flex-row items-center justify-around gap-3 md:gap-2">
                
                {/* Element 1: Producer */}
                <div className="text-center p-2 md:p-3 bg-art-green-light rounded-xl md:rounded-2xl border-2 border-art-green w-full md:w-36 max-w-[200px] text-art-green">
                  <span className="text-3xl md:text-4xl">🌱</span>
                  <h4 className="font-bold text-[11px] md:text-xs mt-1">Produsen</h4>
                  <p className="text-[10px] font-bold mt-1">Rumput Hijau</p>
                  <div className="mt-1 text-[9px] bg-white text-art-green/80 border border-art-green/20 rounded px-1 py-0.5">Membuat makanan</div>
                </div>

                {/* Arrow 1 */}
                <div className="text-center text-art-green font-black text-xl md:text-2xl flex flex-row md:flex-col items-center gap-1">
                  <span className="animate-pulse block rotate-90 md:rotate-0">➔</span>
                  <span className="text-[10px] text-art-green/60 font-medium">dimakan</span>
                </div>

                {/* Element 2: Herbivore */}
                <div className="text-center p-2 md:p-3 bg-art-accent/20 rounded-xl md:rounded-2xl border-2 border-art-green w-full md:w-36 max-w-[200px] text-art-green">
                  <span className="text-3xl md:text-4xl">🐐</span>
                  <h4 className="font-bold text-[11px] md:text-xs mt-1">Konsumen 1</h4>
                  <p className="text-[10px] font-bold mt-1">Kambing Jantan</p>
                  <div className="mt-1 text-[9px] bg-white text-art-green/80 border border-art-green/20 rounded px-1 py-0.5">Memakan rumput</div>
                </div>

                {/* Arrow 2 */}
                <div className="text-center text-art-green font-black text-xl md:text-2xl flex flex-row md:flex-col items-center gap-1">
                  <span className="animate-pulse block rotate-90 md:rotate-0">➔</span>
                  <span className="text-[10px] text-art-green/60 font-medium">dimanfaatkan</span>
                </div>

                {/* Element 3: Omnivore / Human */}
                <div className="text-center p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl border-2 border-art-green w-full md:w-36 max-w-[200px] text-art-green">
                  <span className="text-3xl md:text-4xl">👧</span>
                  <h4 className="font-bold text-[11px] md:text-xs mt-1">Konsumen 2</h4>
                  <p className="text-[10px] font-bold mt-1">Siswa / Manusia</p>
                  <div className="mt-1 text-[9px] bg-white text-art-green/80 border border-art-green/20 rounded px-1 py-0.5">Konsumsi daging</div>
                </div>

              </div>
            </div>

            <div className="text-center text-[10px] md:text-xs text-art-green font-bold bg-white/70 py-2 md:py-2.5 rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
              🌾 Semua saling bergantungan! Jika rumput mati karena kekeringan, kambing lapar, dan manusia kehilangan sumber protein.
            </div>
          </div>
        );

      case 8: // Slide 9 - Video Pembelajaran
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">🎥</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Video Pembelajaran Ekosistem</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Silakan tonton video seru tentang Ekosistem Kelas 3 SD untuk memperkuat pemahaman sebelum masuk kuis:
              </p>
            </div>

            <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Left: YouTube Video Frame Wrapper */}
              <div className="md:col-span-8 w-full flex flex-col justify-center">
                <a 
                  href="https://youtu.be/zdPanAv2f-w?si=e9Z4AhElKH0nqLFd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black rounded-xl md:rounded-2xl overflow-hidden aspect-video relative border-2 md:border-4 border-art-green shadow-art-handdrawn min-h-[160px] md:min-h-[200px] block group cursor-pointer"
                >
                  <img 
                    src="https://img.youtube.com/vi/zdPanAv2f-w/maxresdefault.jpg" 
                    alt="Video Pembelajaran Ekosistem Kelas 3 SD" 
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://img.youtube.com/vi/zdPanAv2f-w/hqdefault.jpg";
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 group-hover:bg-red-500 text-white w-14 h-10 md:w-20 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg scale-95 group-hover:scale-110 border-2 border-white">
                      <svg className="w-6 h-6 md:w-8 md:h-8 fill-current text-white translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded border border-white/20">
                    ▶ Klik Untuk Putar Video
                  </div>
                </a>
              </div>

              {/* Right: Companion panel with quiz hint */}
              <div className="md:col-span-4 bg-white rounded-xl md:rounded-2xl border-2 md:border-3 border-art-green p-3 md:p-4 shadow-art-handdrawn space-y-2.5 md:space-y-3 text-art-green flex flex-col justify-center">
                <div className="flex items-center gap-2 font-bold text-xs md:text-sm">
                  <Tv className="w-5 h-5 text-art-green animate-pulse" />
                  Materi Kunci Video:
                </div>
                <ul className="text-[10px] md:text-xs text-art-green/90 space-y-1 md:space-y-1.5 list-disc pl-4 font-bold">
                  <li>Pembagian ekosistem alami & buatan</li>
                  <li>Contoh biotik (hewan & tumbuhan hutan)</li>
                  <li>Contoh abiotik (sinar matahari & suhu)</li>
                  <li>Cara melestarikan ekosistem</li>
                </ul>
                <a 
                  href="https://youtu.be/zdPanAv2f-w?si=e9Z4AhElKH0nqLFd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-1.5 md:py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] md:text-xs rounded-xl border-2 border-black transition-transform hover:scale-103 shadow-md"
                >
                  🔗 Buka Video di YouTube
                </a>
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl border-2 border-art-green text-center text-[10px] md:text-xs text-art-green font-bold shadow-art-handdrawn-sm">
              💡 Setelah selesai menonton video, mari uji kemampuan kalian di <b>Ayo Mengamati</b> dan <b>Kuis Interaktif</b> berikutnya!
            </div>
          </div>
        );

      case 9: // Slide 10 - Ayo Mengamati!
        return <GardenObservation />;

      case 10: // Slide 11 - Kuis 1
      case 11: // Slide 12 - Kuis 2
      case 12: // Slide 13 - Kuis 3
      case 13: // Slide 14 - Kuis 4
        const questionIndex = currentSlide - 10;
        const quiz = QUIZ_QUESTIONS[questionIndex];
        const selected = selectedAnswers[quiz.id];
        const alreadyAnswered = selected !== undefined;
        const isSelectedCorrect = quizScores[quiz.id] === true;

        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green relative text-art-green gap-4">
            <div className="flex justify-between items-center border-b border-art-green/20 pb-2 md:pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📝</span>
                <h2 className="text-lg md:text-2xl font-black text-art-green">Kuis Interaktif ({quiz.id} dari 4)</h2>
              </div>
              <span className="px-3 py-1 bg-art-accent text-art-green font-black text-xs rounded-full border-2 border-art-green shadow-art-handdrawn-sm">
                Skor: {correctQuizCount} / {totalQuizzes}
              </span>
            </div>

            <div className="my-auto space-y-3 md:space-y-4">
              {/* Question Text */}
              <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 border-art-green shadow-art-handdrawn">
                <h3 className="text-sm md:text-lg font-black text-art-green leading-relaxed">
                  {quiz.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3.5">
                {quiz.options.map((option, idx) => {
                  const letter = option.charAt(0);
                  const isThisSelected = selected === letter;
                  const isCorrectAnswer = letter === quiz.answer;
                  
                  let optionStyle = "bg-white border-art-green/30 hover:bg-art-green-light hover:border-art-green hover:shadow-art-handdrawn-sm text-art-green";
                  if (alreadyAnswered) {
                    if (isThisSelected) {
                      optionStyle = isSelectedCorrect 
                        ? "bg-green-100 border-green-500 text-green-900 font-extrabold ring-4 ring-green-200 shadow-md" 
                        : "bg-red-100 border-red-500 text-red-900 font-extrabold ring-4 ring-red-200 shadow-md";
                    } else if (isCorrectAnswer && !isSelectedCorrect) {
                      optionStyle = "bg-green-50 border-green-300 text-green-800"; // show correct one
                    } else {
                      optionStyle = "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={alreadyAnswered}
                      onClick={() => handleSelectQuizAnswer(quiz.id, letter, quiz.answer)}
                      className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border-2 md:border-3 text-left transition-all text-xs md:text-sm flex items-center gap-2.5 md:gap-3 cursor-pointer
                        ${optionStyle}
                      `}
                    >
                      <span className={`w-7 h-7 rounded-full border-2 border-art-green flex items-center justify-center font-bold text-xs flex-shrink-0
                        ${alreadyAnswered && isThisSelected 
                          ? (isSelectedCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                          : 'bg-art-accent text-art-green'
                        }
                      `}>
                        {letter}
                      </span>
                      <span className="font-bold">{option.substring(3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-slide Quiz Feedback Modal / Banner */}
            <AnimatePresence>
              {quizFeedback && quizFeedback.questionId === quiz.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 flex flex-col md:flex-row justify-between items-center gap-2.5 md:gap-3 mt-2 md:mt-4 shadow-art-handdrawn
                    ${quizFeedback.isCorrect 
                      ? 'bg-green-100 border-green-500 text-green-950' 
                      : 'bg-red-100 border-red-500 text-red-950'
                    }
                  `}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-3xl flex-shrink-0">{quizFeedback.isCorrect ? '🎉' : '💔'}</span>
                    <div>
                      <h4 className="font-extrabold text-sm">
                        {quizFeedback.isCorrect ? 'Jawabanmu BENAR! Hebat!' : 'Aduh, Belum Tepat! Coba lagi yuk!'}
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-0.5 font-bold">
                        {quizFeedback.isCorrect ? quiz.explanation : 'Klik tombol "Coba Lagi" untuk mengulang pertanyaan ini, atau baca slide materi lagi!'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                    {!quizFeedback.isCorrect && (
                      <button
                        onClick={() => {
                          triggerSound('click');
                          setQuizFeedback(null);
                          setSelectedAnswers((prev) => {
                            const updated = { ...prev };
                            delete updated[quiz.id];
                            return updated;
                          });
                        }}
                        className="px-4 py-2 bg-art-accent hover:bg-white text-art-green font-bold text-xs rounded-xl border-2 border-art-green shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                      >
                        🔄 Coba Lagi
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-art-green hover:bg-white text-art-cream hover:text-art-green font-bold text-xs rounded-xl border-2 border-art-green shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lanjut</span> <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 14: // Slide 15 - Game Pengelompokan
        return <GameBiotikAbiotik />;

      case 15: // Slide 16 - Sikap Menjaga Ekosistem
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green relative overflow-hidden gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">🛡️</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Sikap Menjaga Ekosistem</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Ayo jadi pahlawan lingkungan! <b>Ceklis sikap menjaga alam</b> di bawah untuk melihat halaman sekolah berubah menjadi bersih dan asri!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 my-auto items-stretch flex-1 min-h-[200px]">
              
              {/* Checkbox triggers */}
              <div className="md:col-span-5 flex flex-col justify-center space-y-2">
                {[
                  { state: sikapSatu, setter: setSikapSatu, text: '🌱 Menanam Pohon Rindang', detail: 'Menghijaukan sekolah dan membuat udara segar.' },
                  { state: sikapDua, setter: setSikapDua, text: '🗑️ Membuang Sampah di Tong', detail: 'Menjaga rumput tetap bersih dari plastik kotor.' },
                  { state: sikapTiga, setter: setSikapTiga, text: '💧 Menghemat Air Bersih', detail: 'Mencegah kolam tercemar dan mengalir jernih.' },
                  { state: sikapEmpat, setter: setSikapEmpat, text: '🌻 Merawat Bunga & Menyiram', detail: 'Membuat bunga mekar sehingga kupu-kupu datang.' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      triggerSound('click');
                      item.setter(!item.state);
                      if (!item.state) triggerSound('correct');
                    }}
                    className={`p-3 rounded-xl md:rounded-2xl border-2 md:border-3 text-left transition-all flex items-start gap-3 cursor-pointer group
                      ${item.state 
                        ? 'bg-art-green text-art-cream border-art-green font-extrabold shadow-art-handdrawn-sm' 
                        : 'bg-white border-art-green/30 text-art-green hover:border-art-green hover:bg-art-green-light'
                      }
                    `}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item.state ? (
                        <CheckSquare className="w-5 h-5 text-art-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-art-green/50 group-hover:text-art-green" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black">{item.text}</h4>
                      <p className={`text-[10px] font-bold leading-tight ${item.state ? 'text-art-cream/80' : 'text-art-green/70'}`}>{item.detail}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic Playground changes visually! */}
              <div className="md:col-span-7 bg-gradient-to-b from-sky-200 to-sky-100 rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green overflow-hidden relative shadow-art-handdrawn min-h-[160px] md:min-h-[180px]">
                {/* Sun */}
                <div className="absolute top-3 right-5 text-4xl select-none">☀️</div>

                {/* Sky clouds */}
                <div className="absolute top-5 left-8 text-2xl select-none opacity-50">☁️</div>

                {/* Ground Grass */}
                <div className={`absolute bottom-0 left-0 right-0 h-2/3 transition-colors duration-1000 select-none
                  ${(sikapSatu && sikapDua && sikapTiga && sikapEmpat) ? 'bg-emerald-400' : 'bg-yellow-200/80'}
                `}>
                  {/* Tree sprouting */}
                  <div className="absolute bottom-4 left-6 transition-all duration-1000">
                    {sikapSatu ? (
                      <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="text-7xl block drop-shadow-md cursor-pointer"
                        title="Pohon Rindang Tumbuh!"
                      >
                        🌳
                      </motion.span>
                    ) : (
                      <span className="text-xs bg-art-green text-art-cream border border-art-green font-black px-2 py-1 rounded-full animate-bounce">Ayo Tanam 🌱</span>
                    )}
                  </div>

                  {/* Garbage scatter / clear */}
                  <div className="absolute bottom-3 left-1/3 transition-all duration-700">
                    {!sikapDua ? (
                      <div className="flex gap-2 text-2xl select-none" title="Sampah berserakan!">
                        <span className="animate-wiggle">🥤</span>
                        <span>🪰</span>
                        <span>📦</span>
                      </div>
                    ) : (
                      <div className="p-1.5 bg-art-green text-art-cream font-black text-[10px] rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
                        🗑️ Tong Sampah Rapi!
                      </div>
                    )}
                  </div>

                  {/* Water Pond */}
                  <div className={`absolute bottom-2 right-4 w-32 h-14 rounded-full border-3 border-art-green transition-colors duration-1000 overflow-hidden flex items-center justify-center select-none
                    ${sikapTiga ? 'bg-blue-400' : 'bg-amber-800/60'}
                  `}>
                    {sikapTiga ? (
                      <span className="text-3xl animate-pulse">🐟💦</span>
                    ) : (
                      <span className="text-[10px] text-amber-100 font-bold text-center px-1">Kolam Keruh 🌫️</span>
                    )}
                  </div>

                  {/* Flowers & Butterflies bloom */}
                  <div className="absolute bottom-5 right-1/3 transition-all duration-1000">
                    {sikapEmpat ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-1 text-4xl select-none"
                      >
                        <span>🌻</span>
                        <span className="animate-bounce">🦋</span>
                        <span>🌷</span>
                      </motion.div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic bg-white/70 px-1.5 rounded-lg border border-slate-200">Bunga Layu 🥀</span>
                    )}
                  </div>
                </div>

                {/* Victory environment badge */}
                {(sikapSatu && sikapDua && sikapTiga && sikapEmpat) && (
                  <div className="absolute top-3 left-3 bg-art-green text-art-cream font-black text-xs px-3 py-1.5 rounded-xl border-2 border-art-green shadow-art-handdrawn-sm flex items-center gap-1.5 animate-bounce">
                    <Sparkles className="w-4 h-4 text-art-accent" /> Alam Bersih & Lestari!
                  </div>
                )}
              </div>

            </div>
          </div>
        );

      case 16: // Slide 17 - Refleksi
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-green gap-4">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">💡</span>
                <h2 className="text-xl md:text-3xl font-black text-art-green">Refleksi Belajar Hari Ini</h2>
              </div>
              <p className="text-xs md:text-sm font-semibold">
                Hebat! Kita sudah belajar banyak. Berikan tanda centang pada hal-hal yang sudah berhasil kamu kuasai hari ini:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3.5 my-auto max-w-3xl mx-auto w-full">
              {[
                { key: 'pengertian', title: 'Aku paham apa itu Ekosistem', emoji: '🤝', desc: 'Tahu hubungan timbal balik makhluk hidup dan lingkungannya.' },
                { key: 'biotik', title: 'Aku bisa membedakan Komponen Biotik', emoji: '🦁', desc: 'Mengenali pohon, ayam, sapi, dan manusia sebagai komponen hidup.' },
                { key: 'abiotik', title: 'Aku bisa membedakan Komponen Abiotik', emoji: '💧', desc: 'Mengenali air, tanah, matahari, dan udara sebagai benda mati pendukung.' },
                { key: 'menjaga', title: 'Aku berkomitmen Menjaga Lingkungan', emoji: '🌱', desc: 'Menanam pohon, menghemat air, dan tidak membuang sampah sembarangan.' }
              ].map((item) => {
                const isChecked = refleksiChecked[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      triggerSound('click');
                      setRefleksiChecked({
                        ...refleksiChecked,
                        [item.key]: !isChecked
                      });
                      if (!isChecked) triggerSound('correct');
                    }}
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 text-left transition-all flex items-start gap-3 md:gap-4 cursor-pointer shadow-art-handdrawn-sm
                      ${isChecked 
                        ? 'bg-art-green text-art-cream border-art-green font-extrabold shadow-art-handdrawn' 
                        : 'bg-white border-art-green/30 text-art-green hover:border-art-green hover:bg-art-green-light'
                      }
                    `}
                  >
                    <span className="text-3xl p-1 bg-art-green-light border-2 border-art-green rounded-xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-xs md:text-sm font-black flex items-center justify-between">
                        <span>{item.title}</span>
                        <span className="text-lg">{isChecked ? '✅' : '⬜'}</span>
                      </h4>
                      <p className={`text-[10px] font-bold mt-1 leading-normal ${isChecked ? 'text-art-cream/80' : 'text-art-green/70'}`}>{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center text-[10px] md:text-xs font-bold text-art-green/90">
              Centang semua kartu jika kamu sudah siap mengunduh sertifikat pahlawan lingkungan! 🏆
            </div>
          </div>
        );

      case 17: // Slide 18 - Kesimpulan
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-green to-art-green-dark rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green text-art-cream relative gap-4">
            <div className="absolute top-3 right-5 font-mono text-[9px] text-art-accent/90 font-bold">BOARD_ID: SD-3-IPAS</div>
            
            <div className="space-y-1 md:space-y-1.5 border-b border-art-cream/20 pb-2">
              <h2 className="text-lg md:text-2xl font-black text-art-accent flex items-center gap-2">
                <span>📌</span> Rangkuman Belajar Hari Ini
              </h2>
              <p className="text-[11px] md:text-xs text-art-cream/90 leading-snug font-bold">
                Mari simpan pengetahuan penting ini di buku catatan emas kalian:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4 my-auto">
              {[
                { title: '1. Arti Ekosistem', desc: 'Hubungan timbal balik yang seimbang antara makhluk hidup (biotik) dengan lingkungan sekitarnya (abiotik).', emoji: '🕸️', border: 'border-art-accent' },
                { title: '2. Komponen Biotik', desc: 'Kelompok makhluk hidup yang bernapas, makan, tumbuh besar, bergerak mandiri, dan berkembang biak.', emoji: '🐒', border: 'border-art-accent' },
                { title: '3. Komponen Abiotik', desc: 'Benda tak hidup seperti matahari, air bersih, tanah subur, dan udara segar yang mendukung biotik bertahan hidup.', emoji: '🌦️', border: 'border-art-accent' }
              ].map((point, idx) => (
                <div 
                  key={idx}
                  className={`bg-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 ${point.border} shadow-art-handdrawn-sm space-y-1.5 md:space-y-2 h-full flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{point.emoji}</span>
                    <h4 className="font-extrabold text-art-accent text-xs md:text-sm">{point.title}</h4>
                  </div>
                  <p className="text-[11px] text-art-cream/95 leading-relaxed font-bold">{point.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 p-2 md:p-2.5 rounded-xl border border-art-cream/20 text-center text-[10px] md:text-xs text-art-accent font-black max-w-xl mx-auto shadow-art-handdrawn-sm">
              🌎 Menjaga kelestarian lingkungan adalah tugas kita semua agar ekosistem tetap sehat!
            </div>
          </div>
        );

      case 18: // Slide 19 - Penutup & Sertifikat
        const ratingStars = correctQuizCount >= 4 ? '⭐⭐⭐⭐⭐' : correctQuizCount >= 3 ? '⭐⭐⭐⭐' : correctQuizCount >= 2 ? '⭐⭐⭐' : '⭐⭐';
        return (
          <div className="flex flex-col justify-between min-h-full h-auto md:h-full p-4 md:p-6 bg-gradient-to-br from-art-cream to-art-bg rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green relative overflow-hidden text-art-green gap-4">
            
            {certAwarded ? (
              // Print certificate view!
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-auto max-w-2xl mx-auto w-full bg-white border-6 md:border-8 border-double border-art-green rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-art-handdrawn relative text-art-green"
              >
                {/* Certificate Background Decor */}
                <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-art-green/30 pointer-events-none rounded-2xl" />
                <div className="absolute top-6 left-6 text-2xl opacity-20">📜</div>
                <div className="absolute top-6 right-6 text-2xl opacity-20">🎓</div>
                <div className="absolute bottom-6 left-6 text-2xl opacity-20">🌱</div>
                <div className="absolute bottom-6 right-6 text-2xl opacity-20">🌍</div>

                <div className="text-center space-y-4">
                  <span className="text-4xl md:text-6xl inline-block animate-pulse">🏆</span>
                  <h3 className="font-black text-art-green text-lg md:text-3xl uppercase tracking-wider">Sertifikat Kelulusan</h3>
                  
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-xs text-art-green/70 uppercase font-black tracking-widest">Diberikan Kepada Siswa Hebat:</p>
                    <h4 className="text-xl md:text-3xl font-black text-art-green border-b-2 md:border-b-3 border-art-accent inline-block px-4 md:px-8 py-0.5 md:py-1">
                      {studentName || 'Petualang Cilik'}
                    </h4>
                  </div>

                  <p className="text-[11px] md:text-xs max-w-md mx-auto text-art-green/90 leading-relaxed font-bold">
                    Atas keberhasilannya menuntaskan modul interaktif <b>EKOSISTEM DI SEKITARKU (IPAS Kelas III SD)</b> dengan predikat kelulusan sangat baik.
                  </p>

                  <div className="bg-art-green-light p-2 md:p-2.5 rounded-xl border-2 border-art-green inline-flex flex-col items-center gap-1">
                    <span className="text-[10px] md:text-xs font-black text-art-green uppercase tracking-wider">Penghargaan Bintang:</span>
                    <span className="text-xl md:text-2xl select-none">{ratingStars}</span>
                    <span className="text-[10px] font-black text-art-green/80">Nilai Kuis: {correctQuizCount} dari 4 Benar!</span>
                  </div>

                  <div className="flex gap-3 justify-center pt-4">
                    <button
                      onClick={() => {
                        triggerSound('click');
                        setCertAwarded(false);
                      }}
                      className="px-4 py-1.5 bg-art-cream hover:bg-art-green-light text-art-green font-bold text-xs rounded-xl border-2 border-art-green shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Undo className="w-3.5 h-3.5" /> Edit Nama
                    </button>
                    <button
                      onClick={() => {
                        triggerSound('click');
                        window.print();
                      }}
                      className="px-4 py-1.5 bg-art-green hover:bg-white text-art-cream hover:text-art-green font-black text-xs rounded-xl border-2 border-art-green shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cetak Sertifikat
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Certificate Form view
              <div className="my-auto max-w-md mx-auto text-center space-y-3 md:space-y-5 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green shadow-art-handdrawn">
                <span className="text-6xl animate-bounce inline-block">🎉</span>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-black text-art-green">HEBAT! KAMU SELESAI!</h3>
                  <p className="text-xs text-art-green/70 font-semibold">
                    Kamu telah menyelesaikan semua slide materi, video, kuis interaktif, dan game pengelompokan ekosistem!
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-black text-art-green text-left uppercase tracking-wider">
                    ✍️ Tulis Namamu untuk Cetak Sertifikat:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    maxLength={30}
                    className="w-full p-2.5 rounded-xl border-3 border-art-green focus:border-art-accent focus:outline-none text-sm font-bold text-center bg-art-green-light/30 text-art-green"
                  />
                  <p className="text-[10px] text-art-green/60 font-black italic">
                    Skor Kuis yang diperoleh: {correctQuizCount} / 4 Benar ({ratingStars})
                  </p>
                </div>

                <button
                  onClick={() => {
                    triggerSound('victory');
                    setCertAwarded(true);
                  }}
                  className="w-full py-3 bg-art-accent hover:bg-white text-art-green border-2 border-art-green font-black rounded-xl shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm cursor-pointer"
                >
                  🎓 KLIK UNTUK TERBITKAN SERTIFIKAT
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1 text-xs font-bold text-art-green hover:text-art-green-dark underline mt-3 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Ulangi Presentasi dari Awal
              </button>
            </div>
          </div>
        );

      default:
        return <div>Slide kosong.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-art-bg flex flex-col font-sans text-art-green selection:bg-art-accent selection:text-art-green relative">
      
      {/* Friendly Mobile Portrait Warning */}
      {!ignorePortraitWarning && (
        <div id="portrait-orientation-warning" className="fixed inset-0 bg-art-bg z-50 flex flex-col items-center justify-center p-6 text-center md:hidden portrait:flex hidden transition-all duration-300">
          <div className="bg-white p-6 rounded-[32px] border-4 border-art-green max-w-sm shadow-art-handdrawn-lg flex flex-col items-center gap-4">
            <div className="relative">
              <Smartphone className="w-16 h-16 text-art-green animate-wiggle" />
              <RotateCcw className="w-6 h-6 text-art-accent absolute -top-1 -right-1 animate-spin duration-3000" style={{ animationDuration: '3s' }} />
            </div>
            
            <h2 className="text-xl font-black text-art-green leading-tight">
              📱 Putar HP Kamu, Yuk!
            </h2>
            
            <p className="text-xs font-bold text-art-green/80 leading-relaxed">
              Tampilan E-PPT Interaktif akan jauh lebih luas, indah, dan mudah dimainkan jika kamu memutar HP ke mode <b>Lanskap (Tidur)</b>, sama seperti layar PPT di sekolah! 🏫✨
            </p>
            
            <div className="w-full flex flex-col gap-2 mt-2">
              <div className="text-[10px] text-art-green/50 font-black italic animate-pulse">
                🔄 Aktifkan putar layar otomatis di HP-mu ya!
              </div>
              
              <button
                onClick={() => {
                  triggerSound('click');
                  setIgnorePortraitWarning(true);
                }}
                className="w-full py-2 px-4 bg-art-accent hover:bg-white text-art-green border-2 border-art-green font-black rounded-xl shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs cursor-pointer"
              >
                Tetap Pakai Mode Tegak 📱
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upper Navigation / Control Bar */}
      <header className="bg-art-cream border-3 md:border-4 border-art-green p-3 md:p-4 shadow-art-handdrawn flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 m-3 md:m-4 rounded-2xl z-40 landscape:py-1.5 landscape:px-3 landscape:my-1.5">
        <div className="hidden md:flex items-center gap-2.5">
          <div className="p-1.5 md:p-2 bg-art-accent rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
            <GraduationCap className="w-5 h-5 md:w-7 md:h-7 text-art-green" />
          </div>
          <div>
            <h1 className="text-xs md:text-base font-black text-art-green leading-tight">
              E-PPT Interaktif IPAS Kelas 3 SD
            </h1>
            <p className="text-[9px] md:text-[10px] text-art-green/70 font-bold uppercase tracking-wider landscape:hidden md:landscape:block">
              Tema: Ekosistem dan Lingkungan Sekitar
            </p>
          </div>
        </div>

        {/* Presenter controls row */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          
          {/* Laser Pointer */}
          <button
            onClick={() => {
              triggerSound('click');
              setLaserActive(!laserActive);
              setPenActive(false); // mutually exclusive
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black border-2 border-art-green flex items-center gap-1.5 transition-all cursor-pointer
              ${laserActive 
                ? 'bg-red-500 text-white shadow-art-handdrawn-sm translate-y-0.5' 
                : 'bg-white hover:bg-art-green-light text-art-green hover:shadow-art-handdrawn-sm'
              }
            `}
            title="Aktivasi Laser Pointer Merah"
          >
            <MousePointer className="w-3.5 h-3.5" /> Laser {laserActive ? 'Aktif' : 'Pointer'}
          </button>

          {/* Drawing Pen marker */}
          <button
            onClick={() => {
              triggerSound('click');
              setPenActive(!penActive);
              setLaserActive(false); // mutually exclusive
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black border-2 border-art-green flex items-center gap-1.5 transition-all cursor-pointer
              ${penActive 
                ? 'bg-art-accent text-art-green shadow-art-handdrawn-sm translate-y-0.5' 
                : 'bg-white hover:bg-art-green-light text-art-green hover:shadow-art-handdrawn-sm'
              }
            `}
            title="Aktivasi Crayon Tulis Layar"
          >
            <PenTool className="w-3.5 h-3.5" /> Crayon {penActive ? 'Aktif' : 'Tulis'}
          </button>

          {penActive && (
            <>
              {/* Color selectors */}
              <div className="flex gap-1.5 bg-white p-1 rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
                {['#ef4444', '#2d5a27', '#3b82f6', '#000000'].map((color) => (
                  <button
                    key={color}
                    onClick={() => { triggerSound('click'); setPenColor(color); }}
                    style={{ backgroundColor: color }}
                    className={`w-4 h-4 rounded-full border cursor-pointer transition-transform
                      ${penColor === color ? 'scale-125 ring-2 ring-art-green' : 'opacity-80 hover:opacity-100'}
                    `}
                  />
                ))}
              </div>
              
              {/* Clear whiteboard drawing button */}
              <button
                onClick={clearCanvas}
                className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 rounded-lg text-[10px] font-bold"
                title="Hapus Coretan"
              >
                Hapus
              </button>
            </>
          )}

          <div className="h-6 w-[2px] bg-art-green/20" />

          {/* Sound toggle button */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // play a small sound to confirm
                setTimeout(() => playClickSound(), 100);
              }
            }}
            className={`p-1.5 rounded-xl border-2 border-transparent hover:border-art-green hover:bg-art-green-light transition-all cursor-pointer ${soundEnabled ? 'text-art-green' : 'text-slate-400'}`}
            title={soundEnabled ? 'Matikan Suara Kuis & Game' : 'Nyalakan Suara Kuis & Game'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 animate-wiggle" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Auto slide cycling toggle */}
          <button
            onClick={() => {
              triggerSound('click');
              setAutoPlay(!autoPlay);
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-art-green text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all
              ${autoPlay 
                ? 'bg-art-green text-art-cream shadow-art-handdrawn-sm animate-pulse' 
                : 'bg-white text-art-green hover:bg-art-green-light hover:shadow-art-handdrawn-sm'
              }
            `}
          >
            {autoPlay ? '⏸ Auto Berjalan' : '▶ Auto Putar'}
          </button>
        </div>
      </header>

      {/* Main split-view area */}
      <div className="flex-1 flex flex-col md:flex-row landscape:flex-row md:overflow-hidden landscape:overflow-hidden overflow-y-auto px-2 md:px-4 pb-4 gap-3 md:gap-4">
        
        {/* Left sidebar: PPT slides thumbnail navigator */}
        <aside className="hidden md:flex w-full md:w-64 landscape:w-52 bg-art-cream border-3 md:border-4 border-art-green rounded-2xl md:rounded-3xl flex-col justify-between overflow-hidden md:flex-shrink-0 shadow-art-handdrawn order-2 md:order-1 landscape:order-1">
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-2 md:p-3 bg-art-green-light border-b-2 md:border-b-4 border-art-green flex items-center justify-between text-[11px] md:text-xs font-black text-art-green uppercase tracking-wider landscape:p-2 landscape:text-[10px]">
              <span>🗂️ Halaman Slide</span>
              <span className="px-1.5 py-0.5 bg-art-accent text-[9px] font-black rounded-lg border-2 border-art-green shadow-art-handdrawn-sm">{SLIDES.length} Slide</span>
            </div>
            
            {/* Scrollable list of slide links */}
            <div className="flex-1 overflow-x-auto md:overflow-y-auto landscape:overflow-y-auto p-2 md:p-2.5 flex md:flex-col landscape:flex-col gap-2 md:space-y-2 landscape:space-y-1.5 art-scroll">
              {SLIDES.map((slide, index) => {
                const isActive = currentSlide === index;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    className={`w-40 md:w-full landscape:w-full p-1.5 md:p-2.5 rounded-xl md:rounded-2xl text-left text-xs transition-all flex items-center gap-2 md:gap-2.5 border-2 cursor-pointer flex-shrink-0 landscape:py-1 landscape:px-2
                      ${isActive 
                        ? 'bg-art-green text-art-cream font-black border-art-green shadow-art-handdrawn-sm translate-x-1' 
                        : 'bg-white border-art-green/20 hover:border-art-green hover:bg-art-green-light hover:shadow-art-handdrawn-sm hover:-translate-y-0.5 text-art-green'
                      }
                    `}
                  >
                    <span className="text-lg flex-shrink-0">{slide.icon}</span>
                    <div className="truncate flex-1">
                      <span className={`block text-[9px] font-black ${isActive ? 'text-art-accent' : 'text-art-green/60'}`}>Slide {slide.id}</span>
                      <span className="block truncate font-bold text-[11px] md:text-xs">{slide.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions / reset */}
          <div className="p-1.5 md:p-3 border-t-2 md:border-t-4 border-art-green bg-art-green-light/40 landscape:p-1.5">
            <button
              onClick={handleRestart}
              className="w-full py-1 md:py-2 bg-white hover:bg-art-accent border-2 md:border-3 border-art-green rounded-xl text-[10px] md:text-xs font-black text-art-green cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 landscape:py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ulangi Presentasi
            </button>
          </div>
        </aside>

        {/* Center: Slide projector container */}
        <main className="flex-1 p-0 flex flex-col items-center justify-between md:overflow-y-auto landscape:overflow-y-auto overflow-visible min-w-0 order-1 md:order-2 landscape:order-2 w-full h-full">
          
          {/* Aspect-ratio board container representing white projector board */}
          <div 
            ref={slideContainerRef}
            onMouseMove={handleMouseMoveOnSlide}
            className={`w-full bg-art-cream rounded-art-card shadow-art-handdrawn-lg border-3 md:border-4 border-art-green relative overflow-hidden flex flex-col justify-between p-1 select-none transition-all duration-300 min-h-[280px] md:min-h-[480px] landscape:min-h-0 h-auto md:h-full landscape:h-full md:max-h-[560px] landscape:max-h-[85vh]
              ${laserActive ? 'cursor-none' : ''}
              ${penActive ? 'cursor-crosshair' : ''}
            `}
          >
            {/* Draw overlay layer */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`absolute inset-0 w-full h-full z-20 pointer-events-none
                ${penActive ? 'pointer-events-auto' : 'pointer-events-none'}
              `}
            />

            {/* Simulated Laser pointer dot */}
            {laserActive && (
              <div
                style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
                className="absolute w-5 h-5 rounded-full bg-red-600 border border-white pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#dc2626,0_0_4px_#dc2626]"
              />
            )}

            {/* Render active slide */}
            <div className="flex-1 overflow-y-auto p-2 md:p-3 relative z-10 art-scroll">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  {renderSlideContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom quick slide controls panel */}
            <div className="bg-art-green-light border-t-2 md:border-t-4 border-art-green py-1.5 md:py-3 px-3 md:px-6 flex justify-between items-center z-10 rounded-b-[48px] landscape:py-1">
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-white border-2 md:border-3 border-art-green hover:bg-art-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-art-green flex items-center gap-1 shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <span className="text-[10px] md:text-xs font-black text-art-green bg-white border-2 border-art-green px-2.5 md:px-4 py-0.5 md:py-1 rounded-full shadow-art-handdrawn-sm">
                Slide {currentSlide + 1} / {SLIDES.length}
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={handleNext}
                  disabled={currentSlide === SLIDES.length - 1}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-art-accent hover:bg-white text-art-green border-2 md:border-3 border-art-green disabled:opacity-40 disabled:cursor-not-allowed rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black flex items-center gap-1 shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Teacher Guide Cues Panel / Slide Notes */}
          <div className="hidden md:flex w-full bg-art-cream border-4 border-art-green rounded-3xl p-4 mt-4 shadow-art-handdrawn items-start gap-2.5">
            <Info className="w-5 h-5 text-art-green flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[11px] font-black text-art-green uppercase tracking-wider">
                🎨 Panduan Guru / PGSD (Slide Notes):
              </h5>
              <p className="text-xs text-art-green/80 leading-relaxed font-bold mt-0.5">
                {SLIDES[currentSlide].notes}
              </p>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
}
