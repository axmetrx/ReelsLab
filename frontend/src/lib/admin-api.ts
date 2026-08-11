const uuidv4 = () => Math.random().toString(36).substring(2, 11);

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

// Initial Data Store
let mockCourses: AdminCourse[] = [
  {
    id: 'reelslab-course-01',
    title: 'ReelsLab — Вирусный контент и монетизация',
    description: 'Система, которая превращает блог в рост подписчиков и стабильный заработок.',
    createdAt: new Date().toISOString(),
    _count: { modules: 3, lessons: 10 },
  },
  {
    id: 'course-capcut-02',
    title: 'Продвинутый монтаж в CapCut',
    description: 'Секреты динамичного монтажа, работы со светом и цвета для Reels.',
    createdAt: new Date().toISOString(),
    _count: { modules: 1, lessons: 3 },
  }
];

let mockModules: AdminModule[] = [
  {
    id: 'mod-1',
    courseId: 'reelslab-course-01',
    title: 'Введение и стратегия Reels',
    order: 1,
    lessons: [
      { id: 'les-1', moduleId: 'mod-1', title: 'Формула вирусного видео в 2026 году', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 720 },
      { id: 'les-2', moduleId: 'mod-1', title: 'Позиционирование и целевая аудитория', type: 'VIDEO', order: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: 600 },
      { id: 'les-3', moduleId: 'mod-1', title: 'Домашнее задание: Анализ ниши и конкурентов', type: 'HOMEWORK', order: 3 },
    ]
  },
  {
    id: 'mod-2',
    courseId: 'reelslab-course-01',
    title: 'Съемка, свет и динамичный монтаж',
    order: 2,
    lessons: [
      { id: 'les-4', moduleId: 'mod-2', title: 'Настройка камеры телефона и постановка света', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: 840 },
      { id: 'les-5', moduleId: 'mod-2', title: 'Шаблон контент-плана и сценариев', type: 'FILE', order: 2 },
      { id: 'les-6', moduleId: 'mod-2', title: 'Монтаж в CapCut: Склеивание и эффекты', type: 'VIDEO', order: 3, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: 900 }
    ]
  },
  {
    id: 'mod-3',
    courseId: 'reelslab-course-01',
    title: 'Воронки продаж и аналитика',
    order: 3,
    lessons: [
      { id: 'les-8', moduleId: 'mod-3', title: 'Как вести зрителя из Reels в директ и продажи', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 960 },
      { id: 'les-9', moduleId: 'mod-3', title: 'Аналитика охватов и удержание внимания', type: 'VIDEO', order: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 780 }
    ]
  }
];

let defaultStudentAccesses: StudentAccess[] = [
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
  {
    id: 'acc-2',
    userEmail: 'alexey@example.com',
    userName: 'Алексей Петров',
    courseId: 'reelslab-course-01',
    courseTitle: 'ReelsLab — Вирусный контент и монетизация',
    tariff: 'PRO',
    accessExpiresAt: '2026-08-31T23:59:59.000Z',
    createdAt: new Date().toISOString(),
  }
];

function getStoredAccesses(): StudentAccess[] {
  if (typeof window === 'undefined') return defaultStudentAccesses;
  const stored = localStorage.getItem('reelslab_admin_student_accesses');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultStudentAccesses;
    }
  }
  localStorage.setItem('reelslab_admin_student_accesses', JSON.stringify(defaultStudentAccesses));
  return defaultStudentAccesses;
}

function saveStoredAccesses(accesses: StudentAccess[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('reelslab_admin_student_accesses', JSON.stringify(accesses));
  }
}

export const adminApi = {
  // Courses
  getCourses: async (): Promise<AdminCourse[]> => {
    return Promise.resolve([...mockCourses]);
  },

  createCourse: async (data: { title: string; description?: string }): Promise<AdminCourse> => {
    const newCourse: AdminCourse = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      _count: { modules: 0, lessons: 0 },
    };
    mockCourses.unshift(newCourse);
    return Promise.resolve(newCourse);
  },

  updateCourse: async (id: string, data: { title?: string; description?: string }): Promise<AdminCourse> => {
    const course = mockCourses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    if (data.title !== undefined) course.title = data.title;
    if (data.description !== undefined) course.description = data.description;
    return Promise.resolve(course);
  },

  deleteCourse: async (id: string) => {
    mockCourses = mockCourses.filter((c) => c.id !== id);
    mockModules = mockModules.filter((m) => m.courseId !== id);
    return Promise.resolve({ success: true });
  },

  // Modules
  getCourseTree: async (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
    const modules = mockModules
      .filter((m) => m.courseId === course.id)
      .sort((a, b) => a.order - b.order);

    return Promise.resolve({
      ...course,
      modules,
    });
  },

  createModule: async (courseId: string, data: { title: string }): Promise<AdminModule> => {
    const courseModules = mockModules.filter((m) => m.courseId === courseId);
    const newModule: AdminModule = {
      id: uuidv4(),
      courseId,
      title: data.title,
      order: courseModules.length + 1,
      lessons: [],
    };
    mockModules.push(newModule);
    return Promise.resolve(newModule);
  },

  updateModule: async (id: string, data: { title?: string; order?: number }): Promise<AdminModule> => {
    const mod = mockModules.find((m) => m.id === id);
    if (!mod) throw new Error('Module not found');
    if (data.title !== undefined) mod.title = data.title;
    if (data.order !== undefined) mod.order = data.order;
    return Promise.resolve(mod);
  },

  deleteModule: async (id: string) => {
    mockModules = mockModules.filter((m) => m.id !== id);
    return Promise.resolve({ success: true });
  },

  // Lessons
  createLesson: async (moduleId: string, data: { title: string; type: string }): Promise<AdminLesson> => {
    const mod = mockModules.find((m) => m.id === moduleId);
    if (!mod) throw new Error('Module not found');

    const newLesson: AdminLesson = {
      id: uuidv4(),
      moduleId,
      title: data.title,
      type: data.type || 'VIDEO',
      order: mod.lessons.length + 1,
      videoUrl: '',
    };
    mod.lessons.push(newLesson);
    return Promise.resolve(newLesson);
  },

  updateLesson: async (
    id: string,
    data: { title?: string; type?: string; videoUrl?: string; duration?: number }
  ): Promise<AdminLesson> => {
    for (const mod of mockModules) {
      const lesson = mod.lessons.find((l) => l.id === id);
      if (lesson) {
        if (data.title !== undefined) lesson.title = data.title;
        if (data.type !== undefined) lesson.type = data.type;
        if (data.videoUrl !== undefined) lesson.videoUrl = data.videoUrl;
        if (data.duration !== undefined) lesson.duration = data.duration;
        return Promise.resolve(lesson);
      }
    }
    throw new Error('Lesson not found');
  },

  deleteLesson: async (id: string) => {
    for (const mod of mockModules) {
      mod.lessons = mod.lessons.filter((l) => l.id !== id);
    }
    return Promise.resolve({ success: true });
  },

  // Presigned URL mock for direct video upload
  getPresignedUrl: async (courseId: string, fileName: string) => {
    return Promise.resolve({
      uploadUrl: 'https://storage.bunnycdn.com/mock',
      cdnPath: `/videos/${courseId}/${fileName}`,
      headers: {},
    });
  },

  // Access Management (Ученики и доступы)
  getAccesses: async (): Promise<StudentAccess[]> => {
    return Promise.resolve(getStoredAccesses());
  },

  grantAccess: async (data: {
    userEmail: string;
    userName?: string;
    courseId: string;
    tariff: string;
    durationDays: number;
  }): Promise<StudentAccess> => {
    const accesses = getStoredAccesses();
    const course = mockCourses.find((c) => c.id === data.courseId) || mockCourses[0];
    const expires = new Date();
    expires.setDate(expires.getDate() + (data.durationDays || 365));

    const newAccess: StudentAccess = {
      id: uuidv4(),
      userEmail: data.userEmail,
      userName: data.userName || data.userEmail.split('@')[0],
      courseId: course.id,
      courseTitle: course.title,
      tariff: data.tariff || 'VIP',
      accessExpiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccess, ...accesses.filter((a) => a.userEmail !== data.userEmail)];
    saveStoredAccesses(updated);
    return Promise.resolve(newAccess);
  },

  registerStudentUser: async (userEmail: string, userName?: string): Promise<StudentAccess> => {
    const accesses = getStoredAccesses();
    const course = mockCourses[0];
    const expires = new Date('2026-12-31T23:59:59.000Z');

    const newAccess: StudentAccess = {
      id: uuidv4(),
      userEmail,
      userName: userName || userEmail.split('@')[0],
      courseId: course.id,
      courseTitle: course.title,
      tariff: 'VIP',
      accessExpiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccess, ...accesses.filter((a) => a.userEmail !== userEmail)];
    saveStoredAccesses(updated);
    return Promise.resolve(newAccess);
  },

  revokeAccess: async (accessId: string) => {
    const accesses = getStoredAccesses();
    const updated = accesses.filter((a) => a.id !== accessId);
    saveStoredAccesses(updated);
    return Promise.resolve({ success: true });
  },
};
