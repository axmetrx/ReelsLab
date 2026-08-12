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

// Cloud Sync Endpoint (Free Shared JSON Store for ReelsLab across devices)
const CLOUD_SYNC_BIN_ID = '67ab2d6de41b4d34e489ec6f'; // Public sync bin key
const CLOUD_SYNC_URL = `https://api.jsonbin.io/v3/b/${CLOUD_SYNC_BIN_ID}`;

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

// Background Cloud Sync Push
async function pushToCloud(courses: Course[], users: User[]) {
  try {
    await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': '$2a$10$wE9.mG9SgS7q1N/2a.NnU.6bN2/x1/qU6Y5wO',
      },
      body: JSON.stringify({ courses, users }),
    });
  } catch (e) {
    // Fail-safe silent catch if offline
  }
}

// Background Cloud Sync Pull
async function pullFromCloud() {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(CLOUD_SYNC_URL, {
      headers: {
        'X-Master-Key': '$2a$10$wE9.mG9SgS7q1N/2a.NnU.6bN2/x1/qU6Y5wO',
      },
    });
    if (res.ok) {
      const body = await res.json();
      const record = body?.record || body;
      if (record && (Array.isArray(record.courses) || Array.isArray(record.users))) {
        if (record.courses) localStorage.setItem(STORAGE_COURSES, JSON.stringify(record.courses));
        if (record.users) localStorage.setItem(STORAGE_USERS, JSON.stringify(record.users));
        notifyStoreUpdate();
      }
    }
  } catch (e) {
    // Fail-safe silent catch if offline
  }
}

// React hook to read reactive store state in components
export function useLMSStore() {
  const [state, setState] = useState(getRawData);

  useEffect(() => {
    // 1. Initial Cloud Sync on mount
    pullFromCloud();

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

  const saveLocalAndCloud = (courses: Course[], users: User[]) => {
    localStorage.setItem(STORAGE_COURSES, JSON.stringify(courses));
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    notifyStoreUpdate();
    pushToCloud(courses, users);
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
      saveLocalAndCloud(courses, updatedUsers);
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
      saveLocalAndCloud(updatedCourses, users);
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
      saveLocalAndCloud(updated, users);
    },

    deleteModule: (courseId: string, moduleId: string) => {
      const { courses, users } = getRawData();
      const updated = courses.map((c) => {
        if (c.id === courseId) {
          return { ...c, modules: c.modules.filter((m) => m.id !== moduleId) };
        }
        return c;
      });
      saveLocalAndCloud(updated, users);
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
      saveLocalAndCloud(updated, users);
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
      saveLocalAndCloud(updated, users);
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
      saveLocalAndCloud(updated, users);
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

      saveLocalAndCloud(courses, updatedUsers);
    },

    // Admin Data Cleanup
    clearCourses: () => {
      const { users, currentUser } = getRawData();
      const updatedUsers = users.map((u) => ({ ...u, grantedCourses: [] }));

      if (currentUser && currentUser.role === 'student') {
        const updatedActiveUser: CurrentUser = { ...currentUser, grantedCourses: [] };
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedActiveUser));
      }

      saveLocalAndCloud([], updatedUsers);
    },

    clearUsers: () => {
      const { courses } = getRawData();
      localStorage.removeItem(STORAGE_CURRENT_USER);
      saveLocalAndCloud(courses, []);
    },

    clearAll: () => {
      localStorage.removeItem(STORAGE_CURRENT_USER);
      saveLocalAndCloud([], []);
    },

    syncNow: () => {
      pullFromCloud();
    },
  };
}
