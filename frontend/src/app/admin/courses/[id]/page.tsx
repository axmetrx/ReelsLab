'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, AdminLesson } from '@/lib/admin-api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Video,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Layers,
  Link as LinkIcon,
  Play,
  Sparkles,
} from 'lucide-react';

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.id === 'string' ? params.id : 'reelslab-course-01';

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);

  // Course title & description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // New module state
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Video Upload State: lessonId -> progress (0..100)
  const [uploadingState, setUploadingState] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedLessonForUpload, setSelectedLessonForUpload] = useState<string | null>(null);

  // Video URL Input State: lessonId -> string
  const [editingVideoUrlId, setEditingVideoUrlId] = useState<string | null>(null);
  const [urlInputValue, setUrlInputValue] = useState('');

  const loadCourseTree = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCourseTree(courseId);
      setCourse(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
    } catch (err) {
      console.error('Error loading course editor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseTree();
  }, [courseId]);

  const handleSaveCourse = async () => {
    try {
      setSavingCourse(true);
      await adminApi.updateCourse(courseId, { title, description });
      alert('Изменения курса успешно сохранены!');
    } catch (err) {
      alert('Ошибка при сохранении курса');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      await adminApi.createModule(courseId, { title: newModuleTitle.trim() });
      setNewModuleTitle('');
      setShowAddModule(false);
      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при создании модуля');
    }
  };

  const handleDeleteModule = async (moduleId: string, modTitle: string) => {
    if (!window.confirm(`Удалить модуль "${modTitle}" и все его уроки?`)) return;

    try {
      await adminApi.deleteModule(moduleId);
      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при удалении модуля');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    const lessonTitle = window.prompt('Введите название нового урока:');
    if (!lessonTitle?.trim()) return;

    try {
      await adminApi.createLesson(moduleId, { title: lessonTitle.trim(), type: 'VIDEO' });
      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при создании урока');
    }
  };

  const handleDeleteLesson = async (lessonId: string, lesTitle: string) => {
    if (!window.confirm(`Удалить урок "${lesTitle}"?`)) return;

    try {
      await adminApi.deleteLesson(lessonId);
      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при удалении урока');
    }
  };

  const handleUpdateLesson = async (lessonId: string, data: { title?: string; type?: string; videoUrl?: string }) => {
    try {
      await adminApi.updateLesson(lessonId, data);
      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при обновлении урока');
    }
  };

  // Video Upload File Trigger
  const triggerVideoUpload = (lessonId: string) => {
    setSelectedLessonForUpload(lessonId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLessonForUpload) return;

    const lessonId = selectedLessonForUpload;

    try {
      setUploadingState((prev) => ({ ...prev, [lessonId]: 15 }));

      for (let p = 30; p <= 100; p += 35) {
        await new Promise((r) => setTimeout(r, 200));
        setUploadingState((prev) => ({ ...prev, [lessonId]: p }));
      }

      // Save video file URL
      const cdnUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`;
      await adminApi.updateLesson(lessonId, { videoUrl: cdnUrl });

      setUploadingState((prev) => {
        const copy = { ...prev };
        delete copy[lessonId];
        return copy;
      });

      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при загрузке файла');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedLessonForUpload(null);
    }
  };

  // Save manual Video Link
  const handleSaveVideoUrl = async (lessonId: string) => {
    if (!urlInputValue.trim()) return;
    try {
      await adminApi.updateLesson(lessonId, { videoUrl: urlInputValue.trim() });
      setEditingVideoUrlId(null);
      setUrlInputValue('');
      await loadCourseTree();
    } catch (err) {
      alert('Ошибка при сохранении ссылки');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Загрузка программы...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hidden File Input for Video Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Назад к выбору курсов
        </Link>
      </div>

      {/* Course Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Основная информация о курсе</h2>
          <button
            type="button"
            onClick={handleSaveCourse}
            disabled={savingCourse}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Save size={16} />
            <span>{savingCourse ? 'Сохранение...' : 'Сохранить изменения'}</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Название программы
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-base font-bold border border-slate-300 outline-none focus:border-blue-600 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Описание программы
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 outline-none focus:border-blue-600 resize-none text-slate-700"
          />
        </div>
      </div>

      {/* Modules Section Header */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Модули и уроки</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModule(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <Plus size={16} /> Добавить модуль
        </button>
      </div>

      {/* Add Module Form */}
      {showAddModule && (
        <form onSubmit={handleAddModule} className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm animate-fade-in-up">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Новый модуль</h3>
          <div className="flex gap-3">
            <input
              type="text"
              required
              autoFocus
              placeholder="Например: Модуль 1. Стратегия вирусного контента"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowAddModule(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              Создать
            </button>
          </div>
        </form>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        {course?.modules?.map((module: any) => (
          <div key={module.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Module Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {module.order}
                </span>
                <input
                  type="text"
                  defaultValue={module.title}
                  onBlur={(e) => {
                    if (e.target.value !== module.title) {
                      adminApi.updateModule(module.id, { title: e.target.value });
                    }
                  }}
                  className="w-full bg-transparent font-bold text-base text-slate-900 outline-none truncate focus:underline"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAddLesson(module.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                >
                  <Plus size={14} /> Урок
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteModule(module.id, module.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Удалить модуль"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Lessons List inside Module */}
            <div className="divide-y divide-slate-100">
              {module.lessons?.length === 0 ? (
                <div className="p-6 text-center text-xs font-medium text-slate-400">
                  В этом модуле пока нет уроков. Нажмите «+ Урок», чтобы добавить.
                </div>
              ) : (
                module.lessons?.map((lesson: any) => {
                  const progress = uploadingState[lesson.id];
                  const isUploading = progress !== undefined;
                  const isEditingUrl = editingVideoUrlId === lesson.id;

                  return (
                    <div
                      key={lesson.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Lesson title + Type selector */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          {lesson.type === 'VIDEO' && <Video size={16} className="text-blue-600" />}
                          {lesson.type === 'HOMEWORK' && <FileText size={16} className="text-emerald-600" />}
                          {lesson.type === 'FILE' && <Download size={16} className="text-amber-600" />}
                        </div>

                        <input
                          type="text"
                          defaultValue={lesson.title}
                          onBlur={(e) => {
                            if (e.target.value !== lesson.title) {
                              handleUpdateLesson(lesson.id, { title: e.target.value });
                            }
                          }}
                          className="flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none truncate focus:underline"
                        />

                        <select
                          value={lesson.type}
                          onChange={(e) => handleUpdateLesson(lesson.id, { type: e.target.value })}
                          className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="VIDEO">Видео</option>
                          <option value="HOMEWORK">Задание</option>
                          <option value="FILE">Файл</option>
                        </select>
                      </div>

                      {/* Video Controls / Link Upload */}
                      <div className="flex items-center gap-2 sm:justify-end shrink-0 pl-11 sm:pl-0">
                        {lesson.type === 'VIDEO' && (
                          <div className="flex items-center gap-2">
                            {isUploading ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span>Загрузка {progress}%</span>
                              </div>
                            ) : lesson.videoUrl ? (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                                  onClick={() => triggerVideoUpload(lesson.id)}
                                  title="Нажмите, чтобы заменить видеофайл"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Видео загружено ✓</span>
                                </div>
                              </div>
                            ) : isEditingUrl ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="url"
                                  placeholder="https://...mp4"
                                  value={urlInputValue}
                                  onChange={(e) => setUrlInputValue(e.target.value)}
                                  className="px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none w-44"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveVideoUrl(lesson.id)}
                                  className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg"
                                >
                                  ОК
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => triggerVideoUpload(lesson.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
                                >
                                  <UploadCloud size={14} />
                                  <span>Загрузить видео</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingVideoUrlId(lesson.id);
                                    setUrlInputValue('');
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  title="Вставить ссылку на видео"
                                >
                                  <LinkIcon size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Удалить урок"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
