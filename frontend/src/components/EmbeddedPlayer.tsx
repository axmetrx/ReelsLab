'use client';

import React from 'react';
import { Play, CheckCircle2, ShieldCheck, Film, Sparkles } from 'lucide-react';
import { Lesson } from '@/types/course';

interface EmbeddedPlayerProps {
  lesson: Lesson | null;
  onComplete: (lessonId: string) => void;
}

export default function EmbeddedPlayer({ lesson, onComplete }: EmbeddedPlayerProps) {
  if (!lesson) {
    return (
      <div className="bg-slate-900 rounded-3xl aspect-video w-full flex flex-col items-center justify-center text-white p-6 mb-6 shadow-md border border-slate-800">
        <Film size={40} className="text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-400">Выберите видеоурок из программы снизу</p>
      </div>
    );
  }

  const isVideo = lesson.type === 'VIDEO';
  const videoSrc = lesson.videoUrl && lesson.videoUrl.length > 5
    ? lesson.videoUrl
    : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md mb-6 animate-fade-in-up">
      {/* 1. ПЛЕЕР ВИДЕОУРОКА */}
      {isVideo ? (
        <div className="relative aspect-video bg-black w-full overflow-hidden group">
          <video
            key={lesson.id}
            controls
            autoPlay
            controlsList="nodownload"
            onEnded={() => onComplete(lesson.id)}
            src={videoSrc}
            className="w-full h-full object-contain"
          />
          {/* Водяной знак защиты */}
          <div className="absolute top-3 right-3 pointer-events-none bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white/80 border border-white/10 flex items-center gap-1">
            <ShieldCheck size={12} className="text-blue-400" />
            <span>ReelsLab Protected Stream</span>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 text-center border-b border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 shadow-sm font-bold text-xl">
            ✍️
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{lesson.title}</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {lesson.type === 'HOMEWORK'
              ? 'Практическое домашнее задание. Выполните проект и нажмите «Отметить пройденным».'
              : 'Учебные материалы и файлы для скачивания к модулю.'}
          </p>
        </div>
      )}

      {/* 2. ИНФОРМАЦИЯ И КНОПКА ЗАВЕРШЕНИЯ */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {isVideo ? 'Видеоурок' : lesson.type === 'HOMEWORK' ? 'Задание' : 'Материал'}
            </span>
            {lesson.duration && (
              <span className="text-xs font-semibold text-slate-400">
                {Math.round(lesson.duration / 60)} минут
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {lesson.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onComplete(lesson.id)}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0 active:scale-95 ${
            lesson.isCompleted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <CheckCircle2 size={18} />
          <span>{lesson.isCompleted ? 'Урок пройден ✓' : 'Отметить пройденным'}</span>
        </button>
      </div>
    </div>
  );
}
