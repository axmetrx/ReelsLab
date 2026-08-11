import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Заполнение базы данных ReelsLab...');

  // Очистка
  await prisma.lessonProgress.deleteMany();
  await prisma.userCourse.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      id: 'user-maria-001',
      email: 'maria@example.com',
      name: 'Мария Иванова',
    },
  });

  const course = await prisma.course.create({
    data: {
      id: 'reelslab-course-01',
      title: 'ReelsLab — Вирусный контент и монетизация',
      description: 'Система, которая превращает блог в рост подписчиков и стабильный заработок.',
    },
  });

  await prisma.userCourse.create({
    data: {
      userId: user.id,
      courseId: course.id,
      tariff: 'VIP',
      accessExpiresAt: new Date('2026-12-31T23:59:59.000Z'),
      progressPercent: 40,
    },
  });

  // Модули
  const mod1 = await prisma.module.create({ data: { id: 'mod-1', courseId: course.id, title: 'Введение и стратегия Reels', order: 1 } });
  const mod2 = await prisma.module.create({ data: { id: 'mod-2', courseId: course.id, title: 'Съемка, свет и динамичный монтаж', order: 2 } });
  const mod3 = await prisma.module.create({ data: { id: 'mod-3', courseId: course.id, title: 'Воронки продаж и аналитика', order: 3 } });

  // Уроки с реальными видео
  const lessons = [];

  // Модуль 1
  lessons.push(await prisma.lesson.create({ data: { id: 'les-1', moduleId: mod1.id, title: 'Урок 1: Формула вирусного видео в 2026 году', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 720 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-2', moduleId: mod1.id, title: 'Урок 2: Позиционирование и целевая аудитория', type: 'VIDEO', order: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: 600 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-3', moduleId: mod1.id, title: 'Задание: Анализ ниши и конкурентов', type: 'HOMEWORK', order: 3 } }));

  // Модуль 2
  lessons.push(await prisma.lesson.create({ data: { id: 'les-4', moduleId: mod2.id, title: 'Урок 3: Настройка камеры и постановка света', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: 840 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-5', moduleId: mod2.id, title: 'Материал: Шаблон контент-плана', type: 'FILE', order: 2 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-6', moduleId: mod2.id, title: 'Урок 4: Монтаж в CapCut — Склеивание и эффекты', type: 'VIDEO', order: 3, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: 900 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-7', moduleId: mod2.id, title: 'Задание: Готовый вирусный ролик', type: 'HOMEWORK', order: 4 } }));

  // Модуль 3
  lessons.push(await prisma.lesson.create({ data: { id: 'les-8', moduleId: mod3.id, title: 'Урок 5: Воронка продаж из Reels в директ', type: 'VIDEO', order: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 960 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-9', moduleId: mod3.id, title: 'Урок 6: Аналитика охватов и удержание', type: 'VIDEO', order: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 780 } }));
  lessons.push(await prisma.lesson.create({ data: { id: 'les-10', moduleId: mod3.id, title: 'Задание: Итоговый проект воронки', type: 'HOMEWORK', order: 3 } }));

  // Первые 3 урока пройдены
  for (let i = 0; i < 3; i++) {
    await prisma.lessonProgress.create({
      data: {
        userId: user.id,
        lessonId: lessons[i].id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  console.log('✅ База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
