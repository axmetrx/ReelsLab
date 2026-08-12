'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLMSStore } from '@/lib/store';
import {
  Plus,
  BookOpen,
  Users,
  Trash2,
  UserCheck,
  Send,
  Layers,
  Video,
  UserX,
  ExternalLink,
  Film,
} from 'lucide-react';

export default function AdminPanel() {
  const router = useRouter();
  const store = useLMSStore();
  const { courses, users } = store;

  const [activeTab, setActiveTab] = useState<'courses' | 'accesses'>('courses');

  // New Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);

  // New Module Form State
  const [selectedCourseForModule, setSelectedCourseForModule] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');

  // Access Grant Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTariff, setSelectedTariff] = useState<'VIP' | 'Base'>('VIP');
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Вид ученика Handler
  const handleStudentViewClick = () => {
    if (users.length > 0) {
      const firstStudent = users[0];
      store.switchCurrentUser({
        id: firstStudent.id,
        name: firstStudent.name,
        email: firstStudent.email,
        role: 'student',
        grantedCourses: firstStudent.grantedCourses || [],
      });
      router.push('/dashboard');
    } else {
      alert('В базе нет ни одного ученика.\nВы будете перенаправлены на форму регистрации.');
      router.push('/auth');
    }
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    store.createCourse(courseTitle, courseDesc);
    setCourseTitle('');
    setCourseDesc('');
    setShowCourseForm(false);
  };

  const handleAddModule = (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    store.addModule(courseId, moduleTitle);
    setModuleTitle('');
    setSelectedCourseForModule(null);
  };

  const handleAddLesson = (courseId: string, moduleId: string) => {
    const title = window.prompt('Введите название урока:');
    if (!title?.trim()) return;
    store.addLesson(courseId, moduleId, title);
  };

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const student = users.find((u) => u.id === selectedStudentId) || users[0];
    const course = courses.find((c) => c.id === selectedCourseId) || courses[0];

    if (!student) {
      alert('Сначала зарегистрируйте ученика!');
      return;
    }
    if (!course) {
      alert('Сначала создайте хотя бы один курс!');
      return;
    }

    store.grantAccess(student.id, course.id, selectedTariff);
    setShowGrantModal(false);
    alert(`Доступ по тарифу ${selectedTariff} успешно выдан ученику ${student.name}!`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32">
      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
              R
            </div>
            <span className="font-bold text-base text-slate-900">ReelsLab Admin</span>
          </div>

          <button
            type="button"
            onClick={handleStudentViewClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
          >
            <span>Вид ученика</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={15} />
              <span>Курсы ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('accesses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'accesses'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={15} />
              <span>Ученики ({users.length})</span>
            </button>
          </div>

          {/* Clean Up Data Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'courses' && courses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Удалить все созданные курсы?')) store.clearCourses();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
              >
                Удалить все курсы
              </button>
            )}

            {activeTab === 'accesses' && users.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Очистить всех учеников?')) store.clearUsers();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
              >
                Очистить всех учеников
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCourseForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Создать курс</span>
              </button>
            </div>

            {/* Course Creation Modal */}
            {showCourseForm && (
              <form onSubmit={handleCreateCourse} className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Новая обучающая программа</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Название курса</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: ReelsLab — Вирусный контент 2026"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Описание курса</label>
                  <textarea
                    rows={2}
                    placeholder="Краткое описание программы..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCourseForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
                  >
                    Отмена
                  </button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white">
                    Сохранить
                  </button>
                </div>
              </form>
            )}

            {/* Course List */}
            {courses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <Film size={32} className="mx-auto text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">Курсов пока нет (0)</h3>
                <p className="text-xs text-slate-500">Нажмите «Создать курс», чтобы добавить первую программу.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{course.description}</p>
                    </div>

                    {/* Modules List inside Course */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Модули ({course.modules.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseForModule(course.id)}
                          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Plus size={14} /> Модуль
                        </button>
                      </div>

                      {selectedCourseForModule === course.id && (
                        <form onSubmit={(e) => handleAddModule(e, course.id)} className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Название модуля"
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-slate-300 outline-none"
                          />
                          <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                            ОК
                          </button>
                        </form>
                      )}

                      {course.modules.map((m) => (
                        <div key={m.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{m.title}</span>
                            <button
                              type="button"
                              onClick={() => handleAddLesson(course.id, m.id)}
                              className="text-[11px] font-semibold text-blue-600 hover:underline"
                            >
                              + Урок
                            </button>
                          </div>

                          <div className="space-y-1 pl-2">
                            {m.lessons.map((l) => (
                              <div key={l.id} className="text-xs font-medium text-slate-700 flex items-center gap-2 py-0.5">
                                <Video size={13} className="text-blue-600" />
                                <span>{l.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACCESSES */}
        {activeTab === 'accesses' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (users.length > 0 && !selectedStudentId) setSelectedStudentId(users[0].id);
                  if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0].id);
                  setShowGrantModal(true);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-4 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <UserCheck size={16} />
                <span>Выдать доступ ученику</span>
              </button>
            </div>

            {/* Access Grant Modal */}
            {showGrantModal && (
              <form onSubmit={handleGrantAccess} className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Выдача доступа к курсу</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Выберите ученика</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Выберите курс</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Тариф</label>
                  <select
                    value={selectedTariff}
                    onChange={(e) => setSelectedTariff(e.target.value as 'VIP' | 'Base')}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white"
                  >
                    <option value="VIP">VIP (Полный доступ)</option>
                    <option value="Base">Базовый</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGrantModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
                  >
                    Отмена
                  </button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white">
                    Подтвердить и выдать
                  </button>
                </div>
              </form>
            )}

            {/* Users List */}
            {users.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <UserX size={32} className="mx-auto text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">Учеников пока нет (0)</h3>
                <p className="text-xs text-slate-500">Зарегистрируйтесь на странице авторизации `/auth`.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="py-3 px-4">Ученик</th>
                        <th className="py-3 px-4">Выданные доступы</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            {u.grantedCourses?.length === 0 ? (
                              <span className="text-slate-400 italic">Доступ не выдан</span>
                            ) : (
                              u.grantedCourses?.map((g) => {
                                const course = courses.find((c) => c.id === g.courseId);
                                return (
                                  <span key={g.courseId} className="inline-block mr-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                    {course?.title || 'Курс'} ({g.tariff})
                                  </span>
                                );
                              })
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
