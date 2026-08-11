'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCourseTree } from '@/hooks/useCourseTree';
import CourseHeader from '@/components/CourseHeader';
import ModuleAccordion from '@/components/ModuleAccordion';
import StudentHeader from '@/components/StudentHeader';
import BottomDock from '@/components/BottomDock';
import { GraduationCap } from 'lucide-react';

export default function CoursePage() {
  const params = useParams();
  const courseId = typeof params.id === 'string' ? params.id : 'reelslab-course-01';

  const { data, loading, error, markLessonComplete } = useCourseTree(courseId);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  // Автоматически открыть модуль с текущим уроком
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
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Загрузка ReelsLab...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6] p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-sm w-full">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Произошла ошибка</h2>
          <p className="text-sm text-slate-600">{error?.message || 'Не удалось загрузить данные курса'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F4F6] min-h-screen">
      <main className="max-w-md sm:max-w-xl mx-auto px-4 py-6 pb-36">
        {/* Шапка профайла автора */}
        <StudentHeader />

        {/* Баннер курса */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-slate-900">Мои курсы</h2>
            <span className="text-xs font-semibold text-slate-400">1 курс</span>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm mb-6">
            <div className="relative h-48 sm:h-56 w-full bg-slate-100">
              <Image
                src="/banner.jpg"
                alt="ReelsLab Banner"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Система, которая превращает блог в рост подписчиков и заработок
              </p>
            </div>
          </div>
        </div>

        {/* Прогресс курса */}
        <CourseHeader
          courseTitle={data.course.title}
          tariff={data.userCourse.tariff}
          progressPercent={data.userCourse.progressPercent}
          accessExpiresAt={data.userCourse.accessExpiresAt}
          totalLessons={totals.total}
          completedLessons={totals.completed}
        />

        {/* Программа курса */}
        <div className="flex items-center justify-between mt-8 mb-4 px-1">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Программа курса</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {data.modules.length} {data.modules.length === 1 ? 'модуль' : data.modules.length < 5 ? 'модуля' : 'модулей'}
          </span>
        </div>

        {/* Нажмите на любой урок — откроется его страница с видеоплеером */}
        <div className="space-y-3">
          {data.modules.map((module) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              courseId={courseId}
              isOpen={openModuleId === module.id}
              onToggle={() => toggleModule(module.id)}
              onLessonComplete={markLessonComplete}
              activeLessonId={data.nextLessonId}
            />
          ))}
        </div>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <BottomDock />
    </div>
  );
}
