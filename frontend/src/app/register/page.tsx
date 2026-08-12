'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Регистрация ученика БЕЗ автоматической выдачи VIP тарифа или курсов
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
      // Перенаправление в Личный Кабинет (где показано сосотояние "Ожидайте выдачи доступа")
      router.push('/profile');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            R
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Регистрация ученика
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Создайте аккаунт в системе ReelsLab
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ваше Имя
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Анастасия Смирнова"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Придумайте пароль (от 6 символов)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>{loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Уже есть аккаунт?{' '}
            </span>
            <Link
              href="/login"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
