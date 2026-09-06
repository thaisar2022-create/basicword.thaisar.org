import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DictionaryCard } from './components/DictionaryCard';
import { VocabBrowser } from './components/VocabBrowser';
import { FlashcardDeck } from './components/FlashcardDeck';
import { DailyQuiz } from './components/DailyQuiz';
import { VOCABULARY_DATA } from './data/dictionary';
import { Trash2, Bookmark } from 'lucide-react';

export default function App() {
  // Navigation - default to dictionary view
  const [activeTab, setActiveTab] = useState<'search' | 'dictionary' | 'flashcards' | 'quiz' | 'favorites'>('dictionary');

  // Favorites (persisted in localStorage)
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('thai_my_favs');
      return saved ? new Set(JSON.parse(saved)) : new Set([101, 102, 1, 74]);
    } catch {
      return new Set([101, 102, 1, 74]);
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('thai_my_favs', JSON.stringify(Array.from(favorites)));
    } catch (e) {
      console.warn('Could not save favorites', e);
    }
  }, [favorites]);

  const toggleFavorite = (wordId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const favoriteWords = useMemo(() => {
    return VOCABULARY_DATA.filter((w) => favorites.has(w.id));
  }, [favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7FB] text-stone-800 selection:bg-purple-100 selection:text-[#4E1261]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.size}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* VIEW: VOCABULARY BROWSER / 120 NOUN WORDS */}
        {(activeTab === 'dictionary' || activeTab === 'search') && (
          <div className="space-y-6">
            {/* Hero / Welcome Intro */}
            <div id="hero-intro-section" className="text-center max-w-2xl mx-auto space-y-2 pt-2">
              <h2 id="hero-heading" className="text-2xl sm:text-3xl font-extrabold text-[#380946] tracking-tight">
                မသိမဖြစ်ထိုင်းစာလုံး <span className="block sm:inline">(၁၂၀) လုံး</span>
              </h2>
            </div>

            <VocabBrowser
              words={VOCABULARY_DATA}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}

        {/* VIEW 3: FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <FlashcardDeck words={VOCABULARY_DATA} />
        )}

        {/* VIEW: DAILY QUIZ */}
        {activeTab === 'quiz' && (
          <DailyQuiz
            words={VOCABULARY_DATA}
            onBrowseDictionary={() => setActiveTab('dictionary')}
          />
        )}

        {/* VIEW 4: FAVORITES / BOOKMARKS */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                  <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>မှတ်သားထားသော ဝေါဟာရများ ({favoriteWords.length})</span>
                </h2>
                <p className="text-xs text-stone-500">
                  မိမိ သီးသန့် လေ့လာရန် သိမ်းဆည်းထားသော ထိုင်း-မြန်မာ စကားလုံးများ
                </p>
              </div>

              {favoriteWords.length > 0 && (
                <button
                  onClick={() => setFavorites(new Set())}
                  className="text-xs text-stone-400 hover:text-rose-600 flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>အားလုံး ရှင်းလင်းမည်</span>
                </button>
              )}
            </div>

            {favoriteWords.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-purple-100 text-stone-500 space-y-3 shadow-xs">
                <Bookmark className="w-8 h-8 text-purple-200 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">မှတ်သားထားသော ဝေါဟာရ မရှိသေးပါ</p>
                <p className="text-xs text-stone-400">
                  စကားလုံးကတ်များရှိ အမှတ်အသား (Bookmark) အိုင်ကွန်ကို နှိပ်၍ ဤနေရာတွင် စုစည်းနိုင်ပါသည်
                </p>
                <button
                  onClick={() => setActiveTab('dictionary')}
                  className="px-4 py-2 bg-[#4E1261] hover:bg-[#3D0E4D] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  ဝေါဟာရများ သွားရောက်ကြည့်မည်
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteWords.map((word) => (
                  <DictionaryCard
                    key={word.id}
                    word={word}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-purple-100 py-6 mt-12 text-center text-xs text-stone-500 space-y-1">
        <div className="max-w-5xl mx-auto px-4">
          <p className="font-semibold text-[#380946]">
            ထိုင်း - မြန်မာ ဘာသာပြန်နှင့် အသံထွက် ဝေါဟာရ လေ့လာရေး အပလီကေးရှင်း
          </p>
          <p className="text-stone-400 text-[11px]">
            Thaisar — Thai-Myanmar Words Translation & Learning Portal with Speech Pronunciation
          </p>
        </div>
      </footer>
    </div>
  );
}
