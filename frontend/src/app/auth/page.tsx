'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLMSStore } from '@/lib/store';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const store = useLMSStore();

  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (isLogin) {
      const user = store.loginUser(email);
      if (!user) {
        alert('Пользователь с таким Email не найден. Зарегистрируйтесь.');
        setIsLogin(false);
        return;
      }
    } else {
      store.registerUser(name, email, password);
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6">
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
          {isLogin ? 'Вход в ReelsLab' : 'Регистрация ученика'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          {isLogin
            ? 'Введите Email для входа в кабинет'
            : 'Создайте аккаунт для получения доступа к обучению'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-2xl shadow-sm sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
            )}

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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>{isLogin ? 'Войти в кабинет' : 'Зарегистрироваться'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              {isLogin
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже зарегистрированы? Войти в кабинет'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/admin"
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Вход в Панель преподавателя / Админа ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
