'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { ExternalLink } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleStudentViewClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const accesses = await adminApi.getAccesses();
    const courses = await adminApi.getCourses();

    if (accesses.length === 0 || courses.length === 0) {
      alert('В системе нет зарегистрированных учеников или созданных курсов.\nВы будете перенаправлены на страницу регистрации ученика.');
      router.push('/register');
    } else {
      router.push(`/course/${accesses[0].courseId || 'reelslab-course-01'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-slate-900">
      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  ReelsLab Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Панель управления
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStudentViewClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            >
              <span>Вид ученика</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
