'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLMSStore } from '@/lib/store';
import BottomDock from '@/components/BottomDock';
import StudentHeader from '@/components/StudentHeader';
import { BookX, Play, ArrowLeft, GraduationCap } from 'lucide-react';

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.id === 'string' ? params.id : '';

  const store = useLMSStore();
  const { currentUser, courses } = store;

  // 1. Проверка доступа
  const hasAccess = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return (currentUser.grantedCourses || []).some((g) => g.courseId === courseId);
  }, [currentUser, courseId]);

  // 2. Найти курс
  const course = useMemo(() => {
    return courses.find((c) => c.id === courseId);
  }, [courses, courseId]);

  if (!hasAccess || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <BookX size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Курс не доступен</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Курс не найден или у вас пока нет к нему доступа. Ожидайте выдачи доступа администратором.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Вернуться в Кабинет</span>
          </Link>
        </div>
      </div>
    );
  }

  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <main className="w-full max-w-md mx-auto px-4 box-border pt-4 pb-32">
        <StudentHeader />

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-5 space-y-3">
          <h1 className="text-lg font-bold text-slate-900 leading-snug">{course.title}</h1>
          <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>

          {firstLessonId ? (
            <Link
              href={`/course/${course.id}/lesson/${firstLessonId}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
            >
              <Play size={16} className="fill-current" />
              <span>Начать обучение (Урок 1)</span>
            </Link>
          ) : (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold text-center border border-amber-200">
              В этой программе пока нет добавленных уроков.
            </div>
          )}
        </div>

        {/* Программа модулей */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Программа курса</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
            {course.modules.length} модулей
          </span>
        </div>

        <div className="space-y-3">
          {course.modules.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-900">{m.title}</h3>
              <div className="space-y-1">
                {m.lessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/course/${course.id}/lesson/${l.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 text-xs font-semibold text-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Play size={14} className="text-blue-600 shrink-0" />
                      <span className="truncate">{l.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomDock />
    </div>
  );
}
