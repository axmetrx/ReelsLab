export type LessonType = 'VIDEO' | 'HOMEWORK' | 'FILE';
export type TariffPlan = 'FREE' | 'BASIC' | 'PRO' | 'VIP';

export interface LessonProgress {
  isCompleted: boolean;
  completedAt: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  order: number;
  duration: number | null;
  videoUrl?: string | null;
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  completedCount: number;
  totalCount: number;
}

export interface CourseTree {
  course: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
  };
  userCourse: {
    tariff: TariffPlan;
    progressPercent: number;
    accessExpiresAt: string;
  };
  modules: Module[];
  nextLessonId: string | null;
}
