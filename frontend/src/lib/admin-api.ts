const uuidv4 = () => Math.random().toString(36).substring(2, 11);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  _count: { modules: number; lessons: number };
}

export interface AdminLesson {
  id: string;
  moduleId: string;
  title: string;
  type: 'VIDEO' | 'HOMEWORK' | 'FILE' | string;
  order: number;
  videoUrl?: string | null;
  duration?: number | null;
}

export interface AdminModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: AdminLesson[];
}

export interface StudentAccess {
  id: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  tariff: 'VIP' | 'PRO' | 'BASIC' | 'FREE' | string;
  accessExpiresAt: string;
  createdAt: string;
}

// Initial default data
const INITIAL_COURSES: AdminCourse[] = [
  {
    id: 'reelslab-course-01',
    title: 'ReelsLab — Вирусный контент и монетизация',
    description: 'Система, которая превращает блог в рост подписчиков и стабильный заработок.',
    createdAt: new Date().toISOString(),
    _count: { modules: 3, lessons: 10 },
  },
];

const INITIAL_MODULES: AdminModule[] = [
  {
    id: 'mod-1',
    courseId: 'reelslab-course-01',
    title: 'Введение и стратегия Reels',
    order: 1,
    lessons: [
      { id: 'les-1', moduleId: 'mod-1', title: 'Урок 1: Формула вирусного видео в 2026 году', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 720 },
      { id: 'les-2', moduleId: 'mod-1', title: 'Урок 2: Позиционирование и целевая аудитория', type: 'VIDEO', order: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: 600 },
      { id: 'les-3', moduleId: 'mod-1', title: 'Задание: Анализ ниши и конкурентов', type: 'HOMEWORK', order: 3 },
    ],
  },
  {
    id: 'mod-2',
    courseId: 'reelslab-course-01',
    title: 'Съемка, свет и динамичный монтаж',
    order: 2,
    lessons: [
      { id: 'les-4', moduleId: 'mod-2', title: 'Урок 3: Настройка камеры телефона и постановка света', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: 840 },
      { id: 'les-5', moduleId: 'mod-2', title: 'Шаблон контент-плана и сценариев', type: 'FILE', order: 2 },
      { id: 'les-6', moduleId: 'mod-2', title: 'Урок 4: Монтаж в CapCut: Склеивание и эффекты', type: 'VIDEO', order: 3, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: 900 },
    ],
  },
  {
    id: 'mod-3',
    courseId: 'reelslab-course-01',
    title: 'Воронки продаж и аналитика',
    order: 3,
    lessons: [
      { id: 'les-8', moduleId: 'mod-3', title: 'Урок 5: Как вести зрителя из Reels в директ и продажи', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 960 },
      { id: 'les-9', moduleId: 'mod-3', title: 'Урок 6: Аналитика охватов и удержание внимания', type: 'VIDEO', order: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 780 },
    ],
  },
];

const INITIAL_ACCESSES: StudentAccess[] = [
  {
    id: 'acc-1',
    userEmail: 'maria@example.com',
    userName: 'Мария Иванова',
    courseId: 'reelslab-course-01',
    courseTitle: 'ReelsLab — Вирусный контент и монетизация',
    tariff: 'VIP',
    accessExpiresAt: '2026-12-31T23:59:59.000Z',
    createdAt: new Date().toISOString(),
  },
];

// Reliable Persistent Store with explicit initialization flag
function getPersistentStore() {
  if (typeof window === 'undefined') {
    return { courses: INITIAL_COURSES, modules: INITIAL_MODULES, accesses: INITIAL_ACCESSES };
  }

  const isInitialized = localStorage.getItem('reelslab_store_initialized_v4');

  if (!isInitialized) {
    localStorage.setItem('reelslab_persistent_courses_v4', JSON.stringify(INITIAL_COURSES));
    localStorage.setItem('reelslab_persistent_modules_v4', JSON.stringify(INITIAL_MODULES));
    localStorage.setItem('reelslab_persistent_accesses_v4', JSON.stringify(INITIAL_ACCESSES));
    localStorage.setItem('reelslab_store_initialized_v4', 'true');
    return { courses: INITIAL_COURSES, modules: INITIAL_MODULES, accesses: INITIAL_ACCESSES };
  }

  const storedCourses = localStorage.getItem('reelslab_persistent_courses_v4');
  const storedModules = localStorage.getItem('reelslab_persistent_modules_v4');
  const storedAccesses = localStorage.getItem('reelslab_persistent_accesses_v4');

  const courses: AdminCourse[] = storedCourses ? JSON.parse(storedCourses) : [];
  const modules: AdminModule[] = storedModules ? JSON.parse(storedModules) : [];
  const accesses: StudentAccess[] = storedAccesses ? JSON.parse(storedAccesses) : [];

  return { courses, modules, accesses };
}

function savePersistentCourses(courses: AdminCourse[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('reelslab_persistent_courses_v4', JSON.stringify(courses));
  }
}

function savePersistentModules(modules: AdminModule[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('reelslab_persistent_modules_v4', JSON.stringify(modules));
  }
}

function savePersistentAccesses(accesses: StudentAccess[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('reelslab_persistent_accesses_v4', JSON.stringify(accesses));
  }
}

export const adminApi = {
  // Courses
  getCourses: async (): Promise<AdminCourse[]> => {
    const { courses } = getPersistentStore();
    return Promise.resolve(courses);
  },

  createCourse: async (data: { title: string; description?: string }): Promise<AdminCourse> => {
    const { courses } = getPersistentStore();
    const newCourse: AdminCourse = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      _count: { modules: 0, lessons: 0 },
    };
    const updated = [newCourse, ...courses];
    savePersistentCourses(updated);
    return Promise.resolve(newCourse);
  },

  updateCourse: async (id: string, data: { title?: string; description?: string }): Promise<AdminCourse> => {
    const { courses } = getPersistentStore();
    const course = courses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    if (data.title !== undefined) course.title = data.title;
    if (data.description !== undefined) course.description = data.description;
    savePersistentCourses(courses);
    return Promise.resolve(course);
  },

  deleteCourse: async (id: string) => {
    const { courses, modules } = getPersistentStore();
    const updatedCourses = courses.filter((c) => c.id !== id);
    const updatedModules = modules.filter((m) => m.courseId !== id);

    savePersistentCourses(updatedCourses);
    savePersistentModules(updatedModules);
    return Promise.resolve({ success: true });
  },

  // Modules & Course Tree
  getCourseTree: async (courseId: string) => {
    const { courses, modules } = getPersistentStore();
    const course = courses.find((c) => c.id === courseId) || courses[0];

    if (!course) {
      return Promise.resolve({
        id: courseId,
        title: 'Курс',
        description: '',
        modules: [],
      });
    }

    const courseModules = modules
      .filter((m) => m.courseId === course.id)
      .sort((a, b) => a.order - b.order);

    return Promise.resolve({
      ...course,
      modules: courseModules,
    });
  },

  createModule: async (courseId: string, data: { title: string }): Promise<AdminModule> => {
    const { modules } = getPersistentStore();
    const courseModules = modules.filter((m) => m.courseId === courseId);
    const newModule: AdminModule = {
      id: uuidv4(),
      courseId,
      title: data.title,
      order: courseModules.length + 1,
      lessons: [],
    };
    modules.push(newModule);
    savePersistentModules(modules);
    return Promise.resolve(newModule);
  },

  updateModule: async (id: string, data: { title?: string; order?: number }): Promise<AdminModule> => {
    const { modules } = getPersistentStore();
    const mod = modules.find((m) => m.id === id);
    if (!mod) throw new Error('Module not found');
    if (data.title !== undefined) mod.title = data.title;
    if (data.order !== undefined) mod.order = data.order;
    savePersistentModules(modules);
    return Promise.resolve(mod);
  },

  deleteModule: async (id: string) => {
    const { modules } = getPersistentStore();
    const updatedModules = modules.filter((m) => m.id !== id);
    savePersistentModules(updatedModules);
    return Promise.resolve({ success: true });
  },

  // Lessons
  createLesson: async (moduleId: string, data: { title: string; type: string }): Promise<AdminLesson> => {
    const { modules } = getPersistentStore();
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) throw new Error('Module not found');

    const newLesson: AdminLesson = {
      id: uuidv4(),
      moduleId,
      title: data.title,
      type: data.type || 'VIDEO',
      order: mod.lessons.length + 1,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    };
    mod.lessons.push(newLesson);
    savePersistentModules(modules);
    return Promise.resolve(newLesson);
  },

  updateLesson: async (
    id: string,
    data: { title?: string; type?: string; videoUrl?: string; duration?: number }
  ): Promise<AdminLesson> => {
    const { modules } = getPersistentStore();
    for (const mod of modules) {
      const lesson = mod.lessons.find((l) => l.id === id);
      if (lesson) {
        if (data.title !== undefined) lesson.title = data.title;
        if (data.type !== undefined) lesson.type = data.type;
        if (data.videoUrl !== undefined) lesson.videoUrl = data.videoUrl;
        if (data.duration !== undefined) lesson.duration = data.duration;
        savePersistentModules(modules);
        return Promise.resolve(lesson);
      }
    }
    throw new Error('Lesson not found');
  },

  deleteLesson: async (id: string) => {
    const { modules } = getPersistentStore();
    for (const mod of modules) {
      mod.lessons = mod.lessons.filter((l) => l.id !== id);
    }
    savePersistentModules(modules);
    return Promise.resolve({ success: true });
  },

  getPresignedUrl: async (courseId: string, fileName: string) => {
    return Promise.resolve({
      uploadUrl: 'https://storage.bunnycdn.com/mock',
      cdnPath: `/videos/${courseId}/${fileName}`,
      headers: {},
    });
  },

  // Access Management (Ученики и доступы)
  getAccesses: async (): Promise<StudentAccess[]> => {
    const { accesses } = getPersistentStore();
    return Promise.resolve(accesses);
  },

  grantAccess: async (data: {
    userEmail: string;
    userName?: string;
    courseId: string;
    tariff: string;
    durationDays: number;
  }): Promise<StudentAccess> => {
    const { courses, accesses } = getPersistentStore();
    const course = courses.find((c) => c.id === data.courseId) || courses[0];
    const expires = new Date();
    expires.setDate(expires.getDate() + (data.durationDays || 365));

    const newAccess: StudentAccess = {
      id: uuidv4(),
      userEmail: data.userEmail,
      userName: data.userName || data.userEmail.split('@')[0],
      courseId: course ? course.id : 'reelslab-course-01',
      courseTitle: course ? course.title : 'ReelsLab',
      tariff: data.tariff || 'VIP',
      accessExpiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccess, ...accesses.filter((a) => a.userEmail !== data.userEmail)];
    savePersistentAccesses(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_name', newAccess.userName);
      localStorage.setItem('user_email', newAccess.userEmail);
      localStorage.setItem('activeStudentId', newAccess.id);
    }

    return Promise.resolve(newAccess);
  },

  registerStudentUser: async (userEmail: string, userName?: string): Promise<StudentAccess> => {
    const { courses, accesses } = getPersistentStore();
    const course = courses[0];
    const expires = new Date('2026-12-31T23:59:59.000Z');

    const newAccess: StudentAccess = {
      id: uuidv4(),
      userEmail,
      userName: userName || userEmail.split('@')[0],
      courseId: course ? course.id : 'reelslab-course-01',
      courseTitle: course ? course.title : 'ReelsLab — Вирусный контент',
      tariff: 'VIP',
      accessExpiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccess, ...accesses.filter((a) => a.userEmail !== userEmail)];
    savePersistentAccesses(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_name', newAccess.userName);
      localStorage.setItem('user_email', newAccess.userEmail);
      localStorage.setItem('activeStudentId', newAccess.id);
    }

    return Promise.resolve(newAccess);
  },

  revokeAccess: async (accessId: string) => {
    const { accesses } = getPersistentStore();
    const updated = accesses.filter((a) => a.id !== accessId);
    savePersistentAccesses(updated);

    if (typeof window !== 'undefined' && updated.length === 0) {
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('activeStudentId');
    }

    return Promise.resolve({ success: true });
  },

  // Очистить ВСЕХ учеников и сбросить активное состояние
  deleteAllStudents: async () => {
    savePersistentAccesses([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('activeStudentId');
      localStorage.removeItem('reelslab_user_accesses');
    }

    return Promise.resolve({ success: true });
  },
};
