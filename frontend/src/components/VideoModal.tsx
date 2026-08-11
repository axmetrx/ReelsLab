'use client';

import React from 'react';
import { X, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { Lesson } from '@/types/course';

interface VideoModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onComplete: (lessonId: string) => void;
}

export default function VideoModal({ lesson, onClose, onComplete }: VideoModalProps) {
  if (!lesson) return null;

  // Видео по умолчанию для демонстрации, если у урока ещё нет загруженного файла
  const videoSrc = lesson.videoUrl && lesson.videoUrl.startsWith('http')
    ? lesson.videoUrl
    : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const handleFinish = () => {
    onComplete(lesson.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col">
        {/* Шапка модального окна плеера */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Play size={16} className="fill-current" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Видеоурок
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-md">
                {lesson.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Плеер защищённого видео */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            controls
            autoPlay
            controlsList="nodownload"
            onEnded={handleFinish}
            src={videoSrc}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Футер модалки с кнопкой прохождения */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Просмотрите урок до конца или нажмите «Отметить пройденным»
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm shrink-0"
          >
            <CheckCircle2 size={18} />
            <span>Отметить пройденным</span>
          </button>
        </div>
      </div>
    </div>
  );
}
