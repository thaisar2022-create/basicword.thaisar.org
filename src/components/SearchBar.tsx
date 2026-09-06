import React, { useRef } from 'react';
import { Search, X, ArrowLeftRight, Sparkles, Volume2 } from 'lucide-react';
import { TranslationDirection } from '../types';
import { speakThai } from '../utils/speech';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  direction: TranslationDirection;
  setDirection: (direction: TranslationDirection) => void;
  onClear: () => void;
  onTranslateAI?: () => void;
  isAiLoading?: boolean;
  onSelectSuggestion: (text: string) => void;
}

const QUICK_SUGGESTIONS = [
  { label: 'สวัสดี (မင်္ဂလာပါ)', val: 'สวัสดี' },
  { label: 'ขอบคุณ (ကျေးဇူးတင်ပါတယ်)', val: 'ขอบคุณ' },
  { label: 'ไก่ (ကြက်)', val: 'ไก่' },
  { label: 'ข้าวผัด (ထမင်းကြော်)', val: 'ข้าวผัด' },
  { label: 'เท่าไหร่ (ဘယ်လောက်လဲ)', val: 'เท่าไหร่' },
  { label: 'ห้องน้ำ (သန့်စင်ခန်း)', val: 'ห้องน้ำ' },
  { label: 'อร่อย (အရသာရှိတယ်)', val: 'อร่อย' },
  { label: 'น้ำเปล่า (ရေသန့်)', val: 'น้ำเปล่า' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  direction,
  setDirection,
  onClear,
  onTranslateAI,
  isAiLoading = false,
  onSelectSuggestion,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDirection = () => {
    if (direction === 'auto') {
      setDirection('th-my');
    } else if (direction === 'th-my') {
      setDirection('my-th');
    } else {
      setDirection('auto');
    }
  };

  const getDirectionBadge = () => {
    if (direction === 'th-my') {
      return {
        label: '🇹🇭 ไทย ➔ 🇲🇲 မြန်မာ',
        sub: 'ထိုင်းမှ မြန်မာသို့',
      };
    }
    if (direction === 'my-th') {
      return {
        label: '🇲🇲 မြန်မာ ➔ 🇹🇭 ไทย',
        sub: 'မြန်မာမှ ထိုင်းသို့',
      };
    }
    return {
      label: '🔀 Auto-Detect',
      sub: 'အလိုအလျောက်',
    };
  };

  const dirBadge = getDirectionBadge();

  return (
    <div className="w-full space-y-3">
      {/* Direction and Quick Status Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-stone-500 font-medium">ဘာသာပြန် လားရာ:</span>
          <button
            id="btn-toggle-direction"
            onClick={toggleDirection}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-100 hover:border-[#4E1261] text-stone-800 hover:text-[#4E1261] font-semibold shadow-xs transition"
            title="Click to switch translation direction"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#4E1261]" />
            <span>{dirBadge.label}</span>
            <span className="text-stone-400 font-normal">({dirBadge.sub})</span>
          </button>
        </div>

        <span className="text-stone-400 hidden sm:inline-block">
          💡 စကားလုံး၊ အသံထွက် သို့မဟုတ် စာကြောင်းများ ရိုက်ထည့်၍ ရှာဖွေနိုင်ပါသည်
        </span>
      </div>

      {/* Main Search Input Box */}
      <div className="relative flex items-center shadow-sm rounded-2xl bg-white border-2 border-purple-100 focus-within:border-[#4E1261] focus-within:ring-4 focus-within:ring-purple-700/10 transition duration-150">
        <div className="pl-4 sm:pl-5 text-stone-400 pointer-events-none flex items-center">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
        </div>

        <input
          ref={inputRef}
          id="main-translation-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onTranslateAI && searchQuery.trim()) {
              onTranslateAI();
            }
          }}
          placeholder="ထိုင်းစာ၊ မြန်မာစာ သို့မဟုတ် အသံထွက် ရိုက်ထည့်ပါ... (e.g. สวัสดี, ကြက်, ကိုင်, gai)"
          className="w-full py-3.5 sm:py-4 px-3 sm:px-4 text-stone-900 placeholder:text-stone-400 focus:outline-none text-base sm:text-lg font-medium bg-transparent"
        />

        <div className="flex items-center pr-3 space-x-1 sm:space-x-2">
          {searchQuery && (
            <>
              {/* Pronunciation button for Thai text in input */}
              <button
                id="btn-speak-input"
                onClick={() => speakThai(searchQuery)}
                title="ထိုင်းအသံထွက် နားဆင်မည်"
                className="p-2 text-stone-400 hover:text-[#4E1261] hover:bg-purple-50 rounded-xl transition"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Clear button */}
              <button
                id="btn-clear-search-input"
                onClick={() => {
                  onClear();
                  inputRef.current?.focus();
                }}
                title="ရှင်းလင်းမည်"
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* AI Translate button if text is entered */}
          {searchQuery.trim() && onTranslateAI && (
            <button
              id="btn-submit-ai-translate"
              onClick={onTranslateAI}
              disabled={isAiLoading}
              className="flex items-center space-x-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#4E1261] hover:bg-[#3D0E4D] active:scale-98 text-white font-semibold text-xs sm:text-sm shadow-xs transition disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span>{isAiLoading ? 'ဘာသာပြန်နေသည်...' : 'AI ဘာသာပြန်'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Search Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none text-xs">
        <span className="text-stone-400 flex-shrink-0 font-medium">နမူနာများ:</span>
        {QUICK_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(item.val)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-purple-100 hover:text-[#4E1261] text-stone-600 font-medium transition cursor-pointer border border-stone-200/70"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
