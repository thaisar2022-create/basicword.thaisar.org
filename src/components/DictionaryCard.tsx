import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { VocabWord } from '../types';
import { speakThai } from '../utils/speech';

interface DictionaryCardProps {
  word: VocabWord;
  isFavorite?: boolean;
  onToggleFavorite?: (wordId: number) => void;
  highlightQuery?: string;
}

export const DictionaryCard: React.FC<DictionaryCardProps> = ({
  word,
  highlightQuery = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakThai(word.thai);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  return (
    <div
      id={`dictionary-word-card-${word.id}`}
      className="bg-white rounded-2xl p-5 border border-purple-100 hover:border-[#4E1261]/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Top Header: Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#4E1261] border border-purple-100">
              {word.category}
            </span>
            {word.partOfSpeech && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                {word.partOfSpeech}
              </span>
            )}
          </div>
        </div>

        {/* Thai Word & Phonetics */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline space-x-3 flex-wrap">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#380946] tracking-wide font-['Prompt',sans-serif]">
              {word.thai}
            </h3>

            {/* Audio Button */}
            <button
              onClick={handlePlayAudio}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                isPlaying
                  ? 'bg-[#4E1261] text-white animate-pulse'
                  : 'bg-purple-50 text-[#4E1261] hover:bg-[#4E1261] hover:text-white border border-purple-200/60'
              }`}
              title="အသံထွက်နားဆင်မည်"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>အသံထွက်</span>
            </button>
          </div>

          {/* Phonetic Pronunciation in Myanmar Script */}
          <div className="flex items-center space-x-2 text-stone-600 flex-wrap gap-y-1">
            <span className="text-xl sm:text-2xl font-bold text-[#4E1261] bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-100">
              အသံထွက်: {word.phonetic}
            </span>
            {word.romanization && (
              <span className="text-base sm:text-lg text-purple-700 font-mono">
                /{word.romanization}/
              </span>
            )}
          </div>
        </div>

        {/* Myanmar Meaning */}
        <div className="pt-2 border-t border-purple-50">
          <span className="text-xs text-stone-400 uppercase tracking-wider block mb-0.5">
            မြန်မာအဓိပ္ပာယ်
          </span>
          <p className="text-stone-900 font-extrabold text-3xl sm:text-4xl leading-snug font-['Padauk',sans-serif]">
            {word.meaning}
          </p>
        </div>
      </div>
    </div>
  );
};
