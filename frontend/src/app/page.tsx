'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import { Mail, Lock, User, ArrowRight, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Сохраняем ученика в административной базе доступов
      await adminApi.registerStudentUser(email, name || email.split('@')[0]);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_name', name || email.split('@')[0]);
        localStorage.setItem('user_email', email);
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setLoading(false);
      // Перенаправление на реальный курс ReelsLab
      router.push('/course/reelslab-course-01');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Шапка регистрации */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            R
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'register' ? 'Регистрация на платформе' : 'Вход в личный кабинет'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === 'register'
            ? 'Создайте аккаунт, чтобы открыть доступ к видеоурокам и курсам'
            : 'Введите ваши данные для входа в свой обучающий кабинет'}
        </p>
      </div>

      {/* Форма регистрации / входа */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          {/* Переключатель Табов: Регистрация / Вход */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Регистрация
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Вход
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поле Имя (только для регистрации) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ваше Имя и Фамилия *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Мария Иванова"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email адрес *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Пароль *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Кнопка регистрации/входа */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
            >
              <span>
                {loading
                  ? 'Обработка...'
                  : mode === 'register'
                  ? 'Зарегистрироваться и войти в кабинет'
                  : 'Войти в личный кабинет'}
              </span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Инфо-блок под формой */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Мгновенный доступ</span>
            </div>
            <Link href="/admin" className="font-semibold text-blue-600 hover:underline">
              Панель админа →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
