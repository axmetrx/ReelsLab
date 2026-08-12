'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCourseTree } from '@/hooks/useCourseTree';
import StudentHeader from '@/components/StudentHeader';
import CourseHeader from '@/components/CourseHeader';
import ModuleAccordion from '@/components/ModuleAccordion';
import BottomDock from '@/components/BottomDock';
import { GraduationCap, BookX, ArrowLeft } from 'lucide-react';

export default function CourseOverviewPage() {
  const params = useParams();
  const courseId = typeof params.id === 'string' ? params.id : 'reelslab-course-01';

  const { data, loading, error, markLessonComplete } = useCourseTree(courseId);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (data && data.nextLessonId && !openModuleId) {
      const activeModule = data.modules.find((m) =>
        m.lessons.some((l) => l.id === data.nextLessonId)
      );
      if (activeModule) {
        setOpenModuleId(activeModule.id);
      }
    }
  }, [data, openModuleId]);

  const toggleModule = (moduleId: string) => {
    setOpenModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  const totals = React.useMemo(() => {
    if (!data) return { total: 0, completed: 0 };
    let total = 0;
    let completed = 0;
    data.modules.forEach((m) => {
      total += m.totalCount;
      completed += m.completedCount;
    });
    return { total, completed };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Загрузка курса...</span>
        </div>
      </div>
    );
  }

  // Если курс не найден или у ученика нет к нему доступа
  if (error || !data || !data.course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <BookX size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Курс не доступен</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Курс не найден или у вас пока нет к нему доступа. Ожидайте выдачи доступа администратором.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Перейти в Личный кабинет</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <main className="w-full max-w-md mx-auto px-4 box-border pt-4 pb-32">
        <StudentHeader />

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-base font-bold text-slate-900">Мои курсы</h2>
            <span className="text-xs font-medium text-slate-400">1 курс</span>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="relative h-44 w-full bg-slate-100">
              <Image
                src={data.course.coverUrl || '/banner.jpg'}
                alt="Course Banner"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                {data.course.description || 'Система обучению созданию вирусного контента.'}
              </p>
            </div>
          </div>
        </div>

        <CourseHeader
          courseTitle={data.course.title}
          tariff={data.userCourse.tariff}
          progressPercent={data.userCourse.progressPercent}
          accessExpiresAt={data.userCourse.accessExpiresAt}
          totalLessons={totals.total}
          completedLessons={totals.completed}
        />

        <div className="flex items-center justify-between mt-6 mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Программа курса</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-2xs">
            {data.modules.length} {data.modules.length === 1 ? 'модуль' : data.modules.length < 5 ? 'модуля' : 'модулей'}
          </span>
        </div>

        <div className="space-y-3">
          {data.modules.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center text-xs font-medium text-slate-500">
              В этой программе пока нет созданных модулей.
            </div>
          ) : (
            data.modules.map((module) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                courseId={courseId}
                isOpen={openModuleId === module.id}
                onToggle={() => toggleModule(module.id)}
                onLessonComplete={markLessonComplete}
                activeLessonId={data.nextLessonId}
              />
            ))
          )}
        </div>
      </main>

      <BottomDock />
    </div>
  );
}
