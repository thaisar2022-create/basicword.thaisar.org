import React, { useState, useMemo } from 'react';
import { VocabWord, WordCategory } from '../types';
import { CATEGORIES } from '../data/dictionary';
import { DictionaryCard } from './DictionaryCard';
import {
  LayoutGrid,
  List,
  Volume2,
  Smile,
  Fish,
  Carrot,
  Apple,
  Utensils,
  Coffee,
  Users,
  Compass,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  FolderOpen,
} from 'lucide-react';
import { speakThai } from '../utils/speech';

interface VocabBrowserProps {
  words: VocabWord[];
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  onSelectWordForSearch: (word: string) => void;
}

const getCategoryIcon = (id: WordCategory) => {
  switch (id) {
    case 'greetings':
      return <Smile className="w-5 h-5 text-[#4E1261]" />;
    case 'meat':
      return <Fish className="w-5 h-5 text-[#4E1261]" />;
    case 'veg':
      return <Carrot className="w-5 h-5 text-[#4E1261]" />;
    case 'fruit':
      return <Apple className="w-5 h-5 text-[#4E1261]" />;
    case 'food':
      return <Utensils className="w-5 h-5 text-[#4E1261]" />;
    case 'drink':
      return <Coffee className="w-5 h-5 text-[#4E1261]" />;
    case 'people':
      return <Users className="w-5 h-5 text-[#4E1261]" />;
    case 'travel':
      return <Compass className="w-5 h-5 text-[#4E1261]" />;
    case 'numbers':
      return <DollarSign className="w-5 h-5 text-[#4E1261]" />;
    case 'emergency':
      return <ShieldAlert className="w-5 h-5 text-[#4E1261]" />;
    default:
      return <FolderOpen className="w-5 h-5 text-[#4E1261]" />;
  }
};

export const VocabBrowser: React.FC<VocabBrowserProps> = ({
  words,
  favorites,
  onToggleFavorite,
  onSelectWordForSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const isBrowsingAllGroups = selectedCategory === 'all';

  const filteredWords = useMemo(() => {
    if (isBrowsingAllGroups) {
      return [];
    }
    return words.filter((w) => w.catId === selectedCategory);
  }, [words, selectedCategory, isBrowsingAllGroups]);

  return (
    <div className="space-y-6">
      {/* Content Rendering: Either Group Cards Directory OR Individual Group Words */}
      {isBrowsingAllGroups ? (
        <div id="category-groups-directory" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span className="font-semibold text-[#380946]">
              အုပ်စုအလိုက် ဝေါဟာရများ (၁၀ အုပ်စု - စုစုပေါင်း ၁၂၀ လုံး)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.filter((cat) => cat.id !== 'all').map((cat) => {
              const catWords = words.filter((w) => w.catId === cat.id);
              return (
                <div
                  key={cat.id}
                  id={`category-group-card-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-left bg-white p-5 rounded-2xl border border-purple-100 hover:border-[#4E1261] hover:shadow-md transition group cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-[#4E1261] transition">
                        {getCategoryIcon(cat.id)}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#4E1261] border border-purple-100">
                        {catWords.length} လုံး
                      </span>
                    </div>

                    <div>
                      <h3 className="text-3xl font-extrabold text-[#380946] group-hover:text-[#4E1261] transition leading-snug">
                        {cat.nameMyanmar}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-50 text-xs font-semibold text-[#4E1261]">
                    <span>စကားလုံးများ ကြည့်မည်</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <p className="text-base font-semibold text-stone-700">ကိုက်ညီသော ဝေါဟာရ မရှိပါ</p>
          <p className="text-xs text-stone-400">
            အခြား ရှာဖွေမှုစကားလုံး စမ်းသပ်ပါ သို့မဟုတ် ကဏ္ဍအားလုံးသို့ ပြန်သွားပါ
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-2 px-4 py-2 bg-[#4E1261] hover:bg-[#3D0E4D] text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            အုပ်စုများ အားလုံးသို့ ပြန်သွားမည်
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Category Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <div className="flex items-center space-x-2">
              <button
                id="back-to-groups-btn"
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center space-x-2.5 text-2xl sm:text-3xl font-extrabold text-[#4E1261] hover:underline cursor-pointer bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-2xl transition border border-purple-200 shadow-xs"
              >
                <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                <span>အုပ်စုများသို့ ပြန်သွားမည်</span>
              </button>
              {selectedCategory !== 'all' && (
                <span className="text-lg sm:text-xl font-bold text-[#380946] ml-2">
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.nameMyanmar} ({filteredWords.length} လုံး)
                </span>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#4E1261] shadow-2xs'
                    : 'text-stone-500 hover:text-[#4E1261]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#4E1261] shadow-2xs'
                    : 'text-stone-500 hover:text-[#4E1261]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word) => (
                <DictionaryCard
                  key={word.id}
                  word={word}
                  isFavorite={favorites.has(word.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-purple-50/50 border-b border-purple-100 text-xs font-bold text-[#4E1261] uppercase">
                      <th className="p-3.5 text-center w-12">#</th>
                      <th className="p-3.5">ထိုင်းစာ (Thai)</th>
                      <th className="p-3.5">အသံထွက် (Phonetics)</th>
                      <th className="p-3.5">မြန်မာအဓိပ္ပာယ် (Meaning)</th>
                      <th className="p-3.5">ကဏ္ဍ (Category)</th>
                      <th className="p-3.5 text-center w-28">အသံထွက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50/70">
                    {filteredWords.map((word, idx) => (
                      <tr
                        key={word.id}
                        className="hover:bg-purple-50/40 transition cursor-pointer"
                        onClick={() => onSelectWordForSearch(word.thai)}
                      >
                        <td className="p-3.5 text-center text-xs font-mono text-stone-400">
                          {idx + 1}
                        </td>
                        <td className="p-3.5 font-bold text-[#380946] text-base font-['Prompt',sans-serif]">
                          {word.thai}
                        </td>
                        <td className="p-3.5 text-stone-700 font-medium">
                          {word.phonetic}{' '}
                          {word.romanization && (
                            <span className="text-xs text-purple-700 font-mono">
                              /{word.romanization}/
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-stone-900 font-semibold font-['Padauk',sans-serif]">
                          {word.meaning}
                        </td>
                        <td className="p-3.5">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-[#4E1261] border border-purple-100">
                            {word.category}
                          </span>
                        </td>
                        <td
                          className="p-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => speakThai(word.thai)}
                            className="p-2 rounded-lg bg-purple-50 hover:bg-[#4E1261] text-[#4E1261] hover:text-white transition inline-flex items-center cursor-pointer"
                            title="အသံနားဆင်မည်"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

