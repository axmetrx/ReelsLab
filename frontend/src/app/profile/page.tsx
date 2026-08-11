'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BottomDock from '@/components/BottomDock';
import { User, Mail, Calendar, ShieldCheck, LogOut, BookOpen, ChevronRight, Settings, Lock } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Мария Иванова');
  const [userEmail, setUserEmail] = useState('maria@example.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('user_name');
      const savedEmail = localStorage.getItem('user_email');
      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
    }
    router.push('/');
  };

  return (
    <div className="bg-[#F4F4F6] min-h-screen">
      <main className="max-w-md sm:max-w-xl mx-auto px-4 py-6 pb-36">
        {/* Карточка профиля ученика */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6 flex flex-col items-center text-center">
          {/* Аватар */}
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl mb-3 border-2 border-white shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>

          {/* Имя и Почта */}
          <h1 className="text-xl font-bold text-slate-900 mb-0.5">{userName}</h1>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-4">
            <Mail size={13} />
            <span>{userEmail}</span>
          </p>

          {/* Тарифный статус */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span>Тариф VIP</span>
            <span className="text-amber-400">•</span>
            <span>До 31 декабря 2026</span>
          </div>
        </div>

        {/* Доступные курсы */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1 mb-3">
            Мои курсы и доступы
          </h2>

          <Link
            href="/course/demo-course-001"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Основы цифрового маркетинга
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Пройдено 40% · Тариф VIP
                </p>
              </div>
            </div>

            <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
          </Link>
        </div>

        {/* Настройки аккаунта */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1 mb-3">
            Настройки
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-700">
                <Lock size={18} className="text-slate-400" />
                <span className="text-sm font-medium">Безопасность и пароль</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Изменить</span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-700">
                <Settings size={18} className="text-slate-400" />
                <span className="text-sm font-medium">Уведомления на Email</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Включены
              </span>
            </div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-200/80 hover:border-red-200 font-bold py-3.5 px-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm mb-8"
        >
          <LogOut size={18} />
          <span>Выйти из аккаунта</span>
        </button>

        {/* Дискретная ссылка для преподавателя/админа в самом низу */}
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

      {/* Floating Bottom Dock */}
      <BottomDock />
    </div>
  );
}
