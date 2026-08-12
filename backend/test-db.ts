import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const courses = await prisma.course.findMany();
    const users = await prisma.user.findMany();
    const lessons = await prisma.lesson.findMany();
    console.log('--- ПОДКЛЮЧЕНИЕ УСПЕШНО ---');
    console.log('Курсы:', courses.length);
    console.log('Пользователи:', users.length);
    console.log('Уроки:', lessons.length);
  } catch (err: any) {
    console.error('--- ОШИБКА ПОДКЛЮЧЕНИЯ ---', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
