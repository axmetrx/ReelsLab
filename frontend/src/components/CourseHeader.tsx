'use client';

import React from 'react';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface CourseHeaderProps {
  courseTitle: string;
  tariff: string;
  progressPercent: number;
  accessExpiresAt: string;
  totalLessons: number;
  completedLessons: number;
}

export default function CourseHeader({
  courseTitle,
  tariff,
  progressPercent,
  accessExpiresAt,
  totalLessons,
  completedLessons,
}: CourseHeaderProps) {
  const dateObj = new Date(accessExpiresAt);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : accessExpiresAt;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Название курса и Бейдж */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          {courseTitle}
        </h1>

        <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
          {tariff}
        </span>
      </div>

      {/* Индикатор прогресса */}
      <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            Прогресс прохождения
          </span>
          <span className="text-base font-extrabold text-blue-600 tabular-nums">
            {progressPercent}%
          </span>
        </div>

        <ProgressBar percent={progressPercent} size="lg" />

        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-slate-400" />
            <span>Пройдено <strong>{completedLessons}</strong> из <strong>{totalLessons}</strong> уроков</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            <span>Доступ до {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
