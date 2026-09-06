import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VocabWord } from '../types';
import { speakThai } from '../utils/speech';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCcw,
  Trophy,
  ArrowRight,
  Flame,
  Shuffle,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface DailyQuizProps {
  words: VocabWord[];
  onBrowseDictionary?: () => void;
}

interface QuizQuestion {
  word: VocabWord;
  options: string[];
  correctMeaning: string;
}

interface UserAnswerRecord {
  questionIndex: number;
  word: VocabWord;
  selectedMeaning: string;
  isCorrect: boolean;
}

// Generate 20 random questions with 1 correct meaning and 3 distractors
function generateQuiz(wordsPool: VocabWord[], count: number = 20): QuizQuestion[] {
  if (wordsPool.length === 0) return [];
  
  // Shuffle words pool
  const shuffledPool = [...wordsPool].sort(() => Math.random() - 0.5);
  const selectedWords = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

  return selectedWords.map((word) => {
    // Pick 3 distractors with unique meanings
    const otherWords = wordsPool.filter(
      (w) => w.meaning !== word.meaning && w.id !== word.id
    );
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    
    // Ensure distinct distractors
    const distractorMeanings: string[] = [];
    for (const other of shuffledOthers) {
      if (!distractorMeanings.includes(other.meaning)) {
        distractorMeanings.push(other.meaning);
      }
      if (distractorMeanings.length === 3) break;
    }

    const options = [word.meaning, ...distractorMeanings].sort(() => Math.random() - 0.5);

    return {
      word,
      options,
      correctMeaning: word.meaning,
    };
  });
}

export const DailyQuiz: React.FC<DailyQuizProps> = ({ words, onBrowseDictionary }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuiz(words, 20));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<UserAnswerRecord[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [quizRound, setQuizRound] = useState<number>(1);

  // Restart or generate new 20-word quiz
  const handleStartNewQuiz = useCallback(() => {
    const newQuestions = generateQuiz(words, 20);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setCurrentStreak(0);
    setMaxStreak(0);
    setIsQuizCompleted(false);
    setQuizRound((prev) => prev + 1);
  }, [words]);

  // Restart quiz with only the questions answered incorrectly
  const handleRetryMistakes = useCallback(() => {
    const wrongWordIds = new Set(
      answers.filter((a) => !a.isCorrect).map((a) => a.word.id)
    );
    const mistakeWords = words.filter((w) => wrongWordIds.has(w.id));
    if (mistakeWords.length === 0) return;

    const retryQuestions = generateQuiz(mistakeWords, mistakeWords.length);
    setQuestions(retryQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setCurrentStreak(0);
    setIsQuizCompleted(false);
  }, [answers, words]);

  const currentQuestion = questions[currentIndex];

  // Option selection handler with immediate feedback
  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || !currentQuestion) return;

    const isCorrect = option === currentQuestion.correctMeaning;
    setSelectedOption(option);

    // Update streak
    if (isCorrect) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }
    } else {
      setCurrentStreak(0);
    }

    // Record answer
    setAnswers((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        word: currentQuestion.word,
        selectedMeaning: option,
        isCorrect,
      },
    ]);

    // Speak the Thai word pronunciation on selection for reinforcing auditory memory
    speakThai(currentQuestion.word.thai);
  };

  // Advance to next question or complete quiz
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsQuizCompleted(true);
    }
  };

  // Keyboard shortcut listener (1-4 to pick options, Enter/Space for next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isQuizCompleted) return;

      if (selectedOption === null && currentQuestion) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const optIdx = parseInt(e.key, 10) - 1;
          if (currentQuestion.options[optIdx]) {
            handleSelectOption(currentQuestion.options[optIdx]);
          }
        }
      } else if (selectedOption !== null) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizCompleted, selectedOption, currentQuestion, currentIndex, questions.length]);

  // Derived statistics
  const score = useMemo(() => {
    return answers.filter((a) => a.isCorrect).length;
  }, [answers]);

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // COMPLETED SUMMARY VIEW
  if (isQuizCompleted) {
    const incorrectCount = questions.length - score;

    let performanceMessage = 'ဆက်လက်လေ့ကျင့်ပါ! (Keep practicing!)';
    let performanceColor = 'text-stone-700';
    if (percentage >= 90) {
      performanceMessage = 'အလွန်ထူးချွန်ပါသည်! (Outstanding Mastery!) 🏆';
      performanceColor = 'text-[#380946]';
    } else if (percentage >= 75) {
      performanceMessage = 'ကောင်းမွန်သောရလဒ် ဖြစ်ပါသည်! (Great Job!) 🌟';
      performanceColor = 'text-[#4E1261]';
    } else if (percentage >= 50) {
      performanceMessage = 'အတော်အသင့် ကောင်းမွန်ပါသည်! (Good effort!) 👍';
      performanceColor = 'text-amber-800';
    }

    return (
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Score Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 border-2 border-purple-200 text-[#4E1261] rounded-3xl mx-auto flex items-center justify-center shadow-xs">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4E1261] bg-purple-100/70 px-3 py-1 rounded-full">
              Daily Quiz ပြီးဆုံးပါပြီ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 pt-2">
              မေးခွန်း ၂၀ ရလဒ် အကျဉ်းချုပ်
            </h2>
            <p className={`text-base font-semibold ${performanceColor}`}>
              {performanceMessage}
            </p>
          </div>

          {/* Big Score Numbers */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="bg-purple-50/30 border border-purple-100 rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xs text-stone-500 font-medium block">ရမှတ် (Score)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#380946]">
                {score} / {questions.length}
              </span>
            </div>

            <div className="bg-purple-50/30 border border-purple-100 rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xs text-stone-500 font-medium block">ရာခိုင်နှုန်း (%)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#4E1261]">
                {percentage}%
              </span>
            </div>

            <div className="bg-amber-50/30 border border-amber-200 rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xs text-stone-500 font-medium block">အများဆုံး Streak</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 flex items-center justify-center space-x-1">
                <Flame className="w-5 h-5 text-amber-500 inline fill-amber-500" />
                <span>{maxStreak}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="quiz-btn-restart-new"
              onClick={handleStartNewQuiz}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#4E1261] hover:bg-[#3D0E4D] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-amber-300" />
              <span>စကားလုံး ၂၀ အသစ်ဖြင့် ထပ်မံဖြေဆိုမည်</span>
            </button>

            {incorrectCount > 0 && (
              <button
                id="quiz-btn-retry-mistakes"
                onClick={handleRetryMistakes}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>မှားယွင်းခဲ့သော ({incorrectCount}) ခု ပြန်လည်ဖြေဆိုမည်</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#4E1261]" />
              <span>မေးခွန်း ၂၀ စာရင်း အသေးစိတ် စစ်ဆေးရန်</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              မှန် {score} | မှား {incorrectCount}
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {answers.map((ans, idx) => (
              <div
                key={idx}
                className="py-3.5 flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      ans.isCorrect
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-[#380946] font-['Prompt',sans-serif] text-base">
                        {ans.word.thai}
                      </span>
                      <span className="text-xs text-stone-500 font-medium font-['Padauk',sans-serif]">
                        ({ans.word.phonetic})
                      </span>
                      {ans.word.romanization && (
                        <span className="text-[11px] text-purple-700 font-mono">
                          /{ans.word.romanization}/
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-700 font-medium font-['Padauk',sans-serif] mt-0.5">
                      အဓိပ္ပာယ်: <span className="font-bold text-stone-900">{ans.word.meaning}</span>
                      {!ans.isCorrect && (
                        <span className="text-rose-600 ml-2">
                          (သင်ရွေးချယ်ခဲ့သည်: {ans.selectedMeaning})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => speakThai(ans.word.thai)}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-purple-50 text-stone-600 hover:text-[#4E1261] transition flex-shrink-0 cursor-pointer"
                  title="အသံထွက် နားဆင်မည်"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ QUESTION VIEW
  const isAnswered = selectedOption !== null;
  const isCurrentCorrect = isAnswered && selectedOption === currentQuestion.correctMeaning;

  return (
    <div className="max-w-2xl w-full mx-auto space-y-6">
      {/* Top Header Card: Title, Round & Progress */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-[#4E1261] text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#380946] leading-tight">
                Daily Quiz — နေ့စဉ် ဝေါဟာရ စမ်းသပ်ချက်
              </h2>
              <p className="text-xs text-stone-500">
                စကားလုံး ၂၀ ၏ မှန်ကန်သော မြန်မာအဓိပ္ပာယ်ကို တွဲဖက်ရွေးချယ်ပါ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentStreak > 1 && (
              <span className="flex items-center space-x-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full animate-bounce">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{currentStreak} Streak!</span>
              </span>
            )}

            <button
              id="quiz-btn-shuffle"
              onClick={handleStartNewQuiz}
              className="text-xs text-stone-500 hover:text-[#4E1261] font-semibold px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-purple-50 transition flex items-center space-x-1 cursor-pointer"
              title="စကားလုံး ၂၀ အသစ် မွှေမည်"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">မွှေမည်</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500">
            <span>
              မေးခွန်း <span className="font-bold text-[#380946]">{currentIndex + 1}</span> / {questions.length}
            </span>
            <span>
              မှန်ကန်မှု: <span className="font-bold text-[#4E1261]">{score}</span> / {answers.length}
            </span>
          </div>

          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#4E1261] h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          {/* Target Word Section */}
          <div className="text-center space-y-3 pb-2 border-b border-stone-100">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#4E1261] border border-purple-200/60">
                {currentQuestion.word.category}
              </span>
              {currentQuestion.word.partOfSpeech && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {currentQuestion.word.partOfSpeech}
                </span>
              )}
            </div>

            {/* Large Thai Word Display */}
            <div className="pt-2">
              <h3
                id="quiz-target-word"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#380946] font-['Prompt',sans-serif] tracking-wide"
              >
                {currentQuestion.word.thai}
              </h3>
            </div>

            {/* Audio & Listen Button */}
            <div className="flex items-center justify-center space-x-2 pt-1">
              <button
                id="quiz-btn-speak-word"
                onClick={() => speakThai(currentQuestion.word.thai)}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#4E1261] hover:bg-[#3D0E4D] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="ထိုင်းအသံထွက် နားဆင်မည်"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>အသံထွက် နားဆင်မည်</span>
              </button>
            </div>

            <p className="text-xs text-stone-500 font-medium pt-1">
              အောက်ပါ ရွေးချယ်စရာများအနက် မှန်ကန်သော မြန်မာအဓိပ္ပာယ်ကို တွဲဖက်ပါ:
            </p>
          </div>

          {/* 4 Meaning Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, idx) => {
              // Determine visual state
              let btnClass = 'bg-stone-50 hover:bg-purple-50/70 hover:border-purple-200 border-stone-200 text-stone-800';
              let badgeText = `${idx + 1}`;
              let badgeClass = 'bg-stone-200 text-stone-700';

              if (isAnswered) {
                const isThisOptionCorrect = option === currentQuestion.correctMeaning;
                const isThisOptionSelected = option === selectedOption;

                if (isThisOptionCorrect) {
                  // The true correct answer is always highlighted in green
                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs font-bold';
                  badgeClass = 'bg-emerald-600 text-white';
                  badgeText = '✓';
                } else if (isThisOptionSelected && !isThisOptionCorrect) {
                  // The incorrect option chosen by the user
                  btnClass = 'bg-rose-50 border-rose-400 text-rose-950 line-through opacity-90';
                  badgeClass = 'bg-rose-500 text-white';
                  badgeText = '✕';
                } else {
                  // Other unselected options
                  btnClass = 'bg-stone-50/60 border-stone-200 text-stone-400 opacity-60';
                  badgeClass = 'bg-stone-100 text-stone-400';
                }
              }

              return (
                <button
                  key={idx}
                  id={`quiz-option-${idx + 1}`}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`relative w-full p-4 rounded-2xl border text-left font-['Padauk',sans-serif] text-base sm:text-lg transition-all flex items-center space-x-3.5 cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 transition ${badgeClass}`}
                  >
                    {badgeText}
                  </span>
                  <span className="flex-grow font-semibold leading-snug">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback Card (shown immediately after selecting) */}
          {isAnswered && (
            <div
              id="quiz-feedback-box"
              className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
                isCurrentCorrect
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-emerald-800 text-sm">
                          မှန်ကန်ပါသည်! (Correct!)
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        <span className="font-bold text-rose-800 text-sm">
                          မှားယွင်းပါသည် (Incorrect) — အဖြေမှန်: {currentQuestion.correctMeaning}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-stone-700 pt-1 space-y-0.5">
                    <p className="font-medium">
                      အသံထွက်: <span className="font-bold text-[#4E1261] font-['Padauk',sans-serif]">({currentQuestion.word.phonetic})</span>
                      {currentQuestion.word.romanization && (
                        <span className="font-mono text-purple-700 ml-2">
                          /{currentQuestion.word.romanization}/
                        </span>
                      )}
                    </p>
                    <p className="font-['Padauk',sans-serif]">
                      မြန်မာအဓိပ္ပာယ်: <span className="font-bold text-stone-900">{currentQuestion.word.meaning}</span>
                    </p>
                  </div>
                </div>

                <button
                  id="quiz-btn-next-question"
                  onClick={handleNextQuestion}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-[#4E1261] hover:bg-[#3D0E4D] text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <span>
                    {currentIndex < questions.length - 1 ? 'နောက်မေးခွန်းသို့' : 'ရလဒ် ကြည့်မည်'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Keyboard tip */}
          <div className="text-center text-[11px] text-stone-400">
            {!isAnswered ? (
              <span>
                💡 ကီးဘုတ်မှ နံပါတ် <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded font-mono text-stone-600">1</kbd> မှ <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded font-mono text-stone-600">4</kbd> ကို နှိပ်၍ အဖြေရွေးချယ်နိုင်ပါသည်။
              </span>
            ) : (
              <span>
                💡 <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded font-mono text-stone-600">Enter</kbd> သို့မဟုတ် <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded font-mono text-stone-600">Space</kbd> နှိပ်၍ နောက်မေးခွန်းသို့ တိုက်ရိုက်ကူးပြောင်းနိုင်ပါသည်။
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
