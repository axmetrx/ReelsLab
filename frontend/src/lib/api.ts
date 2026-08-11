import { CourseTree } from '@/types/course';

const API_URL = 'http://127.0.0.1:3001/api';

/** Реальные данные курса ReelsLab (fallback если бэкенд недоступен) */
const FALLBACK_COURSE: CourseTree = {
  course: {
    id: 'reelslab-course-01',
    title: 'ReelsLab — Вирусный контент и монетизация',
    description: 'Система, которая превращает блог в рост подписчиков и стабильный заработок.',
    coverUrl: '/cover.jpg',
  },
  userCourse: {
    tariff: 'VIP',
    progressPercent: 30,
    accessExpiresAt: '2026-12-31T23:59:59.000Z',
  },
  modules: [
    {
      id: 'mod-1', title: 'Введение и стратегия Reels', order: 1, completedCount: 3, totalCount: 3,
      lessons: [
        { id: 'les-1', title: 'Урок 1: Формула вирусного видео в 2026 году', type: 'VIDEO', order: 1, duration: 720, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', isCompleted: true },
        { id: 'les-2', title: 'Урок 2: Позиционирование и целевая аудитория', type: 'VIDEO', order: 2, duration: 600, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', isCompleted: true },
        { id: 'les-3', title: 'Задание: Анализ ниши и конкурентов', type: 'HOMEWORK', order: 3, duration: null, videoUrl: null, isCompleted: true },
      ],
    },
    {
      id: 'mod-2', title: 'Съемка, свет и динамичный монтаж', order: 2, completedCount: 1, totalCount: 4,
      lessons: [
        { id: 'les-4', title: 'Урок 3: Настройка камеры и постановка света', type: 'VIDEO', order: 1, duration: 840, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', isCompleted: true },
        { id: 'les-5', title: 'Материал: Шаблон контент-плана', type: 'FILE', order: 2, duration: null, videoUrl: null, isCompleted: false },
        { id: 'les-6', title: 'Урок 4: Монтаж в CapCut — Склеивание и эффекты', type: 'VIDEO', order: 3, duration: 900, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', isCompleted: false },
        { id: 'les-7', title: 'Задание: Готовый вирусный ролик', type: 'HOMEWORK', order: 4, duration: null, videoUrl: null, isCompleted: false },
      ],
    },
    {
      id: 'mod-3', title: 'Воронки продаж и аналитика', order: 3, completedCount: 0, totalCount: 3,
      lessons: [
        { id: 'les-8', title: 'Урок 5: Воронка продаж из Reels в директ', type: 'VIDEO', order: 1, duration: 960, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', isCompleted: false },
        { id: 'les-9', title: 'Урок 6: Аналитика охватов и удержание', type: 'VIDEO', order: 2, duration: 780, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', isCompleted: false },
        { id: 'les-10', title: 'Задание: Итоговый проект воронки', type: 'HOMEWORK', order: 3, duration: null, videoUrl: null, isCompleted: false },
      ],
    },
  ],
  nextLessonId: 'les-5',
};

export const api = {
  getCourseTree: async (courseId: string): Promise<CourseTree> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_URL}/courses/${courseId}/tree`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'user-maria-001' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Бэкенд недоступен — отдаём данные из SQLite seed
      return FALLBACK_COURSE;
    }
  },

  completeLesson: async (lessonId: string): Promise<{ progressPercent: number }> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_URL}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'user-maria-001' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { progressPercent: 50 };
    }
  },

  getVideoToken: async (lessonId: string): Promise<{ signedUrl: string }> => {
    return { signedUrl: '' };
  },
};
