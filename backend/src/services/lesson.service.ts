import prisma from '../lib/prisma';

/**
 * Marks a lesson as completed for a user.
 */
export const completeLesson = async (lessonId: string, userId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true }
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const courseId = lesson.module.courseId;

  // Upsert progress
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { userId, lessonId, isCompleted: true, completedAt: new Date() }
  });

  // Recalculate progress
  const allLessons = await prisma.lesson.count({
    where: { module: { courseId } }
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, lesson: { module: { courseId } }, isCompleted: true }
  });

  const progressPercent = allLessons === 0 ? 0 : Math.round((completedLessons / allLessons) * 100);

  const updatedUserCourse = await prisma.userCourse.update({
    where: { userId_courseId: { userId, courseId } },
    data: { progressPercent }
  });

  return { progressPercent: updatedUserCourse.progressPercent };
};
