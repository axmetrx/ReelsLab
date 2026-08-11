'use client';

import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface StickyBottomCTAProps {
  nextLessonId: string | null;
  courseId: string;
}

export default function StickyBottomCTA({ nextLessonId, courseId }: StickyBottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-3.5">
        {nextLessonId ? (
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-[0.99]"
            onClick={() => {
              console.log('Navigate to next lesson:', nextLessonId);
            }}
          >
            <span>Продолжить обучение</span>
            <ArrowRight size={20} />
          </button>
        ) : (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl py-3.5 px-6 text-base font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={22} className="text-emerald-600" />
            <span>Поздравляем! Курс успешно завершён 🎉</span>
          </div>
        )}
      </div>
    </div>
  );
}
