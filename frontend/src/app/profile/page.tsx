'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi, StudentAccess } from '@/lib/admin-api';
import BottomDock from '@/components/BottomDock';
import {
  User,
  Mail,
  LogOut,
  BookOpen,
  ChevronRight,
  UserX,
  ShieldCheck,
  UserPlus,
  Clock,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAccesses, setUserAccesses] = useState<StudentAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initProfile = async () => {
      try {
        setLoading(true);
        if (typeof window !== 'undefined') {
          const savedName = localStorage.getItem('user_name');
          const savedEmail = localStorage.getItem('user_email');
          setUserName(savedName);
          setUserEmail(savedEmail);
        }

        const accesses = await adminApi.getAccesses();
        setUserAccesses(accesses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('activeStudentId');
    }
    setUserName(null);
    setUserEmail(null);
    setUserAccesses([]);
    router.push('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  // 1. Если вообще нет зарегистрированного ученика
  if (!userName || !userEmail) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <main className="max-w-md sm:max-w-xl mx-auto px-4 py-12 pb-36 text-center">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <UserX size={32} />
            </div>

            <h1 className="text-lg font-bold text-slate-900 mb-1">Вы не авторизованы</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Пожалуйста, зарегистрируйтесь или войдите в свой аккаунт ученика.
            </p>

            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm mb-3"
            >
              <UserPlus size={16} />
              <span>Зарегистрироваться / Войти</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ShieldCheck size={14} />
              <span>Панель преподавателя / админа</span>
            </Link>
          </div>
        </main>
        <BottomDock />
      </div>
    );
  }

  // Найти реальные активные курсы текущего ученика
  const myGrantedCourses = userAccesses.filter(
    (a) => a.userEmail === userEmail && a.courseId !== null
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <main className="max-w-md sm:max-w-xl mx-auto px-4 py-6 pb-36">
        {/* Карточка профиля ученика */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6 flex flex-col items-center text-center">
          {/* Аватар */}
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl mb-3 border-2 border-white shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>

          {/* Имя и Почта */}
          <h1 className="text-lg font-bold text-slate-900 mb-0.5">{userName}</h1>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-4">
            <Mail size={13} />
            <span>{userEmail}</span>
          </p>

          {/* Тарифный статус */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>
              {myGrantedCourses.length > 0
                ? `Тариф ${myGrantedCourses[0].tariff}`
                : 'Доступ не выдан'}
            </span>
          </div>
        </div>

        {/* Секция доступных курсов */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1 mb-3">
            Мои курсы
          </h2>

          {myGrantedCourses.length === 0 ? (
            /* Пустое состояние для зарегистрированного ученика БЕЗ доступных курсов */
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Clock size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                У вас пока нет активных курсов
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-4">
                Ожидайте выдачи доступа администратором. После того как преподаватель откроет вам доступ, курс появится здесь.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                <span>Статус аккаунта: Зарегистрирован</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {myGrantedCourses.map((access) => (
                <Link
                  key={access.id}
                  href={`/course/${access.courseId}`}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all group block"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {access.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Тариф {access.tariff} · Активный доступ
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка выхода */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-100 hover:border-red-200 font-bold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs mb-8 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Выйти из аккаунта</span>
        </button>

        {/* Ссылка на панель админа */}
        <div className="text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ShieldCheck size={14} />
            <span>Панель преподавателя / админа</span>
          </Link>
        </div>
      </main>

      <BottomDock />
    </div>
  );
}
