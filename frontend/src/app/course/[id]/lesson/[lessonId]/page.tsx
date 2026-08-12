'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLMSStore, Lesson } from '@/lib/store';
import BottomDock from '@/components/BottomDock';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  List,
  ShieldCheck,
  BookX,
  Play,
} from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.id === 'string' ? params.id : '';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';

  const store = useLMSStore();
  const { currentUser, courses } = store;

  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // 1. Проверка авторизации и доступа к курсу
  const hasAccess = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return (currentUser.grantedCourses || []).some((g) => g.courseId === courseId);
  }, [currentUser, courseId]);

  // 2. Поиск курса в едином хранилище
  const course = useMemo(() => {
    return courses.find((c) => c.id === courseId);
  }, [courses, courseId]);

  // 3. Плоский список уроков
  const { allLessons, currentIndex, currentLesson, currentModule } = useMemo(() => {
    if (!course) {
      return {
        allLessons: [] as { lesson: Lesson; moduleTitle: string }[],
        currentIndex: -1,
        currentLesson: null as Lesson | null,
        currentModule: null as string | null,
      };
    }

    const flat: { lesson: Lesson; moduleTitle: string }[] = [];
    for (const m of course.modules) {
      for (const l of m.lessons) {
        flat.push({ lesson: l, moduleTitle: m.title });
      }
    }

    const idx = flat.findIndex((f) => f.lesson.id === lessonId);
    return {
      allLessons: flat,
      currentIndex: idx >= 0 ? idx : 0,
      currentLesson: idx >= 0 ? flat[idx].lesson : flat[0]?.lesson || null,
      currentModule: idx >= 0 ? flat[idx].moduleTitle : flat[0]?.moduleTitle || null,
    };
  }, [course, lessonId]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted = currentLesson ? !!completedLessons[currentLesson.id] : false;

  const handleComplete = () => {
    if (!currentLesson) return;
    setCompletedLessons((prev) => ({ ...prev, [currentLesson.id]: true }));
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

  // Если нет прав или курс не найден
  if (!hasAccess || !course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <BookX size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Курс не доступен</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Курс не найден или у вас пока нет к нему доступа. Ожидайте подтверждения администратором.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
          >
            <span>Перейти в Кабинет</span>
          </Link>
        </div>
      </div>
    );
  }

  // Определение типа видеоплеера (Embed <iframe> или HTML5 <video>)
  const videoUrl = currentLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const isEmbed =
    videoUrl.includes('youtube.com') ||
    videoUrl.includes('youtu.be') ||
    videoUrl.includes('vimeo.com') ||
    videoUrl.includes('kinescope.io') ||
    videoUrl.includes('embed');

  const lessonNumber = currentIndex + 1;
  const totalLessons = allLessons.length || 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Верхняя шапка урока */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="w-full max-w-md mx-auto px-4 box-border h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Кабинет</span>
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
        </div>
      </header>

      {/* Основной адаптивный контейнер c max-w-md и pb-32 */}
      <main className="w-full max-w-md mx-auto px-4 box-border pt-3 pb-32">
        {/* Видеоплеер */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm bg-black my-3 relative group">
          {isEmbed ? (
            <iframe
              src={videoUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={currentLesson.id}
              controls
              autoPlay
              controlsList="nodownload"
              onEnded={handleComplete}
              src={videoUrl}
              className="w-full h-full object-contain"
            />
          )}

          <div className="absolute top-2.5 right-2.5 pointer-events-none bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white/90 border border-white/10 flex items-center gap-1">
            <ShieldCheck size={11} className="text-blue-400" />
            <span>ReelsLab Protected</span>
          </div>
        </div>

        {/* Информационная карточка урока */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {currentModule}
          </span>
          <h1 className="text-base font-bold text-slate-900 leading-snug mb-3">
            {currentLesson.title}
          </h1>

          <button
            type="button"
            onClick={handleComplete}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all shadow-2xs active:scale-[0.99] cursor-pointer ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{isCompleted ? 'Урок пройден ✓' : 'Отметить пройденным'}</span>
          </button>
        </div>

        {/* Сетка переключения уроков (строго 2 колонки) */}
        <div className="grid grid-cols-2 gap-3 w-full box-border mb-6">
          {prevLesson ? (
            <button
              type="button"
              onClick={goPrev}
              className="w-full flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all text-left shadow-2xs box-border cursor-pointer"
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
            <div className="w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-3 opacity-50" />
          )}

          {nextLesson ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full flex items-center justify-between gap-2 p-3 bg-blue-600 hover:bg-blue-700 transition-all text-left shadow-sm rounded-2xl text-white box-border cursor-pointer"
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
              <span className="text-[11px] font-bold text-emerald-700">Все уроки пройдены 🎉</span>
            </div>
          )}
        </div>

        {/* Программа всех модулей курса */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Программа курса ({course.modules.length} {course.modules.length === 1 ? 'модуль' : 'модулей'})
          </h2>

          <div className="space-y-3">
            {course.modules.map((m) => (
              <div key={m.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 block">{m.title}</span>
                <div className="space-y-1 pl-1">
                  {m.lessons.map((l) => {
                    const isCurrent = l.id === currentLesson.id;
                    return (
                      <Link
                        key={l.id}
                        href={`/course/${courseId}/lesson/${l.id}`}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white font-bold shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Play size={12} className={isCurrent ? 'fill-current' : 'text-blue-600'} />
                          <span className="truncate">{l.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomDock />
    </div>
  );
}
