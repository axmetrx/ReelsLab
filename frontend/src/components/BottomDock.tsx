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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-3 pt-2 pointer-events-none">
      {/* Floating White Dock Capsule */}
      <div
        className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full px-6 py-2.5 shadow-xl flex items-center gap-8 sm:gap-12"
        style={{
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '#' && item.href !== '/notifications' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
                isActive
                  ? 'text-blue-600 scale-105 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Powered by caption */}
      <span className="text-[10px] font-medium text-slate-400 mt-1 pointer-events-auto">
        Сделано на <strong className="text-slate-600">15study</strong>
      </span>
    </div>
  );
}
