'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Play, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Lesson } from '@/types/course';

interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  onComplete: (id: string) => void;
  isActive: boolean;
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const min = Math.round(seconds / 60);
  return `${min} мин`;
}

export default function LessonItem({ lesson, courseId, onComplete, isActive }: LessonItemProps) {
  const router = useRouter();

  const iconMap: Record<string, React.ReactNode> = {
    VIDEO: <Play size={16} className="fill-current" />,
    HOMEWORK: <FileText size={16} />,
    FILE: <Download size={16} />,
  };

  const typeLabel: Record<string, string> = {
    VIDEO: 'Видеоурок',
    HOMEWORK: 'Задание',
    FILE: 'Материал',
  };

  const icon = iconMap[lesson.type] || iconMap.VIDEO;
  const label = typeLabel[lesson.type] || 'Урок';
  const duration = formatDuration(lesson.duration);
  const completed = lesson.isCompleted;

  const handleClick = () => {
    // Всегда переходим на отдельную страницу урока
    router.push(`/course/${courseId}/lesson/${lesson.id}`);
  };

  return (
    <button
      type="button"
      className={`w-full text-left flex items-center gap-3.5 px-4 py-3.5 transition-all duration-150 group border-l-4 ${
        isActive
          ? 'bg-blue-50/80 border-blue-600'
          : 'bg-white border-transparent hover:bg-slate-50'
      }`}
      onClick={handleClick}
    >
      {/* Иконка типа урока */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold ${
          completed
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
        }`}
      >
        {icon}
      </div>

      {/* Название урока и мета-информация */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-[15px] font-semibold leading-snug truncate ${
            completed
              ? 'text-slate-500'
              : isActive
              ? 'text-blue-900 font-bold'
              : 'text-slate-900'
          }`}
        >
          {lesson.title}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          {duration && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[12px] text-slate-500">{duration}</span>
            </>
          )}
        </div>
      </div>

      {/* Индикатор выполнения */}
      <div className="shrink-0 pl-2">
        {completed ? (
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-bold">
            <CheckCircle2 size={16} />
            <span className="hidden sm:inline">Пройдено</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={12} className="fill-current" />
            <span>Открыть</span>
          </div>
        )}
      </div>
    </button>
  );
}
