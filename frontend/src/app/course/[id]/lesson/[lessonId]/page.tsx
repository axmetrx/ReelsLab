'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourseTree } from '@/hooks/useCourseTree';
import { Lesson } from '@/types/course';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  List,
  Lock,
  Play,
  ShieldCheck,
} from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.id === 'string' ? params.id : 'reelslab-course-01';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';

  const { data, loading, error, markLessonComplete } = useCourseTree(courseId);

  // Собрать плоский список всех уроков и найти текущий
  const { allLessons, currentIndex, currentLesson, currentModule } = useMemo(() => {
    if (!data) return { allLessons: [] as { lesson: Lesson; moduleTitle: string }[], currentIndex: -1, currentLesson: null as Lesson | null, currentModule: null as string | null };

    const flat: { lesson: Lesson; moduleTitle: string }[] = [];
    for (const m of data.modules) {
      for (const l of m.lessons) {
        flat.push({ lesson: l, moduleTitle: m.title });
      }
    }

    const idx = flat.findIndex((f) => f.lesson.id === lessonId);
    return {
      allLessons: flat,
      currentIndex: idx,
      currentLesson: idx >= 0 ? flat[idx].lesson : null,
      currentModule: idx >= 0 ? flat[idx].moduleTitle : null,
    };
  }, [data, lessonId]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!currentLesson) return;
    await markLessonComplete(currentLesson.id);
    // Перейти к следующему уроку
    if (nextLesson) {
      router.push(`/course/${courseId}/lesson/${nextLesson.lesson.id}`);
    }
  };

  const goNext = () => {
    if (nextLesson) router.push(`/course/${courseId}/lesson/${nextLesson.lesson.id}`);
  };

  const goPrev = () => {
    if (prevLesson) router.push(`/course/${courseId}/lesson/${prevLesson.lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Загрузка урока...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6] p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-sm w-full">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Урок не найден</h2>
          <p className="text-sm text-slate-600 mb-4">Такого урока не существует или у вас нет к нему доступа.</p>
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
          >
            <ChevronLeft size={16} /> Вернуться к курсу
          </Link>
        </div>
      </div>
    );
  }

  const isVideo = currentLesson.type === 'VIDEO';
  const isHomework = currentLesson.type === 'HOMEWORK';
  const isFile = currentLesson.type === 'FILE';
  const videoSrc =
    currentLesson.videoUrl && currentLesson.videoUrl.length > 5
      ? currentLesson.videoUrl
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const lessonNumber = currentIndex + 1;
  const totalLessons = allLessons.length;

  return (
    <div className="min-h-screen bg-[#F4F4F6]">
      {/* ─── ВЕРХНИЙ БАР: назад к курсу + номер урока ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Назад к программе</span>
            <span className="sm:hidden">Назад</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              Урок {lessonNumber} из {totalLessons}
            </span>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${Math.round((lessonNumber / totalLessons) * 100)}%` }}
              />
            </div>
          </div>

          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <List size={15} />
            <span className="hidden sm:inline">Все уроки</span>
          </Link>
        </div>
      </header>

      {/* ─── ВИДЕОПЛЕЕР / КОНТЕНТ УРОКА ─── */}
      <div className="max-w-4xl mx-auto">
        {isVideo ? (
          <div className="relative bg-black w-full aspect-video">
            <video
              key={currentLesson.id}
              controls
              autoPlay
              controlsList="nodownload"
              onEnded={handleComplete}
              src={videoSrc}
              className="w-full h-full object-contain"
            />
            {/* Водяной знак */}
            <div className="absolute top-3 right-3 pointer-events-none bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white/80 border border-white/10 flex items-center gap-1">
              <ShieldCheck size={12} className="text-blue-400" />
              <span>ReelsLab Protected</span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-16 text-center border-b border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
              {isHomework ? '✍️' : '📄'}
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-3 inline-block">
              {isHomework ? 'Домашнее задание' : 'Материал для скачивания'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-3 max-w-lg mx-auto">
              {currentLesson.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {isHomework
                ? 'Выполните практическое задание, затем нажмите «Урок пройден» и переходите дальше.'
                : 'Скачайте учебный материал и изучите его перед следующим видеоуроком.'}
            </p>
          </div>
        )}
      </div>

      {/* ─── ИНФОРМАЦИЯ ОБ УРОКЕ + КНОПКИ ─── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Заголовок и модуль */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {currentModule}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 leading-snug">
                {currentLesson.title}
              </h1>
              {currentLesson.duration && (
                <span className="text-xs font-semibold text-slate-500 mt-1 inline-block">
                  ⏱ {Math.round(currentLesson.duration / 60)} минут
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0 active:scale-95 ${
                currentLesson.isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 size={20} />
              <span>{currentLesson.isCompleted ? 'Урок пройден ✓' : 'Отметить пройденным'}</span>
            </button>
          </div>
        </div>

        {/* Навигация: Предыдущий / Следующий урок */}
        <div className="flex items-stretch gap-3">
          {/* Кнопка Назад */}
          {prevLesson ? (
            <button
              type="button"
              onClick={goPrev}
              className="flex-1 flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <ArrowLeft size={18} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Предыдущий урок
                </span>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                  {prevLesson.lesson.title}
                </p>
              </div>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {/* Кнопка Далее */}
          {nextLesson ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 flex items-center gap-3 p-4 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all text-left group shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Следующий урок
                </span>
                <p className="text-sm font-bold text-white truncate mt-0.5">
                  {nextLesson.lesson.title}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ArrowRight size={18} className="text-white" />
              </div>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-sm font-bold text-emerald-700">🎉 Вы прошли все уроки курса!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
