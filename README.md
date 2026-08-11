# 🎓 ReelsLab — LMS Platform

Платформа онлайн-курсов в стиле GetCourse / 15study с минималистичным тёмным дизайном.  
Целевая аудитория: взрослые ученики (30–50+ лет).

## Технологический стек

| Слой | Технологии |
|------|-----------|
| **Frontend** | Next.js 14+, React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Video CDN** | Bunny.net (HMAC-SHA256 signed URLs) |

## Структура проекта

```
reelslab/
├── backend/                 # Express API сервер
│   ├── prisma/
│   │   ├── schema.prisma    # Схема БД (6 моделей)
│   │   └── seed.ts          # Тестовые данные
│   └── src/
│       ├── controllers/     # REST API контроллеры
│       ├── services/        # Бизнес-логика
│       ├── middleware/      # Auth middleware
│       ├── lib/             # Prisma client
│       └── index.ts         # Точка входа
├── frontend/                # Next.js приложение
│   └── src/
│       ├── app/             # App Router страницы
│       ├── components/      # React компоненты
│       ├── hooks/           # Custom hooks
│       ├── types/           # TypeScript типы
│       └── lib/             # API клиент
└── docs/
    └── VIDEO_SECURITY.md    # Инструкция по безопасности видео
```

## Быстрый старт

### 1. Подготовка

```bash
# Клонировать репозиторий
git clone <repo-url> reelslab
cd reelslab
```

### 2. Backend

```bash
cd backend

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Отредактируйте .env — укажите DATABASE_URL и ключи Bunny.net

# Применить миграции и заполнить тестовыми данными
npx prisma migrate dev --name init
npx prisma db seed

# Запустить сервер разработки
npm run dev
# Backend запустится на http://localhost:3001
```

### 3. Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
# Frontend запустится на http://localhost:3000
```

### 4. Открыть в браузере

```
http://localhost:3000/course/<course-id>
```

ID курса можно найти в seed-данных или через API:
```bash
curl http://localhost:3001/api/courses
```

## API Endpoints

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `GET` | `/api/courses/:id/tree` | Дерево курса (модули + уроки) с прогрессом |
| `POST` | `/api/lessons/:id/complete` | Отметить урок как пройденный |
| `GET` | `/api/lessons/:id/video-token` | Получить signed URL для видео |

### Пример ответа GET /api/courses/:id/tree

```json
{
  "course": {
    "id": "uuid",
    "title": "Основы цифрового маркетинга",
    "description": "...",
    "coverUrl": null
  },
  "userCourse": {
    "tariff": "VIP",
    "progressPercent": 40,
    "accessExpiresAt": "2026-12-31T00:00:00.000Z"
  },
  "modules": [
    {
      "id": "uuid",
      "title": "Введение в маркетинг",
      "order": 1,
      "completedCount": 3,
      "totalCount": 3,
      "lessons": [
        {
          "id": "uuid",
          "title": "Что такое маркетинг?",
          "type": "VIDEO",
          "order": 1,
          "duration": 720,
          "isCompleted": true
        }
      ]
    }
  ],
  "nextLessonId": "uuid-of-next-incomplete-lesson"
}
```

## Схема базы данных

```
User ──< UserCourse >── Course ──< Module ──< Lesson
 │                                                │
 └──────────────< LessonProgress >────────────────┘
```

- **User** — пользователь (email, имя)
- **Course** — курс (название, описание)
- **UserCourse** — доступ (тариф, прогресс, срок)
- **Module** — модуль курса (порядок, название)
- **Lesson** — урок (тип: VIDEO/HOMEWORK/FILE)
- **LessonProgress** — прогресс (userId + lessonId)

## UX/UI Принципы

- **Крупный шрифт**: body 17px, заголовки 20-24px
- **Контрастность**: WCAG AAA (коэффициент > 7:1)
- **Тёмная тема**: мягкий тёмно-синий фон, не чистый чёрный
- **Крупные кнопки**: минимум 48px высота для удобства нажатия
- **Простая навигация**: прогресс-бар, модули-аккордеоны, sticky CTA

## Безопасность видео

Подробная инструкция: [VIDEO_SECURITY.md](docs/VIDEO_SECURITY.md)

- Signed URLs через HMAC-SHA256 (Bunny.net)
- Токены с ограниченным временем жизни (4 часа)
- Привязка к IP пользователя
- Security Key хранится только на сервере

## Лицензия

MIT
