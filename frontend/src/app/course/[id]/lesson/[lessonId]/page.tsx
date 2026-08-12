'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourseTree } from '@/hooks/useCourseTree';
import { Lesson } from '@/types/course';
import BottomDock from '@/components/BottomDock';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  List,
  ShieldCheck,
} from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.id === 'string' ? params.id : 'reelslab-course-01';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';

  const { data, loading, error, markLessonComplete } = useCourseTree(courseId);

  // Собрать плоский список всех уроков
  const { allLessons, currentIndex, currentLesson, currentModule } = useMemo(() => {
    if (!data)
      return {
        allLessons: [] as { lesson: Lesson; moduleTitle: string }[],
        currentIndex: -1,
        currentLesson: null as Lesson | null,
        currentModule: null as string | null,
      };

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
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!currentLesson) return;
    await markLessonComplete(currentLesson.id);
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Загрузка урока...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center max-w-xs w-full">
          <h2 className="text-base font-bold text-slate-900 mb-1">Урок не найден</h2>
          <p className="text-xs text-slate-500 mb-4">Урок не существует или у вас нет доступа.</p>
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            <ChevronLeft size={16} /> Назад к программе
          </Link>
        </div>
      </div>
    );
  }

  const isVideo = currentLesson.type === 'VIDEO';
  const isHomework = currentLesson.type === 'HOMEWORK';
  const videoSrc =
    currentLesson.videoUrl && currentLesson.videoUrl.length > 5
      ? currentLesson.videoUrl
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const lessonNumber = currentIndex + 1;
  const totalLessons = allLessons.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Верхняя панель урока */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="w-full max-w-md mx-auto px-4 box-border h-14 flex items-center justify-between">
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Курс</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              {lessonNumber} из {totalLessons}
            </span>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${Math.round((lessonNumber / totalLessons) * 100)}%` }}
              />
            </div>
          </div>

          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100"
          >
            <List size={14} />
            <span>Уроки</span>
          </Link>
        </div>
      </header>

      {/* Основной контейнер c max-w-md и pb-32 */}
      <main className="w-full max-w-md mx-auto px-4 box-border pt-3 pb-32">
        {/* Адаптивный видеоплеер c rounded-xl и aspect-video */}
        {isVideo ? (
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-black my-3 relative group">
            <video
              key={currentLesson.id}
              controls
              autoPlay
              controlsList="nodownload"
              onEnded={handleComplete}
              src={videoSrc}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2.5 right-2.5 pointer-events-none bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white/90 border border-white/10 flex items-center gap-1">
              <ShieldCheck size={11} className="text-blue-400" />
              <span>ReelsLab Protected</span>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-xl overflow-hidden border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 text-center my-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 text-xl shadow-2xs">
              {isHomework ? '✍️' : '📄'}
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 inline-block mb-2">
              {isHomework ? 'Домашнее задание' : 'Материал для скачивания'}
            </span>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{currentLesson.title}</h2>
          </div>
        )}

        {/* Информационная карточка урока */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            {currentModule}
          </span>
          <h1 className="text-base font-bold text-slate-900 leading-snug mb-3">
            {currentLesson.title}
          </h1>

          <button
            type="button"
            onClick={handleComplete}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all shadow-2xs active:scale-[0.99] ${
              currentLesson.isCompleted
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{currentLesson.isCompleted ? 'Урок пройден ✓' : 'Отметить пройденным'}</span>
          </button>
        </div>

        {/* Навигация по урокам: строго 2 колонки (grid grid-cols-2 gap-3 w-full) */}
        <div className="grid grid-cols-2 gap-3 w-full box-border">
          {/* Кнопка Предыдущий урок */}
          {prevLesson ? (
            <button
              type="button"
              onClick={goPrev}
              className="w-full flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all text-left shadow-sm box-border"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <ArrowLeft size={16} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Назад
                </span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {prevLesson.lesson.title}
                </p>
              </div>
            </button>
          ) : (
            <div className="w-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-3 opacity-40" />
          )}

          {/* Кнопка Следующий урок */}
          {nextLesson ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full flex items-center justify-between gap-2 p-3 bg-blue-600 hover:bg-blue-700 transition-all text-left shadow-sm rounded-2xl text-white box-border"
            >
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200 block">
                  Далее
                </span>
                <p className="text-xs font-bold text-white truncate mt-0.5">
                  {nextLesson.lesson.title}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <ArrowRight size={16} className="text-white" />
              </div>
            </button>
          ) : (
            <div className="w-full bg-emerald-50 rounded-2xl border border-emerald-200 p-3 flex items-center justify-center text-center">
              <span className="text-[11px] font-bold text-emerald-700">Курс пройден! 🎉</span>
            </div>
          )}
        </div>
      </main>

      {/* Плавающая нижняя панель навигации */}
      <BottomDock />
    </div>
  );
}
