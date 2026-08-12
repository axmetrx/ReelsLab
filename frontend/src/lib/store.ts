'use client';

import { useState, useEffect } from 'react';

export interface Lesson {
  id: string;
  title: string;
  type?: 'VIDEO' | 'FILE' | 'HOMEWORK' | string;
  duration?: number;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  modules: Module[];
}

export interface GrantedCourse {
  courseId: string;
  tariff: 'VIP' | 'Base' | string;
  expiresAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  grantedCourses: GrantedCourse[];
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  grantedCourses: GrantedCourse[];
}

const STORAGE_COURSES = 'lms_courses_v1';
const STORAGE_USERS = 'lms_users_v1';
const STORAGE_CURRENT_USER = 'lms_current_user_v1';
const EVENT_NAME = 'lms_store_updated';

// Helper to generate UUIDs
export const uuid = () => Math.random().toString(36).substring(2, 11);

// Helper to get raw data from localStorage
function getRawData() {
  if (typeof window === 'undefined') {
    return { courses: [] as Course[], users: [] as User[], currentUser: null as CurrentUser | null };
  }

  const courses: Course[] = JSON.parse(localStorage.getItem(STORAGE_COURSES) || '[]');
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
  const currentUser: CurrentUser | null = JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER) || 'null');

  return { courses, users, currentUser };
}

function notifyStoreUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

// React hook to read reactive store state in components
export function useLMSStore() {
  const [state, setState] = useState(getRawData);

  useEffect(() => {
    const handleUpdate = () => {
      setState(getRawData());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    ...state,

    // Auth & User Actions
    registerUser: (name: string, email: string, password?: string) => {
      const { users } = getRawData();
      const newStudent: User = {
        id: uuid(),
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        password: password || '123456',
        grantedCourses: [],
      };

      const updatedUsers = [newStudent, ...users.filter((u) => u.email !== email.trim())];
      const activeUser: CurrentUser = {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        role: 'student',
        grantedCourses: [],
      };

      localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(activeUser));
      notifyStoreUpdate();
      return newStudent;
    },

    loginUser: (email: string) => {
      const { users } = getRawData();
      const existing = users.find((u) => u.email === email.trim());

      if (existing) {
        const activeUser: CurrentUser = {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          role: 'student',
          grantedCourses: existing.grantedCourses || [],
        };
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(activeUser));
        notifyStoreUpdate();
        return activeUser;
      }
      return null;
    },

    logout: () => {
      localStorage.removeItem(STORAGE_CURRENT_USER);
      notifyStoreUpdate();
    },

    switchCurrentUser: (user: CurrentUser | null) => {
      if (user) {
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER);
      }
      notifyStoreUpdate();
    },

    // Admin Course Actions
    createCourse: (title: string, description: string) => {
      const { courses } = getRawData();
      const newCourse: Course = {
        id: uuid(),
        title: title.trim(),
        description: description.trim(),
        bannerUrl: '/banner.jpg',
        modules: [],
      };
      const updatedCourses = [newCourse, ...courses];
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(updatedCourses));
      notifyStoreUpdate();
      return newCourse;
    },

    addModule: (courseId: string, title: string) => {
      const { courses } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          const newModule: Module = { id: uuid(), title: title.trim(), lessons: [] };
          return { ...c, modules: [...c.modules, newModule] };
        }
        return c;
      });
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(updated));
      notifyStoreUpdate();
    },

    deleteModule: (courseId: string, moduleId: string) => {
      const { courses } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return { ...c, modules: c.modules.filter((m) => m.id !== moduleId) };
        }
        return c;
      });
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(updated));
      notifyStoreUpdate();
    },

    addLesson: (
      courseId: string,
      moduleId: string,
      lessonData: { title: string; type?: string; videoUrl?: string; duration?: number }
    ) => {
      const { courses } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          const newModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const newLesson: Lesson = {
                id: uuid(),
                title: lessonData.title.trim(),
                type: lessonData.type || 'VIDEO',
                duration: lessonData.duration || 10,
                videoUrl:
                  lessonData.videoUrl ||
                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              };
              return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
          });
          return { ...c, modules: newModules };
        }
        return c;
      });
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(updated));
      notifyStoreUpdate();
    },

    deleteLesson: (courseId: string, moduleId: string, lessonId: string) => {
      const { courses } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          const newModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
            }
            return m;
          });
          return { ...c, modules: newModules };
        }
        return c;
      });
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(updated));
      notifyStoreUpdate();
    },

    // Admin Access Actions
    grantAccess: (studentId: string, courseId: string, tariff: 'VIP' | 'Base') => {
      const { users, currentUser } = getRawData();
      const updatedUsers = users.map((u) => {
        if (u.id === studentId) {
          const expires = new Date();
          expires.setDate(expires.getDate() + 365);

          const granted: GrantedCourse = {
            courseId,
            tariff,
            expiresAt: expires.toISOString(),
          };

          const existingGranted = (u.grantedCourses || []).filter((g) => g.courseId !== courseId);
          return { ...u, grantedCourses: [granted, ...existingGranted] };
        }
        return u;
      });

      localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));

      if (currentUser && currentUser.id === studentId) {
        const updatedStudent = updatedUsers.find((u) => u.id === studentId);
        if (updatedStudent) {
          const updatedActiveUser: CurrentUser = {
            ...currentUser,
            grantedCourses: updatedStudent.grantedCourses,
          };
          localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedActiveUser));
        }
      }

      notifyStoreUpdate();
    },

    // Admin Data Cleanup
    clearCourses: () => {
      const { users, currentUser } = getRawData();
      const updatedUsers = users.map((u) => ({ ...u, grantedCourses: [] }));

      localStorage.setItem(STORAGE_COURSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));

      if (currentUser && currentUser.role === 'student') {
        const updatedActiveUser: CurrentUser = { ...currentUser, grantedCourses: [] };
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedActiveUser));
      }

      notifyStoreUpdate();
    },

    clearUsers: () => {
      localStorage.setItem(STORAGE_USERS, JSON.stringify([]));
      localStorage.removeItem(STORAGE_CURRENT_USER);
      notifyStoreUpdate();
    },

    clearAll: () => {
      localStorage.setItem(STORAGE_COURSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_USERS, JSON.stringify([]));
      localStorage.removeItem(STORAGE_CURRENT_USER);
      notifyStoreUpdate();
    },
  };
}
