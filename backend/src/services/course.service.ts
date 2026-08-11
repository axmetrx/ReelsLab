import prisma from '../lib/prisma';

/**
 * Fetches course with modules, lessons, and user's progress.
 * Returns structure matching frontend CourseTree type.
 */
export const getCourseTree = async (courseId: string, userId: string) => {
  const userCourse = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!userCourse) {
    throw new Error('Access denied or course not found');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          }
        }
      }
    }
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { module: { courseId } } }
  });

  const completedLessonIds = new Set(progress.filter(p => p.isCompleted).map(p => p.lessonId));

  let totalLessons = 0;
  let totalCompleted = 0;
  let nextLessonId: string | null = null;

  const modulesWithProgress = course.modules.map(mod => {
    let modCompleted = 0;
    const lessons = mod.lessons.map(lesson => {
      const isCompleted = completedLessonIds.has(lesson.id);
      if (isCompleted) modCompleted++;
      if (!isCompleted && !nextLessonId) {
        nextLessonId = lesson.id;
      }
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        isCompleted,
      };
    });

    totalLessons += lessons.length;
    totalCompleted += modCompleted;

    return {
      id: mod.id,
      title: mod.title,
      order: mod.order,
      lessons,
      completedCount: modCompleted,
      totalCount: lessons.length,
    };
  });

  const progressPercent = totalLessons === 0 ? 0 : Math.round((totalCompleted / totalLessons) * 100);

  return {
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      coverUrl: course.coverUrl,
    },
    userCourse: {
      tariff: userCourse.tariff,
      accessExpiresAt: userCourse.accessExpiresAt.toISOString(),
      progressPercent,
    },
    modules: modulesWithProgress,
    nextLessonId,
  };
};
