'use client';

import React, { useState, useEffect } from 'react';
import { Lesson } from '@/lib/store';
import { X, Video, FileText, Download, Link as LinkIcon, Clock, AlignLeft } from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    type: string;
    videoUrl: string;
    duration: number;
    description: string;
  }) => void;
  initialLesson?: Lesson | null;
  moduleTitle?: string;
}

export default function LessonModal({
  isOpen,
  onClose,
  onSave,
  initialLesson,
  moduleTitle,
}: LessonModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('VIDEO');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('10');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialLesson) {
      setTitle(initialLesson.title || '');
      setType(initialLesson.type || 'VIDEO');
      setVideoUrl(initialLesson.videoUrl || '');
      setDuration(initialLesson.duration ? String(initialLesson.duration) : '10');
      setDescription(initialLesson.description || '');
    } else {
      setTitle('');
      setType('VIDEO');
      setVideoUrl('');
      setDuration('10');
      setDescription('');
    }
  }, [initialLesson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      videoUrl: videoUrl.trim(),
      duration: parseInt(duration, 10) || 10,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
              {moduleTitle ? `Модуль: ${moduleTitle}` : 'Конструктор уроков'}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {initialLesson ? 'Редактировать урок' : 'Добавить новый урок'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Название урока */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Название урока <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Например: Урок 1. Настройка камеры и постановка света"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-300 outline-none focus:border-blue-600 font-medium text-slate-900"
            />
          </div>

          {/* Тип урока и Длительность */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Тип урока
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-300 bg-white font-medium outline-none focus:border-blue-600"
              >
                <option value="VIDEO">📹 Видео-урок</option>
                <option value="HOMEWORK">✍️ Домашнее задание</option>
                <option value="FILE">📄 Файл / Шаблон</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Длительность (в минутах)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock size={14} />
                </div>
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Ссылка на видео */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ссылка на видео (Embed URL / MP4 / Kinescope / Vimeo / YouTube)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon size={16} />
              </div>
              <input
                type="url"
                placeholder="https://player.vimeo.com/video/... или MP4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600 font-medium text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Поддерживаются прямые видеопотоки .mp4 и фреймы плееров (Kinescope, Vimeo, YouTube).
            </p>
          </div>

          {/* Описание / Заметки к уроку */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Описание / Заметки к уроку
            </label>
            <textarea
              rows={3}
              placeholder="Добавьте конспект, ссылки на материалы или инструкции к ДЗ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-300 outline-none focus:border-blue-600 resize-none font-medium text-slate-800"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              {initialLesson ? 'Сохранить изменения' : 'Создать урок'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
