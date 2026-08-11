'use client';

import React from 'react';
import BottomDock from '@/components/BottomDock';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="bg-[#F4F4F6] min-h-screen">
      <main className="max-w-md sm:max-w-xl mx-auto px-4 py-6 pb-36">
        <h1 className="text-xl font-bold text-slate-900 mb-4 px-1">Уведомления</h1>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Добро пожаловать в ReelsLab!</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Вам открыт доступ к курсу «Основы цифрового маркетинга» по тарифу VIP.
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-2 block">Сегодня</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Новый модуль доступен</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Модуль 2 «SMM и контент» открыт для прохождения.
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-2 block">Вчера</span>
            </div>
          </div>
        </div>
      </main>

      <BottomDock />
    </div>
  );
}
