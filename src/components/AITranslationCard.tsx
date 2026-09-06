import React, { useState } from 'react';
import { Volume2, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { TranslationResult } from '../types';
import { speakThai } from '../utils/speech';

interface AITranslationCardProps {
  originalQuery: string;
  result: TranslationResult | null;
  error?: string | null;
  isLoading: boolean;
  onClear: () => void;
}

export const AITranslationCard: React.FC<AITranslationCardProps> = ({
  originalQuery,
  result,
  error,
  isLoading,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div
        id="ai-translation-loading-card"
        className="bg-white rounded-2xl p-6 border border-purple-200 shadow-sm animate-pulse space-y-4"
      >
        <div className="flex items-center space-x-2 text-[#4E1261] text-sm font-semibold">
          <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
          <span>Gemini AI ဖြင့် အသေးစိတ် ဘာသာပြန်ဆိုနေပါသည်...</span>
        </div>
        <div className="h-6 bg-stone-100 rounded-md w-3/4"></div>
        <div className="h-10 bg-stone-100 rounded-md w-1/2"></div>
        <div className="h-4 bg-stone-100 rounded-md w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        id="ai-translation-error-card"
        className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-900 text-sm space-y-2"
      >
        <div className="flex items-center space-x-2 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>ဘာသာပြန် သတိပေးချက်</span>
        </div>
        <p className="text-amber-800">{error}</p>
        <p className="text-xs text-amber-700">
          မှတ်ချက်: အခြေခံဝေါဟာရ ဇယားထဲရှိ စကားလုံးများကို အင်တာနက်မလိုဘဲ အချိန်မရွေး ရှာဖွေနိုင်ပါသည်။
        </p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isThaiText = (text: string) => /[\u0E00-\u0E7F]/.test(text);

  const handleCopy = () => {
    const textToCopy = `${originalQuery} -> ${result.translatedText}${
      result.phonetic ? ` (${result.phonetic})` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlay = () => {
    // Play the Thai portion (either original or translated)
    if (isThaiText(result.translatedText)) {
      speakThai(result.translatedText);
    } else if (isThaiText(originalQuery)) {
      speakThai(originalQuery);
    }
  };

  return (
    <div
      id="ai-translation-result-card"
      className="bg-gradient-to-br from-white to-purple-50/40 rounded-2xl p-6 border-2 border-purple-300 shadow-md space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-100 text-[#4E1261] rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#380946]">
              AI ဘာသာပြန် အဖြေ (Smart Translation)
            </span>
            <div className="text-xs text-stone-500">
              {result.detectedSource && <span>မူရင်း: {result.detectedSource} ➔ </span>}
              <span>ပစ်မှတ်: {result.targetLanguage || 'ရလဒ်'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#4E1261] text-xs font-semibold transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'ကူးယူပြီး' : 'ကူးယူမည်'}</span>
          </button>
          <button
            onClick={onClear}
            className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1 cursor-pointer"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>

      {/* Primary Comparison Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Text */}
        <div className="p-4 bg-white rounded-xl border border-purple-100 space-y-1">
          <span className="text-xs text-stone-400 font-medium">မူရင်းစကားလုံး / စာကြောင်း</span>
          <p className="text-stone-900 font-bold text-xl leading-relaxed">
            {originalQuery}
          </p>
          {isThaiText(originalQuery) && (
            <button
              onClick={() => speakThai(originalQuery)}
              className="inline-flex items-center space-x-1 text-xs text-[#4E1261] hover:text-[#380946] pt-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>အသံထွက် နားဆင်မည်</span>
            </button>
          )}
        </div>

        {/* Translated Text */}
        <div className="p-4 bg-[#4E1261] text-white rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-purple-200 font-medium">ဘာသာပြန် ရလဒ်</span>
          <p className="text-white font-bold text-2xl leading-relaxed font-['Padauk','Prompt',sans-serif]">
            {result.translatedText}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs text-purple-200">
            {result.phonetic && (
              <span className="bg-purple-800 px-2 py-0.5 rounded-md font-semibold text-amber-300">
                အသံထွက်: {result.phonetic}
              </span>
            )}
            {result.romanization && (
              <span className="font-mono">/{result.romanization}/</span>
            )}
            {isThaiText(result.translatedText) && (
              <button
                onClick={handlePlay}
                className="inline-flex items-center space-x-1 text-xs bg-purple-700 hover:bg-purple-600 px-2.5 py-1 rounded-md text-white font-semibold transition cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>နားဆင်ရန်</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nuance / Explanation */}
      {result.meaningExplanation && (
        <div className="p-3 bg-stone-50 rounded-xl border border-purple-100 text-xs text-stone-700 space-y-1">
          <span className="font-bold text-[#380946] block">💡 အသုံးအနှုန်း ရှင်းလင်းချက်:</span>
          <p>{result.meaningExplanation}</p>
        </div>
      )}

      {/* Word-by-Word Breakdown */}
      {result.breakdown && result.breakdown.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
            စကားလုံးတစ်ခုချင်းစီ အဓိပ္ပာယ်ခွဲခြမ်းမှု (Word Breakdown)
          </span>
          <div className="flex flex-wrap gap-2">
            {result.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white border border-purple-100 shadow-2xs text-xs space-y-0.5"
              >
                <div className="font-bold text-[#380946]">{item.original}</div>
                <div className="text-stone-600 font-medium">{item.translated}</div>
                {item.meaning && (
                  <div className="text-[10px] text-stone-400">({item.meaning})</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {result.examples && result.examples.length > 0 && (
        <div className="space-y-2 border-t border-purple-100 pt-3">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
            နမူနာ စာကြောင်း (Example Usage)
          </span>
          <div className="space-y-2">
            {result.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#380946]">{ex.source}</span>
                  {isThaiText(ex.source) && (
                    <button
                      onClick={() => speakThai(ex.source)}
                      className="text-[#4E1261] hover:text-[#380946] cursor-pointer"
                      title="နားဆင်မည်"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {ex.phonetic && (
                  <div className="text-stone-500 text-[11px]">({ex.phonetic})</div>
                )}
                <div className="text-[#4E1261] font-semibold">{ex.translation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
