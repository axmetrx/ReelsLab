import prisma from '../lib/prisma';

export type LessonType = 'VIDEO' | 'HOMEWORK' | 'FILE' | string;

export const getAllCourses = async () => {
  return await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });
};

export const createCourse = async (data: { title: string; description?: string }) => {
  return await prisma.course.create({
    data,
  });
};

export const updateCourse = async (id: string, data: { title?: string; description?: string }) => {
  return await prisma.course.update({
    where: { id },
    data,
  });
};

export const deleteCourse = async (id: string) => {
  return await prisma.course.delete({
    where: { id },
  });
};

export const createModule = async (courseId: string, data: { title: string }) => {
  const existingModules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'desc' },
    take: 1,
  });
  
  const order = existingModules.length > 0 ? existingModules[0].order + 1 : 1;

  return await prisma.module.create({
    data: {
      ...data,
      order,
      courseId,
    },
  });
};

export const updateModule = async (id: string, data: { title?: string; order?: number }) => {
  return await prisma.module.update({
    where: { id },
    data,
  });
};

export const deleteModule = async (id: string) => {
  return await prisma.module.delete({
    where: { id },
  });
};

export const createLesson = async (moduleId: string, data: { title: string; type: LessonType }) => {
  const existingLessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { order: 'desc' },
    take: 1,
  });

  const order = existingLessons.length > 0 ? existingLessons[0].order + 1 : 1;

  return await prisma.lesson.create({
    data: {
      ...data,
      order,
      moduleId,
    },
  });
};

export const updateLesson = async (id: string, data: { title?: string; type?: LessonType; videoUrl?: string; duration?: number }) => {
  return await prisma.lesson.update({
    where: { id },
    data,
  });
};

export const deleteLesson = async (id: string) => {
  return await prisma.lesson.delete({
    where: { id },
  });
};
