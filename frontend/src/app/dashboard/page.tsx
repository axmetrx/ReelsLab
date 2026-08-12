'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLMSStore } from '@/lib/store';
import BottomDock from '@/components/BottomDock';
import StudentHeader from '@/components/StudentHeader';
import {
  Clock,
  BookOpen,
  ChevronRight,
  LogOut,
  UserCheck,
  ShieldCheck,
  Play,
  UserX,
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const store = useLMSStore();
  const { currentUser, courses } = store;

  const handleLogout = () => {
    store.logout();
    router.push('/auth');
  };

  // Сценарий 1: Пользователь не авторизован -> Предложить авторизацию
  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <main className="pb-32 px-4 max-w-md mx-auto w-full box-border pt-12 text-center">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <UserX size={32} />
            </div>

            <h1 className="text-lg font-bold text-slate-900 mb-1">Вы не авторизованы</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Пожалуйста, зарегистрируйтесь или войдите в личный кабинет ученика.
            </p>

            <Link
              href="/auth"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm mb-3 cursor-pointer"
            >
              <span>Войти / Зарегистрироваться</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              <ShieldCheck size={14} />
              <span>Панель администратора</span>
            </Link>
          </div>
        </main>
        <BottomDock />
      </div>
    );
  }

  // Найти реальные доступные курсы ученика
  const myCourses = (currentUser.grantedCourses || [])
    .map((g) => {
      const course = courses.find((c) => c.id === g.courseId);
      return course ? { ...course, tariff: g.tariff, expiresAt: g.expiresAt } : null;
    })
    .filter(Boolean);

  const handleStartLearning = (course: any) => {
    // Безопасный переход на первый урок или на обзор курса
    const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
    if (firstLessonId) {
      router.push(`/course/${course.id}/lesson/${firstLessonId}`);
    } else {
      router.push(`/course/${course.id}`);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <main className="pb-32 px-4 max-w-md mx-auto w-full box-border pt-4">
        {/* Шапка автора курса */}
        <StudentHeader />

        {/* Профиль ученика */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mb-2.5 border-2 border-white shadow-2xs">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-base font-bold text-slate-900 mb-0.5">{currentUser.name}</h1>
          <p className="text-xs text-slate-500 mb-3">{currentUser.email}</p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>
              {myCourses.length > 0 ? `Доступов: ${myCourses.length}` : 'Доступ не выдан'}
            </span>
          </div>
        </div>

        {/* Сценарий 2: Доступ не выдан -> Сообщение об ожидании */}
        {myCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Clock size={24} />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Здравствуйте, {currentUser.name}!
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-4">
              Доступ к курсам пока не выдан. Ожидайте подтверждения администратором.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              <UserCheck size={14} className="text-blue-600" />
              <span>Статус: Ожидание выдачи доступа</span>
            </div>
          </div>
        ) : (
          /* Сценарий 3: Курсы есть -> Отображение карточки курса с кнопкой перехода */
          <div className="mb-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
              Мои обучающие программы
            </h2>

            {myCourses.map((c: any) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-1.5">
                      Тариф {c.tariff}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleStartLearning(c)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 text-sm font-semibold transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <Play size={16} className="fill-current" />
                  <span>Перейти к обучению</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Кнопка выхода */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs mb-6 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Выйти из кабинета</span>
        </button>
      </main>

      <BottomDock />
    </div>
  );
}
