import React, { useState } from 'react';
import { GardenItem } from '../types';
import { playClickSound, playCorrectSound, playVictorySound } from '../utils/audio';
import { Sparkles, CheckCircle, Info, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GARDEN_ITEMS: GardenItem[] = [
  { id: 'item1', name: 'Matahari', emoji: '☀️', type: 'abiotik', x: 15, y: 15, description: 'Abiotik (Benda tak hidup). Memberikan energi hangat dan cahaya untuk semua makhluk hidup!' },
  { id: 'item2', name: 'Awan & Angin', emoji: '☁️', type: 'abiotik', x: 45, y: 18, description: 'Abiotik (Benda tak hidup). Udara segar membantu kita dan hewan bernapas.' },
  { id: 'item3', name: 'Pohon Rindang', emoji: '🌳', type: 'biotik', x: 75, y: 35, description: 'Biotik (Makhluk hidup). Menghasilkan oksigen segar dan menjadi tempat berteduh.' },
  { id: 'item4', name: 'Bunga Cantik', emoji: '🌻', type: 'biotik', x: 85, y: 65, description: 'Biotik (Makhluk hidup). Tumbuh tegak mencari matahari dan dihinggapi serangga!' },
  { id: 'item5', name: 'Kolam Air', emoji: '💧', type: 'abiotik', x: 20, y: 75, description: 'Abiotik (Benda tak hidup). Tempat minum hewan dan sumber kehidupan.' },
  { id: 'item6', name: 'Ikan Kecil', emoji: '🐟', type: 'biotik', x: 23, y: 80, description: 'Biotik (Makhluk hidup). Berenang lincah di dalam air kolam.' },
  { id: 'item7', name: 'Ayam Jago', emoji: '🐓', type: 'biotik', x: 55, y: 68, description: 'Biotik (Makhluk hidup). Suka berkokok di pagi hari dan mencari cacing!' },
  { id: 'item8', name: 'Batu Kali', emoji: '🪨', type: 'abiotik', x: 38, y: 78, description: 'Abiotik (Benda tak hidup). Kokoh dan kuat, melindungi tanah di sekitar kolam.' },
  { id: 'item9', name: 'Anak Sekolah', emoji: '👧', type: 'biotik', x: 65, y: 62, description: 'Biotik (Makhluk hidup). Manusia yang sedang belajar dan bermain dengan ceria!' },
  { id: 'item10', name: 'Tanah Subur', emoji: '🌱', type: 'abiotik', x: 50, y: 88, description: 'Abiotik (Benda tak hidup). Tempat tanaman tumbuh subur dan kokoh berpijak.' }
];

export default function GardenObservation() {
  const [selectedItem, setSelectedItem] = useState<GardenItem | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const handleItemClick = (item: GardenItem) => {
    playClickSound();
    setSelectedItem(item);
    
    if (!discoveredIds.includes(item.id)) {
      const updated = [...discoveredIds, item.id];
      setDiscoveredIds(updated);
      
      // If we just discovered everything
      if (updated.length === GARDEN_ITEMS.length) {
        setTimeout(() => {
          playVictorySound();
        }, 500);
      } else {
        setTimeout(() => {
          playCorrectSound();
        }, 200);
      }
    }
  };

  const handleReset = () => {
    playClickSound();
    setSelectedItem(null);
    setDiscoveredIds([]);
    setShowSummary(false);
  };

  const totalBiotik = GARDEN_ITEMS.filter(i => i.type === 'biotik').length;
  const totalAbiotik = GARDEN_ITEMS.filter(i => i.type === 'abiotik').length;

  const foundBiotik = GARDEN_ITEMS.filter(i => i.type === 'biotik' && discoveredIds.includes(i.id)).length;
  const foundAbiotik = GARDEN_ITEMS.filter(i => i.type === 'abiotik' && discoveredIds.includes(i.id)).length;

  const isAllDiscovered = discoveredIds.length === GARDEN_ITEMS.length;

  return (
    <div id="garden-observation-container" className="flex flex-col min-h-full h-auto md:h-full bg-gradient-to-br from-art-cream to-art-green-light rounded-[24px] md:rounded-[48px] border-3 md:border-4 border-art-green p-4 md:p-5 relative overflow-hidden text-art-green gap-4">
      {/* Header section with instruction and discovery progress */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-3 md:p-3.5 rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green gap-2 shadow-art-handdrawn-sm">
        <div>
          <h3 className="text-xs md:text-base font-black text-art-green flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-art-green animate-bounce" />
            Misi Mengamati Taman Sekolah
          </h3>
          <p className="text-[10px] md:text-xs text-art-green/80 font-bold">
            Temukan dan klik semua benda di taman sekolah! Sebutkan apakah termasuk <b>Biotik</b> atau <b>Abiotik</b>.
          </p>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto justify-between md:justify-end items-center">
          <div className="flex gap-2 text-[10px] md:text-xs font-black">
            <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-art-green text-art-cream rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
              🟢 Biotik: {foundBiotik}/{totalBiotik}
            </span>
            <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-art-accent text-art-green rounded-xl border-2 border-art-green shadow-art-handdrawn-sm">
              🔵 Abiotik: {foundAbiotik}/{totalAbiotik}
            </span>
          </div>
          <button 
            onClick={handleReset}
            className="p-1 md:p-1.5 bg-white text-art-green hover:bg-art-green hover:text-white rounded-xl border-2 border-art-green shadow-art-handdrawn-sm transition-all cursor-pointer"
            title="Ulangi Observasi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 my-auto">
        {/* Interactive Garden Canvas */}
        <div className="lg:col-span-8 relative rounded-2xl md:rounded-3xl border-2 md:border-4 border-art-green overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 h-[240px] sm:h-[320px] md:h-full min-h-[220px] sm:min-h-[280px] shadow-art-handdrawn">
          {/* Clouds passing/sky decor */}
          <div className="absolute top-4 left-10 w-24 h-8 bg-white opacity-80 rounded-full blur-sm"></div>
          <div className="absolute top-8 right-24 w-16 h-6 bg-white opacity-60 rounded-full blur-xs"></div>
          
          {/* Mountains/Hills background */}
          <div className="absolute bottom-20 left-0 right-0 h-24 bg-gradient-to-t from-emerald-200 to-transparent opacity-60 rounded-t-[100px]"></div>
          <div className="absolute bottom-12 left-0 right-0 h-24 bg-emerald-300 rounded-t-[140px] border-t-2 border-emerald-400"></div>
          
          {/* School Ground & Pathway */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-amber-200 skew-y-3"></div>
          
          {/* Garden Items Hotspots */}
          {GARDEN_ITEMS.map((item) => {
            const isDiscovered = discoveredIds.includes(item.id);
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer transition-all duration-300 group
                  ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'}
                `}
              >
                {/* Visual Indicator Ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-500 animate-ping opacity-30
                  ${isDiscovered ? 'hidden' : 'border-4 border-art-accent bg-art-accent'}
                `} />
                
                <div className={`relative p-1.5 md:p-2 rounded-full shadow-art-handdrawn-sm flex items-center justify-center text-2xl md:text-4xl bg-white/75 backdrop-blur-xs transition-colors
                  ${isDiscovered ? 'border-2 md:border-3 border-art-green bg-art-green-light' : 'border-2 md:border-3 border-art-accent hover:bg-white'}
                  ${isSelected ? 'ring-4 ring-art-accent ring-offset-2' : ''}
                `}>
                  <span>{item.emoji}</span>
                  {isDiscovered && (
                    <span className="absolute -top-1 -right-1 bg-art-green text-art-cream rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[8px] md:text-[10px] font-black border border-art-green">
                      ✓
                    </span>
                  )}
                </div>
                
                {/* Small Hover tooltip */}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-art-green text-art-cream text-[10px] font-bold py-1 px-2.5 rounded-lg border-2 border-art-green shadow-art-handdrawn-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap mb-1 z-50">
                  {item.name}
                </span>
              </button>
            );
          })}

          {/* Success Banner overlay when all items are discovered */}
          <AnimatePresence>
            {isAllDiscovered && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-art-green/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-40 text-art-cream"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <CheckCircle className="w-16 h-16 text-art-accent mb-3 mx-auto" />
                </motion.div>
                <h4 className="text-xl md:text-2xl font-black text-art-accent mb-2 uppercase tracking-wide">Hebat! Kamu Detektif Ekosistem! 🕵️‍♂️⭐</h4>
                <p className="text-xs md:text-sm max-w-md mx-auto mb-4 text-art-cream/90 font-bold leading-relaxed">
                  Kamu berhasil mengamati dan mengelompokkan semua makhluk hidup (biotik) dan benda tak hidup (abiotik) di taman sekolah!
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-art-accent hover:bg-white text-art-green font-black rounded-xl border-2 border-art-green shadow-art-handdrawn-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 mx-auto text-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Ulangi Misi
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informational Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-2xl md:rounded-3xl border-2 md:border-3 border-art-green p-3 md:p-4 shadow-art-handdrawn gap-3">
          <div>
            <h4 className="text-[10px] md:text-xs font-black text-art-green border-b border-art-green/20 pb-2 mb-2 md:mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-art-green" />
              Detail Hasil Pengamatan
            </h4>

            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{selectedItem.emoji}</span>
                    <div>
                      <h5 className="text-base font-black text-art-green leading-tight">{selectedItem.name}</h5>
                      <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[10px] font-black mt-1 text-white border border-black uppercase tracking-wider
                        ${selectedItem.type === 'biotik' ? 'bg-art-green' : 'bg-blue-600'}
                      `}>
                        {selectedItem.type === 'biotik' ? '🟢 Biotik' : '🔵 Abiotik'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-art-green/90 bg-art-green-light p-3 rounded-xl border-2 border-art-green font-bold leading-relaxed">
                    {selectedItem.description}
                  </p>

                  <div className="p-2.5 bg-art-cream/60 rounded-xl text-[10px] text-art-green/80 border border-art-green/20 font-bold">
                    <span className="font-extrabold text-art-green">Tahukah kamu?</span> <br />
                    {selectedItem.type === 'biotik' 
                      ? 'Makhluk hidup memerlukan benda abiotik seperti air, tanah, dan cahaya matahari untuk hidup dan tumbuh!' 
                      : 'Benda abiotik merupakan fondasi penting agar makhluk hidup (biotik) di sekitarnya dapat bertahan hidup!'}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-10 text-art-green/40 font-bold">
                  <div className="text-5xl mb-3 animate-pulse">👈</div>
                  <p className="text-xs">Klik salah satu objek di gambar taman sekolah untuk memulainya!</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-art-green/20 pt-3 mt-4">
            <h5 className="text-[10px] font-black text-art-green/70 uppercase tracking-wider mb-2">Daftar Pengamatan kamu:</h5>
            <div className="grid grid-cols-5 gap-1.5">
              {GARDEN_ITEMS.map((item) => {
                const isFound = discoveredIds.includes(item.id);
                return (
                  <button
                    key={`indicator-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className={`p-1.5 rounded-xl text-lg flex items-center justify-center transition-all border-2 cursor-pointer
                      ${isFound 
                        ? 'bg-art-green-light border-art-green grayscale-0 scale-100 hover:scale-105' 
                        : 'bg-slate-50 border-slate-200 grayscale opacity-40 hover:opacity-70 hover:grayscale-50'
                      }
                    `}
                    title={item.name}
                  >
                    {item.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
