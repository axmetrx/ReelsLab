'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi, AdminCourse, StudentAccess } from '@/lib/admin-api';
import {
  Plus,
  BookOpen,
  Layers,
  Trash2,
  Edit3,
  Film,
  ArrowRight,
  UserCheck,
  Mail,
  Calendar,
  Copy,
  Check,
  Send,
  Users,
  BarChart3,
  TrendingUp,
  Video,
  UserX,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'courses' | 'accesses' | 'analytics'>('courses');

  // Courses State
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Accesses State
  const [accesses, setAccesses] = useState<StudentAccess[]>([]);
  const [loadingAccesses, setLoadingAccesses] = useState(true);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tariff, setTariff] = useState('VIP');
  const [durationDays, setDurationDays] = useState('365');
  const [granting, setGranting] = useState(false);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await adminApi.getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAccesses = async () => {
    try {
      setLoadingAccesses(true);
      const data = await adminApi.getAccesses();
      setAccesses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccesses(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadAccesses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreatingCourse(true);
      await adminApi.createCourse({ title: newTitle.trim(), description: newDesc.trim() });
      setNewTitle('');
      setNewDesc('');
      setShowCreateCourseModal(false);
      await loadCourses();
    } catch (err) {
      alert('Ошибка при создании курса');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить курс "${title}"?`)) return;

    try {
      await adminApi.deleteCourse(id);
      await loadCourses();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;

    try {
      setGranting(true);
      const newAccess = await adminApi.grantAccess({
        userEmail: userEmail.trim(),
        userName: userName.trim(),
        courseId: selectedCourseId || (courses[0] ? courses[0].id : 'reelslab-course-01'),
        tariff,
        durationDays: parseInt(durationDays, 10) || 365,
      });

      setUserEmail('');
      setUserName('');
      setShowGrantModal(false);
      await loadAccesses();

      const studentLink = `${window.location.origin}/course/${newAccess.courseId}`;
      navigator.clipboard.writeText(studentLink);
      alert(`Доступ успешно открыт для ${userEmail}!\nСсылка скопирована в буфер обмена: ${studentLink}`);
    } catch (err) {
      alert('Ошибка при выдаче доступа');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokeAccess = async (id: string, email: string) => {
    if (!window.confirm(`Отозвать доступ у ученика ${email}?`)) return;

    try {
      await adminApi.revokeAccess(id);
      await loadAccesses();
    } catch (err) {
      alert('Ошибка при отзыве доступа');
    }
  };

  const handleDeleteAllStudents = async () => {
    if (!window.confirm('Вы уверены, что хотите полностью очистить список всех учеников?')) return;

    try {
      await adminApi.deleteAllStudents();
      await loadAccesses();
    } catch (err) {
      alert('Ошибка при очистке списка учеников');
    }
  };

  const copyStudentLink = (accessId: string, courseId: string) => {
    const studentLink = `${window.location.origin}/course/${courseId}`;
    navigator.clipboard.writeText(studentLink);
    setCopiedId(accessId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={16} />
            <span>Курсы ({courses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accesses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'accesses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users size={16} />
            <span>Ученики ({accesses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={16} />
            <span>Аналитика</span>
          </button>
        </div>

        {/* Action Button */}
        {activeTab === 'courses' && (
          <button
            type="button"
            onClick={() => setShowCreateCourseModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span>Создать новый курс</span>
          </button>
        )}

        {activeTab === 'accesses' && (
          <div className="flex items-center gap-2">
            {accesses.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAllStudents}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-200"
              >
                <UserX size={16} />
                <span>Очистить всех</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGrantModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
            >
              <UserCheck size={18} />
              <span>Выдать доступ ученику</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Create Course Form */}
          {showCreateCourseModal && (
            <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
              <h3 className="text-base font-bold text-slate-900 mb-4">Создание нового курса</h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Название программы *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: ReelsLab — Вирусный контент 2026"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Описание программы
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Краткое описание курса для учеников..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 resize-none font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateCourseModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCourse}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {creatingCourse ? 'Создание...' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses List Grid */}
          {loadingCourses ? (
            <div className="py-16 text-center text-slate-500 font-medium">Загрузка программ...</div>
          ) : courses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
              <Film size={32} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">Курсов пока нет</h3>
              <p className="text-sm text-slate-500 mb-4">Нажмите «Создать новый курс», чтобы начать.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {course.title}
                      </h3>

                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Удалить курс"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {course.description || 'Без описания'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-4 py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Layers size={15} className="text-blue-600" />
                        <span>{course._count?.modules || 3} модулей</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Video size={15} className="text-blue-600" />
                        <span>{course._count?.lessons || 10} уроков</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 size={16} />
                      <span>Редактировать уроки и видео</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACCESSES */}
      {activeTab === 'accesses' && (
        <div className="space-y-6">
          {/* Grant Access Form */}
          {showGrantModal && (
            <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck size={20} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Выдача персонального доступа</h3>
              </div>
              <form onSubmit={handleGrantAccess} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email ученика *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Имя ученика (для справки)
                    </label>
                    <input
                      type="text"
                      placeholder="Анастасия Смирнова"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Курс *
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-300 outline-none bg-white font-medium"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Тариф *
                    </label>
                    <select
                      value={tariff}
                      onChange={(e) => setTariff(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-300 outline-none bg-white font-medium"
                    >
                      <option value="VIP">VIP (Полный)</option>
                      <option value="PRO">PRO (Продвинутый)</option>
                      <option value="BASIC">BASIC (Базовый)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Срок доступа *
                    </label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-300 outline-none bg-white font-medium"
                    >
                      <option value="3650">Бессрочно (Навсегда)</option>
                      <option value="365">1 год (365 дней)</option>
                      <option value="180">6 месяцев</option>
                      <option value="90">3 месяца</option>
                      <option value="30">1 месяц</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGrantModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={granting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{granting ? 'Сохранение...' : 'Открыть доступ и скопировать ссылку'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Accesses Table or Empty State */}
          {loadingAccesses ? (
            <div className="py-16 text-center text-slate-500 font-medium">Загрузка списка учеников...</div>
          ) : accesses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto animate-fade-in-up">
              <UserX size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">Учеников пока нет</h3>
              <p className="text-sm text-slate-500 mb-5">
                Список учеников пуст. Нажмите «Выдать доступ ученику», чтобы добавить первого участника.
              </p>
              <button
                type="button"
                onClick={() => setShowGrantModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <UserCheck size={16} />
                <span>Выдать первый доступ</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Ученик</th>
                      <th className="py-4 px-5">Курс</th>
                      <th className="py-4 px-5">Тариф</th>
                      <th className="py-4 px-5">Срок</th>
                      <th className="py-4 px-5 text-right">Персональная ссылка</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accesses.map((acc) => {
                      const dateObj = new Date(acc.accessExpiresAt);
                      const formattedDate = !isNaN(dateObj.getTime())
                        ? dateObj.getFullYear() > 2030
                          ? 'Бессрочно'
                          : dateObj.toLocaleDateString('ru-RU')
                        : acc.accessExpiresAt;

                      const isCopied = copiedId === acc.id;

                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{acc.userName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail size={13} />
                              <span>{acc.userEmail}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-800">
                            {acc.courseTitle}
                          </td>
                          <td className="py-4 px-5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {acc.tariff}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-600 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => copyStudentLink(acc.id, acc.courseId)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  isCopied
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{isCopied ? 'Скопировано!' : 'Скопировать ссылку'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRevokeAccess(acc.id, acc.userEmail)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Отозвать доступ"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Всего учеников</span>
                <Users size={20} className="text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{accesses.length}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <TrendingUp size={14} />
                <span>+100% за всё время</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Активные программы</span>
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{courses.length}</div>
              <div className="text-xs text-slate-500 font-medium mt-2">ReelsLab система</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Завершаемость</span>
                <BarChart3 size={20} className="text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">78%</div>
              <div className="text-xs text-emerald-600 font-semibold mt-2">Высокий результат</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
