import React, { useState, useEffect } from 'react';
import { VocabWord, WordCategory } from '../types';
import { CATEGORIES } from '../data/dictionary';
import { Volume2, Shuffle, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { speakThai } from '../utils/speech';

interface FlashcardDeckProps {
  words: VocabWord[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ words }) => {
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>('all');
  const [deck, setDeck] = useState<VocabWord[]>(() => [...words]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Handle category change
  const handleCategoryChange = (cat: WordCategory) => {
    setSelectedCategory(cat);
    const filtered = cat === 'all' ? [...words] : words.filter((w) => w.catId === cat);
    setDeck(filtered.length > 0 ? filtered : [...words]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    }, 150);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck.length]);

  const currentWord = deck[currentIndex] || deck[0];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header & Category select */}
      <div className="bg-white p-5 rounded-2xl border border-purple-100 text-center space-y-3 shadow-xs">
        <h2 className="text-xl font-bold text-[#380946]">
          🎴 စကားလုံး လေ့ကျင့်ရေး မှတ်ဉာဏ်ကတ် (Flashcards)
        </h2>
        <p className="text-xs text-stone-600">
          ရှေ့မျက်နှာပြင်တွင် မြန်မာစကားလုံးကို အရင်ပြသထားပါသည်။ ကတ်ကို နှိပ်၍ ထိုင်းဘာသာပြန်၊ ထိုင်းစာလုံးပေါင်းနှင့် Romanized အသံထွက်ကို လေ့ကျင့်နိုင်ပါသည်။
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <label htmlFor="flashcard-category-select" className="text-xs font-semibold text-stone-600">
            အမျိုးအစား:
          </label>
          <select
            id="flashcard-category-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as WordCategory)}
            className="text-xs py-2 px-3 rounded-xl border border-purple-200 bg-purple-50/40 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-[#4E1261] cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameMyanmar} ({c.id === 'all' ? words.length : words.filter((w) => w.catId === c.id).length})
              </option>
            ))}
          </select>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-[#4E1261] h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard */}
      {currentWord && (
        <div
          className="perspective-1000 w-full min-h-[380px] h-[380px] cursor-pointer select-none"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`w-full h-full relative transition-transform duration-500 transform-style-3d rounded-3xl shadow-md ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT: Burmese word/phrase (shown first) */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-[#3B0748] via-[#4E1261] to-[#250330] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center border-2 border-purple-800/80 shadow-md">
              <div className="w-full flex justify-between items-center text-xs text-purple-200">
                <span className="bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-700/60 font-medium text-amber-300">
                  {currentWord.category}
                </span>
                <span className="font-mono text-purple-200 font-semibold">
                  {currentIndex + 1} / {deck.length}
                </span>
              </div>

              <div className="my-auto space-y-3 max-w-md w-full">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-normal leading-snug sm:leading-tight text-white font-['Padauk',sans-serif]">
                  {currentWord.meaning}
                </h3>
                {currentWord.partOfSpeech && (
                  <span className="inline-block text-xs bg-purple-950/70 text-purple-200 px-3 py-1 rounded-full font-medium border border-purple-700/40">
                    {currentWord.partOfSpeech}
                  </span>
                )}
                {currentWord.exampleMyanmar && (
                  <p className="text-xs text-purple-200/80 italic line-clamp-1 pt-1">
                    "{currentWord.exampleMyanmar}"
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-amber-300/90 font-medium">
                <RotateCw className="w-3.5 h-3.5 animate-pulse" />
                <span>ကတ်ကို နှိပ်၍ ထိုင်းဘာသာပြန်နှင့် အသံထွက်ကို ကြည့်ပါ</span>
              </div>
            </div>

            {/* BACK: Thai translation along with Thai script and Romanized pronunciation */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white text-stone-900 rounded-3xl p-6 sm:p-7 flex flex-col justify-between items-center text-center border-2 border-amber-400 shadow-lg">
              <div className="w-full flex justify-between items-center text-xs text-stone-500">
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                  ထိုင်းဘာသာပြန် (Thai Translation)
                </span>
                <span className="font-mono text-stone-400 font-semibold">
                  {currentIndex + 1} / {deck.length}
                </span>
              </div>

              <div className="my-auto space-y-2.5 max-w-md w-full">
                {/* Thai Script */}
                <h3 className="text-4xl sm:text-5xl font-bold text-[#380946] font-['Prompt',sans-serif] tracking-wide">
                  {currentWord.thai}
                </h3>

                {/* Romanized Pronunciation & Burmese Phonetics */}
                <div className="space-y-1 pt-1">
                  {currentWord.romanization && (
                    <div className="text-sm sm:text-base font-bold text-amber-800 font-mono tracking-wide bg-amber-50 py-1 px-3 rounded-lg inline-block border border-amber-200/60">
                      Romanized: /{currentWord.romanization}/
                    </div>
                  )}
                  <p className="text-sm sm:text-base text-stone-700 font-medium font-['Padauk',sans-serif]">
                    အသံထွက်: <span className="font-semibold text-[#4E1261]">({currentWord.phonetic})</span>
                  </p>
                </div>

                {/* Audio Button */}
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakThai(currentWord.thai);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#4E1261] hover:bg-[#3D0E4D] text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
                    title="ထိုင်းအသံထွက် နားဆင်မည်"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>အသံထွက် နားဆင်မည် (Listen)</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-stone-400 flex items-center space-x-1 font-medium">
                <RotateCw className="w-3 h-3" />
                <span>ပြန်လှည့်ရန် နှိပ်ပါ (Tap to flip back)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-purple-50/50 text-stone-700 font-bold border border-purple-100 text-sm flex items-center justify-center space-x-1 transition shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>အရှေ့သို့ (Prev)</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#4E1261] border border-purple-200 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
          title="ကတ်လှန်မည်"
        >
          <RotateCw className="w-4 h-4" />
          <span className="hidden sm:inline">ကတ်လှန်မည်</span>
        </button>

        <button
          onClick={handleShuffle}
          className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
          title="ကတ်များ မွှေမည်"
        >
          <Shuffle className="w-4 h-4" />
          <span className="hidden sm:inline">မွှေမည်</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl bg-[#4E1261] hover:bg-[#3D0E4D] text-white font-bold text-sm flex items-center justify-center space-x-1 transition shadow-xs cursor-pointer"
        >
          <span>နောက်တစ်ခု (Next)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center text-[11px] text-stone-400">
        💡 ကီးဘုတ်သုံးစွဲသူများ: <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded text-stone-600 font-mono">Space</kbd> ဖြင့် ကတ်လှန်နိုင်ပြီး <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded text-stone-600 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded text-stone-600 font-mono">→</kbd> ဖြင့် ရှေ့/နောက် ရွှေ့နိုင်ပါသည်။
      </div>
    </div>
  );
};
