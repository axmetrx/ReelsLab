'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('code');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Имитация авторизации
    setTimeout(() => {
      setLoading(false);
      // Перенаправление на курс
      router.push('/course/demo-course-001');
    }, 800);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCodeSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Логотип */}
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            R
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Вход в личный кабинет
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Платформа онлайн-обучения ReelsLab
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          {/* Переключатель способа входа */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('code');
                setCodeSent(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'code'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Вход без пароля (код на Email)
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'password'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Логин и Пароль
            </button>
          </div>

          {/* Вариант 1: Вход без пароля по коду (самый удобный) */}
          {loginMethod === 'code' ? (
            !codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ваш Email
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600"
                    />
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1.5">
                    Мы пришлем 4-значный код. Запоминать пароль не требуется.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Отправка...' : 'Получить код для входа'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Код отправлен на <strong>{email}</strong></span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Введите 4-значный код из письма
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center tracking-widest text-2xl font-mono py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Вход...' : 'Войти в курс'}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setCodeSent(false)}
                  className="w-full text-center text-xs font-medium text-slate-500 hover:underline pt-1"
                >
                  Изменить Email
                </button>
              </form>
            )
          ) : (
            /* Вариант 2: Логин и пароль */
            <form onSubmit={handleLogin} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Авторизация...' : 'Войти'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Еще нет аккаунта?{' '}
            </span>
            <Link
              href="/register"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
