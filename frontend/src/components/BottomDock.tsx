'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, User } from 'lucide-react';

export default function BottomDock() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Главная', href: '/course/reelslab-course-01', icon: Home },
    { label: 'Уведомления', href: '/notifications', icon: Bell },
    { label: 'Профиль', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-auto box-border pointer-events-none">
      {/* Floating White Dock Capsule */}
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-6 py-2.5 shadow-xl flex items-center gap-7 sm:gap-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/notifications' && item.href !== '/profile' && pathname.startsWith('/course/'));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Powered by caption */}
      <span className="text-[10px] font-medium text-slate-400 mt-1 pointer-events-auto select-none">
        Сделано на <strong className="text-slate-600 font-bold">15study</strong>
      </span>
    </div>
  );
}
