import React from 'react';
import { BookOpen, Layers, Award } from 'lucide-react';

interface HeaderProps {
  activeTab: 'search' | 'dictionary' | 'flashcards' | 'quiz' | 'favorites';
  setActiveTab: (tab: 'search' | 'dictionary' | 'flashcards' | 'quiz' | 'favorites') => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-purple-100/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & App Title */}
          <div
            id="app-header-brand"
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('dictionary')}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-purple-50/50 border border-purple-200/80 shadow-xs flex items-center justify-center flex-shrink-0 p-1 group-hover:scale-105 transition-transform duration-200">
              <img
                src="https://lh3.googleusercontent.com/pw/AP1GczN01qsKKBoF8MQL1HFzgXZpd8xkRpGvjngMxSlYtrkui_AYVQZEpQa8k8gvH0TrDsD6tbPAQHBOdd9TTdX4UogBgvwQ2VSARghRi1WMUas35ysIOcs=w2400"
                alt="Thaisar Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-[#380946] text-base sm:text-lg tracking-tight">
                  Thaisar
                </h1>
                <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 bg-purple-100 text-[#4E1261] border border-purple-200/70 rounded-full">
                  ထိုင်းစာ
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                ထိုင်းဘာသာစကားသင်တန်းကျောင်း
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-tab-dictionary"
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'bg-[#4E1261] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-purple-50 hover:text-[#4E1261]'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'dictionary' ? 'text-amber-300' : ''}`} />
              <span className="hidden xs:inline">ဝေါဟာရများ</span>
            </button>

            <button
              id="nav-tab-flashcards"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'bg-[#4E1261] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-purple-50 hover:text-[#4E1261]'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'flashcards' ? 'text-amber-300' : ''}`} />
              <span className="hidden sm:inline">Flashcards</span>
            </button>

            <button
              id="nav-tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-[#4E1261] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-purple-50 hover:text-[#4E1261]'
              }`}
            >
              <Award className={`w-4 h-4 ${activeTab === 'quiz' ? 'text-amber-300' : ''}`} />
              <span className="hidden sm:inline">Daily Quiz</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
