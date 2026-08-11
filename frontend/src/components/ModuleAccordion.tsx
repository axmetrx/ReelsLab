'use client';

import React from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { Module, Lesson } from '@/types/course';
import LessonItem from './LessonItem';
import ProgressBar from './ProgressBar';

interface ModuleAccordionProps {
  module: Module;
  courseId: string;
  isOpen: boolean;
  onToggle: () => void;
  onLessonComplete: (lessonId: string) => void;
  activeLessonId: string | null;
}

export default function ModuleAccordion({
  module,
  courseId,
  isOpen,
  onToggle,
  onLessonComplete,
  activeLessonId,
}: ModuleAccordionProps) {
  const isCompleted = module.completedCount === module.totalCount && module.totalCount > 0;
  const progressPercent = module.totalCount > 0
    ? Math.round((module.completedCount / module.totalCount) * 100)
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
      {/* Шапка модуля */}
      <button
        type="button"
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/80 cursor-pointer"
        onClick={onToggle}
      >
        {/* Номер модуля */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={18} /> : module.order}
        </div>

        {/* Заголовок и счетчик */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {module.title}
          </h3>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold text-slate-500">
              Пройдено {module.completedCount} из {module.totalCount} уроков
            </span>

            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Завершён ✓
              </span>
            )}
          </div>

          {!isCompleted && (
            <div className="mt-2.5 max-w-[180px]">
              <ProgressBar percent={progressPercent} size="sm" />
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0 pt-1">
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Список уроков */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              onComplete={onLessonComplete}
              isActive={activeLessonId === lesson.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
