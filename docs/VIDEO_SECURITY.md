# 🔒 Безопасность видео — Инструкция

Руководство по защите видеоконтента от несанкционированного скачивания и утечки.

## Архитектура защиты

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Браузер    │────>│  Backend     │────>│  Bunny.net   │
│   (Плеер)    │     │  (Node.js)   │     │  CDN         │
│              │<────│              │     │              │
│  Получает    │     │ Генерирует   │     │ Проверяет    │
│  signed URL  │     │ HMAC-SHA256  │     │ токен        │
└──────────────┘     │ токен        │     └──────────────┘
                     └──────────────┘
```

## 1. Как работает подписание URL (Signed URLs)

### Принцип

Вместо прямой ссылки на видеофайл, сервер генерирует **временную подписанную ссылку**, которая:
- Действительна ограниченное время (4 часа по умолчанию)
- Привязана к IP пользователя (опционально)
- Содержит криптографическую подпись, которую невозможно подделать

### Алгоритм (Bunny.net — HMAC-SHA256)

```typescript
import crypto from 'crypto';

/**
 * Генерация подписанного URL для Bunny.net CDN.
 *
 * @param cdnHostname - Хостнейм CDN (например, "myzone.b-cdn.net")
 * @param securityKey - Секретный ключ из настроек Pull Zone
 * @param videoPath   - Путь к видео (например, "/videos/lesson-1.mp4")
 * @param expiresIn   - Время жизни токена в секундах (по умолчанию 14400 = 4 часа)
 * @param userIp      - IP пользователя для привязки (опционально)
 * @returns Полный подписанный URL
 */
function generateBunnySignedUrl(
  cdnHostname: string,
  securityKey: string,
  videoPath: string,
  expiresIn: number = 14400,
  userIp?: string
): string {
  // 1. Вычисляем timestamp истечения (UNIX, секунды)
  const expires = Math.floor(Date.now() / 1000) + expiresIn;

  // 2. Формируем строку для подписи
  //    Формат: securityKey + path + expires [+ userIp]
  let hashableString = securityKey + videoPath + expires.toString();
  if (userIp) {
    hashableString += userIp;
  }

  // 3. Создаём SHA-256 хеш
  const hash = crypto
    .createHash('sha256')
    .update(hashableString)
    .digest('base64');

  // 4. Конвертируем в Base64URL-safe формат
  //    Замена:  + → -,  / → _,  удаление =
  const token = hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // 5. Собираем финальный URL
  return `https://${cdnHostname}${videoPath}?token=${token}&expires=${expires}`;
}
```

### Пример использования

```typescript
const signedUrl = generateBunnySignedUrl(
  'cdn-video.reelslab.com',     // Ваш CDN хостнейм
  'your-secret-security-key',    // Из настроек Bunny.net
  '/videos/course-1/lesson-3.mp4',
  14400,                          // 4 часа
  '192.168.1.100'                 // IP пользователя
);

// Результат:
// https://cdn-video.reelslab.com/videos/course-1/lesson-3.mp4?token=abc123...&expires=1723456789
```

## 2. Настройка Bunny.net Pull Zone

### Шаг 1: Создание Pull Zone

1. Зайдите в [Bunny.net Dashboard](https://dash.bunny.net)
2. Создайте новый Pull Zone для видеофайлов
3. Укажите Origin URL (ваше хранилище)

### Шаг 2: Включение Token Authentication

1. Откройте Pull Zone → **Security** → **Token Authentication**
2. Включите **Token Authentication**
3. Выберите алгоритм: **SHA-256** (Advanced, рекомендуется)
4. Скопируйте **Token Authentication Key** — это ваш `securityKey`
5. Сохраните ключ в `.env`:

```env
BUNNY_CDN_HOSTNAME=cdn-video.reelslab.com
BUNNY_CDN_TOKEN_KEY=ваш-секретный-ключ-здесь
```

### Шаг 3: Дополнительные настройки безопасности

| Настройка | Значение | Описание |
|-----------|----------|----------|
| **Token IP Validation** | Включено | Привязка токена к IP |
| **Allowed Referrers** | reelslab.com | Только ваш домен |
| **Blocked Referrers** | * | Блокировка всех остальных |
| **Direct File Access** | Выключено | Запрет прямого доступа без токена |
| **Hotlink Protection** | Включено | Защита от встраивания на чужие сайты |

## 3. Настройка CORS на бэкенде

```typescript
// backend/src/index.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'https://reelslab.com',
    'https://www.reelslab.com',
    // Для разработки:
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));
```

## 4. Защита на стороне фронтенда

### Использование нативного HTML5 плеера с ограничениями

```tsx
// Пример защищённого плеера
function SecureVideoPlayer({ signedUrl }: { signedUrl: string }) {
  return (
    <video
      src={signedUrl}
      controls
      controlsList="nodownload"           // Убирает кнопку скачивания
      onContextMenu={(e) => e.preventDefault()} // Блокирует правый клик
      disablePictureInPicture             // Отключает PiP
      playsInline
      style={{ pointerEvents: 'auto' }}
    >
      Ваш браузер не поддерживает видео.
    </video>
  );
}
```

### Дополнительные CSS-меры

```css
/* Блокировка выделения и перетаскивания видео */
video {
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}
```

> **⚠️ Важно:** Ни одно клиентское решение не является 100% защитой. Любой контент, отображаемый в браузере, теоретически может быть записан. Серверная подпись URL — главный уровень защиты, а клиентские меры — дополнительный барьер.

## 5. Kinescope (альтернативный провайдер)

Kinescope использует другой подход — **RSA-подписанные JWT-токены** (RS256).

### Настройка

1. Сгенерируйте RSA-пару ключей:
```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

2. Загрузите `public.pem` в Kinescope Dashboard → API Settings
3. Храните `private.pem` на сервере

### Генерация токена

```typescript
import jwt from 'jsonwebtoken';
import fs from 'fs';

const privateKey = fs.readFileSync('./private.pem', 'utf-8');

function generateKinescopeToken(videoId: string, userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      video_id: videoId,
      // Дополнительные claims по необходимости
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: '4h',
    }
  );
}
```

### Встраивание плеера

```html
<iframe
  src="https://kinescope.io/embed/{VIDEO_ID}?token={JWT_TOKEN}"
  width="100%"
  height="400"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
  allowfullscreen
></iframe>
```

## 6. Чеклист безопасности

- [ ] Security Key хранится только в `.env` на сервере (НИКОГДА в клиентском коде)
- [ ] `.env` добавлен в `.gitignore`
- [ ] Токены имеют ограниченное время жизни (≤ 4 часа)
- [ ] Включена привязка токена к IP пользователя
- [ ] CORS настроен только на ваши домены
- [ ] Hotlink Protection включена на CDN
- [ ] Direct File Access отключён на CDN
- [ ] Allowed Referrers настроен на CDN
- [ ] Плеер имеет `controlsList="nodownload"`
- [ ] Правый клик заблокирован на видео-элементе
- [ ] HTTPS используется повсеместно
- [ ] Логирование запросов к видео-API для аудита
