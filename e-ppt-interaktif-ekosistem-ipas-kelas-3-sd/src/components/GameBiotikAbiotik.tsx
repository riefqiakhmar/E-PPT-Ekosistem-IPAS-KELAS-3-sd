import React, { useState } from 'react';
import { DragItem } from '../types';
import { playClickSound, playCorrectSound, playIncorrectSound, playVictorySound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const INITIAL_ITEMS: DragItem[] = [
  { id: 'biotik1', name: 'Ayam 🐔', emoji: '🐔', type: 'biotik' },
  { id: 'abiotik1', name: 'Air 💧', emoji: '💧', type: 'abiotik' },
  { id: 'biotik2', name: 'Pohon 🌳', emoji: '🌳', type: 'biotik' },
  { id: 'abiotik2', name: 'Matahari ☀️', emoji: '☀️', type: 'abiotik' },
  { id: 'biotik3', name: 'Ikan 🐟', emoji: '🐟', type: 'biotik' },
  { id: 'abiotik3', name: 'Batu 🪨', emoji: '🪨', type: 'abiotik' },
];

export default function GameBiotikAbiotik() {
  const [items, setItems] = useState<DragItem[]>(INITIAL_ITEMS);
  const [selectedItem, setSelectedItem] = useState<DragItem | null>(null);
  const [biotikBasket, setBiotikBasket] = useState<DragItem[]>([]);
  const [abiotikBasket, setAbiotikBasket] = useState<DragItem[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const resetGame = () => {
    playClickSound();
    setItems(INITIAL_ITEMS);
    setSelectedItem(null);
    setBiotikBasket([]);
    setAbiotikBasket([]);
    setFeedback(null);
    setShowVictory(false);
  };

  const handleSelectItem = (item: DragItem) => {
    playClickSound();
    setSelectedItem(item);
    setFeedback(null);
  };

  const classifyItem = (targetType: 'biotik' | 'abiotik') => {
    if (!selectedItem) return;

    if (selectedItem.type === targetType) {
      // Correct!
      playCorrectSound();
      setFeedback({
        text: `Hebat! ${selectedItem.name} dimasukkan ke kelompok yang BENAR!`,
        isCorrect: true,
      });

      // Add to corresponding basket
      if (targetType === 'biotik') {
        setBiotikBasket((prev) => [...prev, selectedItem]);
      } else {
        setAbiotikBasket((prev) => [...prev, selectedItem]);
      }

      // Remove from tray
      const remaining = items.filter((i) => i.id !== selectedItem.id);
      setItems(remaining);
      setSelectedItem(null);

      // Check if game complete
      if (remaining.length === 0) {
        setTimeout(() => {
          playVictorySound();
          setShowVictory(true);
        }, 500);
      }
    } else {
      // Incorrect!
      playIncorrectSound();
      setFeedback({
        text: `Ayo coba lagi! ${selectedItem.name} bukan komponen ${targetType === 'biotik' ? 'Biotik (hidup)' : 'Abiotik (tak hidup)'}.`,
        isCorrect: false,
      });
      setSelectedItem(null);
    }
  };

  return (
    <div id="interactive-sorting-game" className="flex flex-col min-h-full h-auto md:h-full bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green p-4 md:p-5 relative overflow-hidden text-art-green gap-4">
      {/* Background patterns */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-art-green/5 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-art-green/5 rounded-full opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-3 md:p-3.5 rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green shadow-art-handdrawn-sm gap-3 z-10 animate-fade-in">
        <div>
          <h3 className="text-xs md:text-base font-black text-art-green flex items-center gap-2 leading-tight">
            <Sparkles className="w-5 h-5 text-art-green animate-spin" />
            Game Pengelompokan Ekosistem!
          </h3>
          <p className="text-[10px] md:text-xs text-art-green/80 font-bold">
            Pilih benda di bawah, lalu klik keranjang <b>Biotik</b> atau <b>Abiotik</b> yang tepat!
          </p>
        </div>
        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-art-accent hover:bg-white text-art-green border-2 border-art-green text-xs font-black rounded-xl shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Ulangi Game
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 items-stretch z-10">
        {/* Left Side: Items Source tray */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green p-3 md:p-4 shadow-art-handdrawn">
          <h4 className="text-[10px] md:text-xs font-black text-art-green mb-2 md:mb-3 text-center border-b border-art-green/20 pb-2 uppercase tracking-wider">
            🎒 Kotak Benda ({items.length} tersisa)
          </h4>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 flex-1 items-center content-center py-2">
              {items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center border-2 cursor-pointer transition-all duration-200 h-20 sm:h-24
                      ${isSelected 
                        ? 'border-art-green bg-art-accent shadow-art-handdrawn-sm ring-3 ring-art-green' 
                        : 'border-art-green bg-art-green-light hover:bg-white text-art-green shadow-art-handdrawn-sm'
                      }
                    `}
                  >
                    <span className="text-2xl md:text-4xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] md:text-xs font-black text-art-green">{item.name.split(' ')[0]}</span>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-6 text-art-green/40 text-center">
              <span className="text-5xl mb-2 animate-bounce">🎉</span>
              <p className="text-xs font-black">Kotak kosong! Semua benda sudah dikelompokkan dengan benar.</p>
            </div>
          )}
        </div>

        {/* Right Side: Target Baskets & Interactive action */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-3 md:gap-4">
          
          {/* Active Instructions / Selection State */}
          <div className="bg-art-cream border-2 border-art-green rounded-xl md:rounded-2xl p-2 md:p-2.5 text-center shadow-art-handdrawn-sm">
            {selectedItem ? (
              <p className="text-[11px] md:text-xs font-black text-art-green flex items-center justify-center gap-2">
                <span>Sekarang, masukkan <b className="text-xs px-2 py-0.5 bg-art-accent rounded-lg border border-black">{selectedItem.emoji} {selectedItem.name.split(' ')[0]}</b> ke dalam:</span>
              </p>
            ) : (
              <p className="text-[11px] md:text-xs font-black text-art-green">
                👉 <b>Ketuk salah satu benda</b> di Kotak Benda sebelah kiri untuk mulai mengelompokkan!
              </p>
            )}
          </div>

          {/* Baskets Row */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1">
            {/* Biotik Basket (Living) */}
            <button
              onClick={() => classifyItem('biotik')}
              disabled={!selectedItem}
              className={`relative rounded-2xl md:rounded-3xl border-2 md:border-3 flex flex-col items-center justify-between p-3 md:p-4 transition-all duration-300 group
                ${selectedItem 
                  ? 'border-art-green bg-art-green-light/75 cursor-pointer shadow-art-handdrawn hover:translate-y-0.5 transition-all' 
                  : 'border-slate-300 bg-slate-50/20 cursor-not-allowed opacity-60'
                }
              `}
            >
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black text-white bg-art-green border-2 border-black uppercase tracking-wider mb-2`}>
                  🟢 BIOTIK
                </span>
                <p className="text-[9px] text-art-green font-bold px-1 leading-tight">
                  (Makhluk Hidup: Bernapas, tumbuh, dan bergerak)
                </p>
              </div>

              {/* Basket visual */}
              <div className="my-2 text-4xl md:text-5xl group-hover:animate-bounce transition-transform">🧺</div>

              {/* Items in basket */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-h-[70px] overflow-y-auto">
                {biotikBasket.map((i) => (
                  <span key={i.id} className="text-xl md:text-2xl bg-white p-1 rounded-xl shadow-art-handdrawn-sm border-2 border-art-green" title={i.name}>
                    {i.emoji}
                  </span>
                ))}
              </div>
              
              {/* Basket count badge */}
              <span className="absolute -top-2.5 -right-2.5 bg-art-green text-art-cream border-2 border-art-green rounded-full w-7 h-7 flex items-center justify-center font-black text-xs shadow-art-handdrawn-sm">
                {biotikBasket.length}
              </span>
            </button>

            {/* Abiotik Basket (Non-Living) */}
            <button
              onClick={() => classifyItem('abiotik')}
              disabled={!selectedItem}
              className={`relative rounded-2xl md:rounded-3xl border-2 md:border-3 flex flex-col items-center justify-between p-3 md:p-4 transition-all duration-300 group
                ${selectedItem 
                  ? 'border-art-green bg-blue-50 cursor-pointer shadow-art-handdrawn hover:translate-y-0.5 transition-all' 
                  : 'border-slate-300 bg-slate-50/20 cursor-not-allowed opacity-60'
                }
              `}
            >
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black text-white bg-blue-600 border-2 border-black uppercase tracking-wider mb-2`}>
                  🔵 ABIOTIK
                </span>
                <p className="text-[9px] text-blue-800 font-bold px-1 leading-tight">
                  (Benda Tak Hidup: Membantu biotik bertahan hidup)
                </p>
              </div>

              {/* Basket visual */}
              <div className="my-2 text-4xl md:text-5xl group-hover:animate-bounce transition-transform">🧺</div>

              {/* Items in basket */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-h-[70px] overflow-y-auto">
                {abiotikBasket.map((i) => (
                  <span key={i.id} className="text-xl md:text-2xl bg-white p-1 rounded-xl shadow-art-handdrawn-sm border-2 border-art-green" title={i.name}>
                    {i.emoji}
                  </span>
                ))}
              </div>

              {/* Basket count badge */}
              <span className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white border-2 border-blue-900 rounded-full w-7 h-7 flex items-center justify-center font-black text-xs shadow-art-handdrawn-sm">
                {abiotikBasket.length}
              </span>
            </button>
          </div>

          {/* Feedback Area */}
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black border-2 shadow-art-handdrawn-sm
                    ${feedback.isCorrect 
                      ? 'bg-art-green-light border-art-green text-art-green' 
                      : 'bg-red-50 border-red-500 text-red-800'
                    }
                  `}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-art-green flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Victory modal */}
      <AnimatePresence>
        {showVictory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-art-green/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-40 text-art-cream"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="mb-4"
            >
              <div className="relative inline-block">
                <span className="text-7xl">🏆</span>
                <span className="absolute -top-3 -right-3 text-3xl animate-bounce">⭐</span>
              </div>
            </motion.div>
            
            <h4 className="text-2xl font-black text-art-accent mb-2 uppercase tracking-wide">Luar Biasa! Kamu Juara! 🥳🌟</h4>
            <p className="text-sm max-w-md mx-auto mb-5 text-art-cream/90 font-bold leading-relaxed">
              Kamu telah berhasil mengelompokkan semua benda dengan sempurna!
              <br />
              <b className="text-art-accent">Biotik:</b> Ayam, Pohon, Ikan 🐓🌳🐟
              <br />
              <b className="text-blue-300">Abiotik:</b> Air, Matahari, Batu 💧☀️🪨
            </p>

            <button
              onClick={resetGame}
              className="px-5 py-2.5 bg-art-accent hover:bg-white text-art-green font-black rounded-xl border-2 border-art-green shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 text-sm cursor-pointer mx-auto"
            >
              <RefreshCw className="w-4.5 h-4.5" /> Main Lagi
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
