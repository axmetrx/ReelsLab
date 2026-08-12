'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLMSStore, Course, Lesson } from '@/lib/store';
import LessonModal from '@/components/LessonModal';
import {
  Plus,
  BookOpen,
  Users,
  Trash2,
  Edit,
  UserCheck,
  Video,
  UserX,
  Film,
  Play,
  Eye,
  FileText,
  Download,
  X,
  CheckCircle2,
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

  // Lesson Modal State (Creating / Editing)
  const [lessonModalConfig, setLessonModalConfig] = useState<{
    isOpen: boolean;
    courseId: string;
    moduleId: string;
    moduleTitle?: string;
    initialLesson?: Lesson | null;
  }>({
    isOpen: false,
    courseId: '',
    moduleId: '',
    initialLesson: null,
  });

  // Video Preview Modal State
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Access Grant Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTariff, setSelectedTariff] = useState<'VIP' | 'Base'>('VIP');
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Course Handlers
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

  // Lesson Modal Handlers
  const openAddLessonModal = (courseId: string, moduleId: string, mTitle: string) => {
    setLessonModalConfig({
      isOpen: true,
      courseId,
      moduleId,
      moduleTitle: mTitle,
      initialLesson: null,
    });
  };

  const openEditLessonModal = (courseId: string, moduleId: string, lesson: Lesson, mTitle: string) => {
    setLessonModalConfig({
      isOpen: true,
      courseId,
      moduleId,
      moduleTitle: mTitle,
      initialLesson: lesson,
    });
  };

  const handleSaveLessonModal = (data: {
    title: string;
    type: string;
    videoUrl: string;
    duration: number;
    description: string;
  }) => {
    const { courseId, moduleId, initialLesson } = lessonModalConfig;

    if (initialLesson) {
      // Редактирование существующего урока
      store.updateLesson(courseId, moduleId, initialLesson.id, data);
    } else {
      // Создание нового урока
      store.addLesson(courseId, moduleId, data);
    }
  };

  const handleDeleteLesson = (courseId: string, moduleId: string, lessonId: string, lTitle: string) => {
    if (window.confirm(`Удалить урок "${lTitle}"?`)) {
      store.deleteLesson(courseId, moduleId, lessonId);
    }
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
    <div className="space-y-6">
      {/* Lesson Modal (Create / Edit) */}
      <LessonModal
        isOpen={lessonModalConfig.isOpen}
        onClose={() => setLessonModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveLessonModal}
        initialLesson={lessonModalConfig.initialLesson}
        moduleTitle={lessonModalConfig.moduleTitle}
      />

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewVideoUrl(null)}
        >
          <div
            className="bg-black rounded-3xl border border-slate-700 shadow-2xl max-w-2xl w-full aspect-video relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X size={18} />
            </button>
            {previewVideoUrl.includes('youtube.com') ||
            previewVideoUrl.includes('youtu.be') ||
            previewVideoUrl.includes('vimeo.com') ||
            previewVideoUrl.includes('kinescope.io') ? (
              <iframe src={previewVideoUrl} className="w-full h-full border-0" allowFullScreen></iframe>
            ) : (
              <video controls autoPlay src={previewVideoUrl} className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'accesses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={15} />
            <span>Ученики ({users.length})</span>
          </button>
        </div>

        {/* Data Reset Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'courses' && courses.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Удалить все созданные курсы?')) store.clearCourses();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
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
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            >
              Очистить всех учеников
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: COURSES & MODULES & LESSONS CRUD */}
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

          {/* New Course Form */}
          {showCourseForm && (
            <form onSubmit={handleCreateCourse} className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-900">Новая обучающая программа</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Название курса</label>
                <input
                  type="text"
                  required
                  placeholder="Например: ReelsLab — Вирусный контент 2026"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Описание программы</label>
                <textarea
                  rows={2}
                  placeholder="Краткое описание программы..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600 resize-none font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Отмена
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700">
                  Сохранить
                </button>
              </div>
            </form>
          )}

          {/* Courses List */}
          {courses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
              <Film size={32} className="mx-auto text-slate-400 mb-2" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">Курсов пока нет (0)</h3>
              <p className="text-xs text-slate-500">Нажмите «Создать курс», чтобы добавить первую обучающую программу.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
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
                        className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Добавить модуль
                      </button>
                    </div>

                    {selectedCourseForModule === course.id && (
                      <form onSubmit={(e) => handleAddModule(e, course.id)} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Например: Модуль 1. Основы стратегии"
                          value={moduleTitle}
                          onChange={(e) => setModuleTitle(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-slate-300 outline-none font-medium"
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                          Создать
                        </button>
                      </form>
                    )}

                    {course.modules.map((m) => (
                      <div key={m.id} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{m.title}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openAddLessonModal(course.id, m.id, m.title)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 cursor-pointer"
                            >
                              <Plus size={13} /> Урок
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Удалить модуль "${m.title}"?`)) {
                                  store.deleteModule(course.id, m.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                              title="Удалить модуль"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Lessons inside Module with EDIT & DELETE & PREVIEW */}
                        <div className="space-y-1.5 pl-1">
                          {m.lessons.length === 0 ? (
                            <div className="text-[11px] text-slate-400 italic">
                              В этом модуле пока нет уроков. Нажмите «+ Урок».
                            </div>
                          ) : (
                            m.lessons.map((l) => (
                              <div
                                key={l.id}
                                className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all text-xs font-medium"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Video size={15} className="text-blue-600 shrink-0" />
                                  <span className="truncate font-semibold text-slate-900">
                                    {l.title}
                                  </span>
                                  {l.duration && (
                                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                      ({l.duration} мин)
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Preview Video Button */}
                                  {l.videoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewVideoUrl(l.videoUrl || null)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Предпросмотр видео"
                                    >
                                      <Eye size={14} />
                                    </button>
                                  )}

                                  {/* Edit Lesson Button */}
                                  <button
                                    type="button"
                                    onClick={() => openEditLessonModal(course.id, m.id, l, m.title)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Редактировать урок"
                                  >
                                    <Edit size={14} />
                                  </button>

                                  {/* Delete Lesson Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(course.id, m.id, l.id, l.title)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Удалить урок"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
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

      {/* TAB 2: STUDENT ACCESSES */}
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
            <form onSubmit={handleGrantAccess} className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-900">Выдача доступа к курсу</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Выберите ученика</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 bg-white font-medium outline-none"
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
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 bg-white font-medium outline-none"
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
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 bg-white font-medium outline-none"
                >
                  <option value="VIP">VIP (Полный доступ)</option>
                  <option value="Base">Базовый</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600"
                >
                  Отмена
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white">
                  Подтвердить и выдать
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          {users.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
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
                                <span key={g.courseId} className="inline-block mr-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
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
    </div>
  );
}
