'use client';

import { useState, useEffect } from 'react';

export interface Lesson {
  id: string;
  title: string;
  type?: 'VIDEO' | 'FILE' | 'HOMEWORK' | string;
  duration?: number;
  videoUrl?: string;
  description?: string;
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

// Next.js Same-Domain Server API Sync (No CORS issues!)
async function syncPushToServer(courses: Course[], users: User[]) {
  try {
    await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses, users }),
    });
  } catch (e) {
    console.error('Push error:', e);
  }
}

async function syncPullFromServer() {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/store', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.courses) || Array.isArray(data?.users)) {
        if (data.courses) localStorage.setItem(STORAGE_COURSES, JSON.stringify(data.courses));
        if (data.users) localStorage.setItem(STORAGE_USERS, JSON.stringify(data.users));
        notifyStoreUpdate();
      }
    }
  } catch (e) {
    console.error('Pull error:', e);
  }
}

// React hook to read reactive store state in components
export function useLMSStore() {
  const [state, setState] = useState(getRawData);

  useEffect(() => {
    // Sync from server when component mounts
    syncPullFromServer();

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

  const saveLocalAndServer = (courses: Course[], users: User[]) => {
    localStorage.setItem(STORAGE_COURSES, JSON.stringify(courses));
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    notifyStoreUpdate();
    syncPushToServer(courses, users);
  };

  return {
    ...state,

    // Auth & User Actions
    registerUser: (name: string, email: string, password?: string) => {
      const { courses, users } = getRawData();
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

      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(activeUser));
      saveLocalAndServer(courses, updatedUsers);
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
      const { courses, users } = getRawData();
      const newCourse: Course = {
        id: uuid(),
        title: title.trim(),
        description: description.trim(),
        bannerUrl: '/banner.jpg',
        modules: [],
      };
      const updatedCourses = [newCourse, ...courses];
      saveLocalAndServer(updatedCourses, users);
      return newCourse;
    },

    addModule: (courseId: string, title: string) => {
      const { courses, users } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          const newModule: Module = { id: uuid(), title: title.trim(), lessons: [] };
          return { ...c, modules: [...c.modules, newModule] };
        }
        return c;
      });
      saveLocalAndServer(updated, users);
    },

    deleteModule: (courseId: string, moduleId: string) => {
      const { courses, users } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return { ...c, modules: c.modules.filter((m) => m.id !== moduleId) };
        }
        return c;
      });
      saveLocalAndServer(updated, users);
    },

    addLesson: (
      courseId: string,
      moduleId: string,
      lessonData: { title: string; type?: string; videoUrl?: string; duration?: number; description?: string }
    ) => {
      const { courses, users } = getRawData();
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
                description: lessonData.description || '',
              };
              return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
          });
          return { ...c, modules: newModules };
        }
        return c;
      });
      saveLocalAndServer(updated, users);
    },

    updateLesson: (
      courseId: string,
      moduleId: string,
      lessonId: string,
      lessonData: { title?: string; type?: string; videoUrl?: string; duration?: number; description?: string }
    ) => {
      const { courses, users } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          const newModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const newLessons = m.lessons.map((l) => {
                if (l.id === lessonId) {
                  return {
                    ...l,
                    title: lessonData.title !== undefined ? lessonData.title.trim() : l.title,
                    type: lessonData.type !== undefined ? lessonData.type : l.type,
                    videoUrl: lessonData.videoUrl !== undefined ? lessonData.videoUrl.trim() : l.videoUrl,
                    duration: lessonData.duration !== undefined ? lessonData.duration : l.duration,
                    description: lessonData.description !== undefined ? lessonData.description.trim() : l.description,
                  };
                }
                return l;
              });
              return { ...m, lessons: newLessons };
            }
            return m;
          });
          return { ...c, modules: newModules };
        }
        return c;
      });
      saveLocalAndServer(updated, users);
    },

    deleteLesson: (courseId: string, moduleId: string, lessonId: string) => {
      const { courses, users } = getRawData();
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
      saveLocalAndServer(updated, users);
    },

    // Admin Access Actions
    grantAccess: (studentId: string, courseId: string, tariff: 'VIP' | 'Base') => {
      const { courses, users, currentUser } = getRawData();
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

      saveLocalAndServer(courses, updatedUsers);
    },

    // Admin Data Cleanup
    clearCourses: () => {
      const { users, currentUser } = getRawData();
      const updatedUsers = users.map((u) => ({ ...u, grantedCourses: [] }));

      if (currentUser && currentUser.role === 'student') {
        const updatedActiveUser: CurrentUser = { ...currentUser, grantedCourses: [] };
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedActiveUser));
      }

      saveLocalAndServer([], updatedUsers);
    },

    clearUsers: () => {
      const { courses } = getRawData();
      localStorage.removeItem(STORAGE_CURRENT_USER);
      saveLocalAndServer(courses, []);
    },

    clearAll: () => {
      localStorage.removeItem(STORAGE_CURRENT_USER);
      saveLocalAndServer([], []);
    },

    syncNow: () => {
      syncPullFromServer();
    },
  };
}
