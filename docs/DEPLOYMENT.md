# 🚀 Инструкция по деплою ReelsLab на сервер

Платформа ReelsLab готова к публикации на боевой сервер (VPS / Cloud). Ниже приведены 3 наиболее простых способа деплоя.

---

## 🐋 Способ 1: Запуск на любом VPS сервере через Docker (Рекомендуемый)

Этот способ автоматически поднимет и бэкенд, и фронтенд, и базу данных **одной командой**.

### 1. Установите Docker на сервер (Ubuntu/Debian):
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
```

### 2. Загрузите файлы проекта на сервер и запустите:
```bash
git clone <ваш-репозиторий>
cd reelslab

# Запуск проекта в фоновом режиме
docker-compose up -d --build
```
Проект автоматически запустит:
- **Фронтенд Next.js**: `http://ip-вашего-сервера:3000`
- **Бэкенд Express API**: `http://ip-вашего-сервера:3001`

---

## ⚡ Способ 2: Ручной запуск через PM2 (Без Docker)

### 1. Установите Node.js и PM2 на сервер:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Запуск Бэкенда (Express API):
```bash
cd /path/to/reelslab/backend
npm install
npx prisma db push
npm run build
pm2 start dist/index.js --name "reelslab-backend"
```

### 3. Запуск Фронтенда (Next.js):
```bash
cd /path/to/reelslab/frontend
npm install
npm run build
pm2 start npm --name "reelslab-frontend" -- start
pm2 save
```

---

## 🌐 Способ 3: Бесплатный деплой в облако (Vercel + Railway)

1. **Фронтенд на Vercel**:
   - Зайдите на [vercel.com](https://vercel.com)
   - Импортируйте папку `frontend`
   - В `Environment Variables` укажите: `NEXT_PUBLIC_API_URL=https://ваша-ссылка-на-backend.railway.app/api`
   - Нажмите **Deploy**

2. **Бэкенд на Railway / Render**:
   - Зайдите на [railway.app](https://railway.app)
   - Импортируйте папку `backend`
   - Нажмите **Deploy**

---

## 🔒 Подключение SSL (HTTPS) и своего домена на Nginx

Конфигурация `/etc/nginx/sites-available/reelslab`:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Для установки бесплатного SSL-сертификата (HTTPS):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
