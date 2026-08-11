'use client';

import { useState, useEffect } from 'react';
import { CourseTree } from '@/types/course';
import { api } from '@/lib/api';

export function useCourseTree(courseId: string) {
  const [data, setData] = useState<CourseTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const tree = await api.getCourseTree(courseId);
      setData(tree);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Не удалось загрузить данные курса'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [courseId]);

  const markLessonComplete = async (lessonId: string) => {
    if (!data) return;

    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      
      const newModules = prev.modules.map(module => {
        const hasLesson = module.lessons.some(l => l.id === lessonId);
        if (!hasLesson) return module;

        const newLessons = module.lessons.map(l => 
          l.id === lessonId ? { ...l, isCompleted: true } : l
        );
        
        return {
          ...module,
          lessons: newLessons,
          completedCount: module.completedCount + 1
        };
      });

      return {
        ...prev,
        modules: newModules,
        // In a real app we might recalculate nextLessonId or progress here
      };
    });

    try {
      await api.completeLesson(lessonId);
    } catch (err) {
      // Revert on error
      fetchTree();
    }
  };

  return { data, loading, error, refetch: fetchTree, markLessonComplete };
}
