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
  courseId: string | null;
  courseTitle: string | null;
  tariff: 'VIP' | 'PRO' | 'BASIC' | 'FREE' | 'Доступ не выдан' | string;
  accessExpiresAt: string | null;
  createdAt: string;
}

// Single Source of Truth Persistent Store Manager
const STORE_KEY_COURSES = 'reelslab_persistent_courses_v5';
const STORE_KEY_MODULES = 'reelslab_persistent_modules_v5';
const STORE_KEY_ACCESSES = 'reelslab_persistent_accesses_v5';
const STORE_KEY_INITIALIZED = 'reelslab_store_initialized_v5';

function getPersistentStore() {
  if (typeof window === 'undefined') {
    return { courses: [] as AdminCourse[], modules: [] as AdminModule[], accesses: [] as StudentAccess[] };
  }

  const isInitialized = localStorage.getItem(STORE_KEY_INITIALIZED);

  if (!isInitialized) {
    localStorage.setItem(STORE_KEY_COURSES, JSON.stringify([]));
    localStorage.setItem(STORE_KEY_MODULES, JSON.stringify([]));
    localStorage.setItem(STORE_KEY_ACCESSES, JSON.stringify([]));
    localStorage.setItem(STORE_KEY_INITIALIZED, 'true');
    return { courses: [], modules: [], accesses: [] };
  }

  const storedCourses = localStorage.getItem(STORE_KEY_COURSES);
  const storedModules = localStorage.getItem(STORE_KEY_MODULES);
  const storedAccesses = localStorage.getItem(STORE_KEY_ACCESSES);

  const courses: AdminCourse[] = storedCourses ? JSON.parse(storedCourses) : [];
  const modules: AdminModule[] = storedModules ? JSON.parse(storedModules) : [];
  const accesses: StudentAccess[] = storedAccesses ? JSON.parse(storedAccesses) : [];

  return { courses, modules, accesses };
}

function saveCourses(courses: AdminCourse[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORE_KEY_COURSES, JSON.stringify(courses));
  }
}

function saveModules(modules: AdminModule[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORE_KEY_MODULES, JSON.stringify(modules));
  }
}

function saveAccesses(accesses: StudentAccess[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORE_KEY_ACCESSES, JSON.stringify(accesses));
  }
}

export const adminApi = {
  // Courses CRUD
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
    saveCourses(updated);
    return Promise.resolve(newCourse);
  },

  updateCourse: async (id: string, data: { title?: string; description?: string }): Promise<AdminCourse> => {
    const { courses } = getPersistentStore();
    const course = courses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    if (data.title !== undefined) course.title = data.title;
    if (data.description !== undefined) course.description = data.description;
    saveCourses(courses);
    return Promise.resolve(course);
  },

  deleteCourse: async (id: string) => {
    const { courses, modules, accesses } = getPersistentStore();
    const updatedCourses = courses.filter((c) => c.id !== id);
    const updatedModules = modules.filter((m) => m.courseId !== id);

    // Убрать курс из доступов учеников при удалении курса
    const updatedAccesses = accesses.map((acc) =>
      acc.courseId === id ? { ...acc, courseId: null, courseTitle: null, tariff: 'Доступ не выдан' } : acc
    );

    saveCourses(updatedCourses);
    saveModules(updatedModules);
    saveAccesses(updatedAccesses);
    return Promise.resolve({ success: true });
  },

  // Modules & Course Tree
  getCourseTree: async (courseId: string) => {
    const { courses, modules } = getPersistentStore();
    const course = courses.find((c) => c.id === courseId);

    if (!course) {
      return Promise.resolve(null);
    }

    const courseModules = modules
      .filter((m) => m.courseId === course.id)
      .sort((a, b) => a.order - b.order);

    return Promise.resolve({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        coverUrl: '/banner.jpg',
      },
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
    saveModules(modules);
    return Promise.resolve(newModule);
  },

  updateModule: async (id: string, data: { title?: string; order?: number }): Promise<AdminModule> => {
    const { modules } = getPersistentStore();
    const mod = modules.find((m) => m.id === id);
    if (!mod) throw new Error('Module not found');
    if (data.title !== undefined) mod.title = data.title;
    if (data.order !== undefined) mod.order = data.order;
    saveModules(modules);
    return Promise.resolve(mod);
  },

  deleteModule: async (id: string) => {
    const { modules } = getPersistentStore();
    const updatedModules = modules.filter((m) => m.id !== id);
    saveModules(updatedModules);
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
    saveModules(modules);
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
        saveModules(modules);
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
    saveModules(modules);
    return Promise.resolve({ success: true });
  },

  // Access Management & Registration Logic
  getAccesses: async (): Promise<StudentAccess[]> => {
    const { accesses } = getPersistentStore();
    return Promise.resolve(accesses);
  },

  // Выдача доступа ТОЛЬКО администратором через форму
  grantAccess: async (data: {
    userEmail: string;
    userName?: string;
    courseId: string;
    tariff: string;
    durationDays: number;
  }): Promise<StudentAccess> => {
    const { courses, accesses } = getPersistentStore();
    const course = courses.find((c) => c.id === data.courseId);

    if (!course) {
      throw new Error('Выбранный курс не найден. Сначала создайте курс в панели администратора.');
    }

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
    saveAccesses(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_name', newAccess.userName);
      localStorage.setItem('user_email', newAccess.userEmail);
      localStorage.setItem('activeStudentId', newAccess.id);
    }

    return Promise.resolve(newAccess);
  },

  // Регистрация НОВОГО ученика (БЕЗ автовыдачи VIP или курсов)
  registerStudentUser: async (userEmail: string, userName?: string): Promise<StudentAccess> => {
    const { accesses } = getPersistentStore();

    const newStudent: StudentAccess = {
      id: uuidv4(),
      userEmail,
      userName: userName || userEmail.split('@')[0],
      courseId: null,
      courseTitle: null,
      tariff: 'Доступ не выдан',
      accessExpiresAt: null,
      createdAt: new Date().toISOString(),
    };

    const updated = [newStudent, ...accesses.filter((a) => a.userEmail !== userEmail)];
    saveAccesses(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_name', newStudent.userName);
      localStorage.setItem('user_email', newStudent.userEmail);
      localStorage.setItem('activeStudentId', newStudent.id);
    }

    return Promise.resolve(newStudent);
  },

  revokeAccess: async (accessId: string) => {
    const { accesses } = getPersistentStore();
    const updated = accesses.filter((a) => a.id !== accessId);
    saveAccesses(updated);

    if (typeof window !== 'undefined' && updated.length === 0) {
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('activeStudentId');
    }

    return Promise.resolve({ success: true });
  },

  deleteAllStudents: async () => {
    saveAccesses([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('activeStudentId');
      localStorage.removeItem('currentUser');
    }

    return Promise.resolve({ success: true });
  },
};
