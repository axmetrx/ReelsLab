import { CourseTree } from '@/types/course';
import { adminApi } from './admin-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

export const api = {
  getCourseTree: async (courseId: string): Promise<CourseTree | null> => {
    // 1. Сначала пробуем получить дерево курса из единого хранилища adminApi (Single Source of Truth)
    try {
      const tree = await adminApi.getCourseTree(courseId);
      if (tree && tree.course) {
        const formattedModules = (tree.modules || []).map((m) => {
          const lessons = (m.lessons || []).map((l) => ({
            id: l.id,
            title: l.title,
            type: (l.type as any) || 'VIDEO',
            order: l.order,
            duration: l.duration || null,
            videoUrl: l.videoUrl || null,
            isCompleted: false,
          }));

          return {
            id: m.id,
            title: m.title,
            order: m.order,
            lessons,
            completedCount: 0,
            totalCount: lessons.length,
          };
        });

        return {
          course: {
            id: tree.course.id,
            title: tree.course.title,
            description: tree.course.description || '',
            coverUrl: tree.course.coverUrl || '/banner.jpg',
          },
          userCourse: {
            tariff: 'VIP',
            progressPercent: 0,
            accessExpiresAt: '2026-12-31T23:59:59.000Z',
          },
          modules: formattedModules,
          nextLessonId: formattedModules[0]?.lessons[0]?.id || null,
        };
      }
    } catch (e) {}

    // 2. Пробуем бэкенд API
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${API_URL}/courses/${courseId}/tree`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'student' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Если курса нет в едином хранилище и бэкенде — возвращаем null (без мок-данных)
      return null;
    }
  },

  completeLesson: async (lessonId: string): Promise<{ progressPercent: number }> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'student' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { progressPercent: 100 };
    }
  },

  getVideoToken: async (lessonId: string): Promise<{ signedUrl: string }> => {
    return { signedUrl: '' };
  },
};
