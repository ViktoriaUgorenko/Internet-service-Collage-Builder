# Collage Maker - Документация проекта

## Обзор проекта

Collage Maker - это веб-приложение для создания и редактирования коллажей с использованием современного редактора на основе canvas. Проект представляет собой полноценное веб-приложение с аутентификацией пользователей, управлением проектами и возможностью экспорта готовых работ.

---

## Архитектура проекта

### Технологический стек

#### **Фронтенд**
- **React 18.2.0** + **TypeScript** - основной фреймворк
- **Vite** - сборка и dev-сервер
- **Fabric.js 5.3.0** - библиотека для работы с canvas
- **React Router DOM 6.22.1** - маршрутизация
- **Axios 1.6.7** - HTTP-клиент
- **CSS Modules** - стилизация компонентов

#### **Бэкенд**
- **Node.js** + **Express 4.18.2** - серверная часть
- **TypeScript** - типизация
- **Prisma 5.10.2** - ORM для PostgreSQL
- **PostgreSQL 15** - база данных
- **JWT (jsonwebtoken 9.0.2)** - аутентификация
- **Multer 2.1.1** - загрузка файлов
- **Bcryptjs 2.4.3** - хеширование паролей
- **CORS 2.8.5** - обработка CORS

#### **Инфраструктура**
- **Docker** + **Docker Compose 3.8** - контейнеризация
- **Nginx** - reverse proxy с HTTPS
- **PostgreSQL 15** - база данных в контейнере
- **Node.js** среды для клиента и сервера

---

## Структура проекта

```
Collages/
├── client/                    # React фронтенд
│   ├── src/
│   │   ├── components/       # React компоненты
│   │   │   ├── editor/       # Компоненты редактора
│   │   │   │   ├── modals/   # Модальные окна
│   │   │   │   ├── panels/   # Панели инструментов
│   │   │   │   └── shared/   # Общие компоненты
│   │   │   └── ...
│   │   ├── context/          # React контексты
│   │   ├── hooks/            # Кастомные хуки
│   │   ├── pages/            # Страницы приложения
│   │   ├── services/         # API сервисы
│   │   └── styles/           # Стили
│   ├── package.json
│   └── vite.config.ts
│
├── server/                   # Node.js бэкенд
│   ├── src/
│   │   ├── controllers/      # Контроллеры API
│   │   ├── middlewares/      # Middleware
│   │   ├── routes/           # Маршруты API
│   │   └── index.ts          # Точка входа
│   ├── prisma/               # Prisma схемы
│   ├── package.json
│   └── Dockerfile.dev
│
├── nginx/                    # Nginx конфигурация
│   ├── default.conf
│   └── ssl/                  # SSL сертификаты
│
├── db/                       # Скрипты базы данных
│   └── init.sql
│
├── docker-compose.yml        # Docker Compose
├── .env                      # Переменные окружения
└── ...
```

---

## Функциональные возможности

### 1. Редактор коллажей

#### **Основные инструменты:**
- **Добавление элементов:**
  - Изображения (загрузка с компьютера, Unsplash API)
  - Текст (шрифты, размер, цвет, выравнивание)
  - Фигуры (прямоугольники, круги, треугольники, линии)
  - Стикеры (предустановленные изображения)
  - Фоны (цвет, градиент, изображение)

- **Редактирование элементов:**
  - Перемещение, масштабирование, вращение
  - Изменение порядка слоев (вверх/вниз, блокировка, видимость)
  - Применение фильтров (яркость, контраст, насыщенность, оттенки)
  - Обрезка изображений (интерактивная, по формам)

- **Дополнительные функции:**
  - Сетка и привязка к сетке
  - История изменений (undo/redo, до 50 шагов)
  - Автосохранение каждые 30 секунд
  - Горячие клавиши для быстрого доступа

### 2. Управление проектами

#### **Операции с проектами:**
- **Создание проекта:** Новый холст с настраиваемыми размерами
- **Сохранение проекта:** Автоматическое и ручное сохранение
- **Загрузка проекта:** Восстановление из базы данных
- **Удаление проекта:** Удаление с подтверждением
- **Миниатюры:** Автоматическая генерация превью проектов

#### **Формат данных:**
```json
{
  "title": "Название проекта",
  "canvasData": {
    "objects": [...],  // Элементы Fabric.js
    "background": "#ffffff",
    "width": 1200,
    "height": 800
  },
  "thumbnailUrl": "/uploads/thumbnails/uuid.png"
}
```

### 3. Работа с изображениями

#### **Источники изображений:**
1. **Загрузка с компьютера:**
   - Поддержка форматов: JPG, PNG, GIF, WebP
   - Максимальный размер: 50MB
   - Автоматическая оптимизация

2. **Unsplash API:**
   - Поиск по ключевым словам
   - Фильтрация по ориентации и цвету
   - Бесплатные стоковые изображения

3. **Медиатека пользователя:**
   - Хранение загруженных изображений
   - Повторное использование в разных проектах
   - Управление медиатекой

#### **Обработка изображений:**
- **Обрезка:** Интерактивная обрезка с предустановленными пропорциями
- **Фильтры:** 10+ фильтров с настраиваемыми параметрами
- **Коррекция:** Яркость, контраст, насыщенность, оттенки
- **Эффекты:** Размытие, резкость, винтаж, сепия

### 4. Шаблоны

#### **Типы шаблонов:**
1. **Системные шаблоны (8 штук):**
   - Социальные сети (Instagram, Facebook, Twitter)
   - YouTube (обложки, миниатюры)
   - Печать (визитки, флаеры, постеры)

2. **Пользовательские шаблоны:**
   - Создание из существующих проектов
   - Публичные и приватные шаблоны
   - Категоризация и теги

#### **Формат шабло��ов:**
```json
{
  "name": "Instagram Post",
  "description": "Шаблон для постов в Instagram",
  "category": "Social Media",
  "canvasData": {...},
  "isPublic": true,
  "thumbnailUrl": "/uploads/templates/instagram.png"
}
```

### 5. Аутентификация и пользователи

#### **Система ролей:**
- **GUEST:** Базовая функциональность без сохранения
- **USER:** Полный доступ ко всем функциям
- **ADMIN:** Управление пользователями и шаблонами

#### **Функции пользователя:**
- Регистрация и вход
- Управление профилем
- История проектов
- Настройки редактора

---

## Техническая реализация

### 1. Клиентская часть

#### **Архитектура React:**
- **Контексты:** `AuthContext` для управления аутентификацией
- **Хуки:** `useCanvas` для работы с Fabric.js, `useHotkeys` для горячих клавиш
- **Компоненты:** Модульная структура с разделением ответственности

#### **Fabric.js интеграция:**
```typescript
// useCanvas.ts - основной хук для работы с canvas
const canvas = new fabric.Canvas(canvasRef.current, {
  width, height, backgroundColor: '#ffffff',
  preserveObjectStacking: true,
});

// Настройка объектов
fabric.Object.prototype.set({
  cornerSize: 14,
  cornerStyle: 'circle',
  cornerColor: '#3b82f6',
  borderColor: '#3b82f6',
  borderScaleFactor: 2,
});
```

#### **Состояние редактора:**
- **Локальное состояние:** Текущие настройки, выбранные инструменты
- **История изменений:** Массив JSON-строк для undo/redo
- **Выбранный объект:** Текущий активный элемент для редактирования

### 2. Серверная часть

#### **REST API структура:**
```
GET    /api/health           # Проверка работоспособности
POST   /api/auth/register    # Регистрация
POST   /api/auth/login       # Вход
GET    /api/auth/me          # Информация о пользователе

GET    /api/projects         # Список проектов
POST   /api/projects         # Создание проекта
GET    /api/projects/:id     # Получение проекта
PUT    /api/projects/:id     # Обновление проекта
DELETE /api/projects/:id     # Удаление проекта

GET    /api/templates        # Список шаблонов
POST   /api/templates        # Создание шаблона

POST   /api/images/upload    # Загрузка изображения
GET    /api/images/unsplash  # Поиск в Unsplash
```

#### **Модели данных (Prisma):**
```prisma
model User {
  id           String     @id @default(uuid())
  email        String?    @unique
  passwordHash String?
  name         String?
  role         Role       @default(GUEST)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  projects     Project[]
  templates    Template[]
  media        Media[]
}

model Project {
  id           String   @id @default(uuid())
  title        String
  canvasData   Json     // JSON данные canvas
  thumbnailUrl String?
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  elements     CollageElement[]
}

model CollageElement {
  id        String      @id @default(uuid())
  type      ElementType // IMAGE, TEXT, SHAPE, STICKER
  data      Json        // Данные элемента
  position  Json        // Позиция на canvas
  layer     Int         // Порядок слоев
  projectId String
  project   Project     @relation(fields: [projectId], references: [id])
}
```

#### **Аутентификация:**
```typescript
// Генерация JWT токена
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Middleware проверки токена
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded as { id: string };
    next();
  });
};
```

### 3. Инфраструктура

#### **Docker Compose конфигурация:**
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: collage_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d collage_db"]

  server:
    build: ./server
    volumes:
      - ./server/src:/app/src
      - ./server/prisma:/app/prisma
      - uploads_data:/app/uploads
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/collage_db
      JWT_SECRET: supersecret
    depends_on:
      db:
        condition: service_healthy

  client:
    build: ./client
    volumes:
      - ./client/src:/app/src
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: /api

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - client
```

#### **Nginx конфигурация:**
```nginx
server {
    listen 443 ssl;
    server_name _;
    client_max_body_size 50m;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /api/ {
        proxy_pass http://server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /uploads/ {
        proxy_pass http://server:3000;
    }

    location / {
        proxy_pass http://client:5173;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

---

## Поток данных

### 1. Создание проекта
```
Пользователь → Интерфейс → useCanvas → API → БД
     ↓           ↓           ↓         ↓      ↓
   Клик     Компоненты   Fabric.js   Express PostgreSQL
```

### 2. Редактирование коллажа
```
Событие → Fabric.js → useCanvas → Состояние → Автосохранение
   ↓         ↓           ↓           ↓           ↓
 Клик     Canvas      Хук        React      API → БД
```

### 3. Экспорт проекта
```
Кнопка → Fabric.js → toDataURL → Blob → Скачивание
   ↓        ↓           ↓         ↓        ↓
Интерфейс Canvas    PNG данные  Файл   Браузер
```

---

## Безопасность

### 1. Аутентификация
- **JWT токены** с сроком действия 7 дней
- **Хеширование паролей** с bcryptjs
- **HTTPS** через Nginx с самоподписанными сертификатами
- **CORS** настройки для безопасного доступа

### 2. Валидация данных
- **Валидация на клиенте:** Формы, размеры файлов
- **Валидация на сервере:** Типы данных, права доступа
- **SQL-инъекции:** Защита через Prisma ORM
- **XSS:** Экранирование данных, Content Security Policy

### 3. Загрузка файлов
- **Проверка MIME-типов:** Только изображения
- **Ограничение размера:** 50MB максимум
- **Изоляция файлов:** Отдельный volume в Docker
- **Сканирование:** Базовая проверка на вредоносный код

---

## Производительность

### 1. Оптимизации клиента
- **Ленивая загрузка:** Компоненты загружаются по необходимости
- **Мемоизация:** useCallback и useMemo для тяжелых вычислений
- **Виртуализация:** Для больших списков элементов
- **Кэширование:** API запросы, изображения

### 2. Оптимизации сервера
- **Пагинация:** Для списков проектов и шаблонов
- **Кэширование:** Redis для часто запрашиваемых данных
- **Сжатие:** Gzip для JSON ответов
- **Пулинг соединений:** Для базы данных

### 3. Нагрузочное тестирование
- **Инструмент:** Apache Bench 2.3
- **Тест:** 2000 запросов с параллельностью 10
- **Цель:** `/api/health` endpoint
- **Ожидаемые показатели:** 100% успешных ответов

---

## Развертывание

### 1. Локальная разработка
```bash
# Клонирование репозитория
git clone <repository-url>
cd Collages

# Установка зависимостей
cd client && npm install
cd ../server && npm install

# Запуск с Docker Compose
docker-compose up -d

# Или запуск вручную
# Сервер: cd server && npm run dev
# Клиент: cd client && npm run dev
```

### 2. Переменные окружения
```env
# .env файл
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=collage_db
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
UNSPLASH_ACCESS_KEY=your_unsplash_key
PORT=3000
```

### 3. Миграции базы данных
```bash
# Инициализация базы данных
cd server
npx prisma db push
npx prisma generate

# Заполнение начальными данными
npm run seed
```

---

## Тестирование

### 1. API тестирование
- **Инструмент:** Postman
- **Коллекция:** 15 автоматизированных тестов
- **Покрытие:** Все основные endpoints
- **Сценарии:** Успешные и ошибочные кейсы

### 2. Нагрузочное тестирование
```bash
# Запуск теста
cd load-test
run_ab_test.bat

# Результаты сохраняются в
# ab_result_YYYY-MM-DD.txt
```

### 3. Ручное тестирование
- **Редактор:** Все инструменты и функции
- **Аутентификация:** Регистрация, вход, выход
- **Проекты:** CRUD операции
- **Экспорт:** Все форматы и настройки

---

## Мониторинг и логирование

### 1. Логирование сервера
```typescript
// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Глобальный обработчик ошибок
app.use((err: Error, req: Request, res: Response) => {
  console.error('[Global Error Handler]', err.stack || err.message);
  res.status(500).json({ message: 'Internal server error' });
});
```

### 2. Health checks
```
GET /api/health
Response: { status: 'ok', db: 'connected', version: '1.0' }
```

### 3. Метрики производительности
- **Время ответа API:** Среднее, 95-й перцентиль
- **Использование памяти:** Клиент и сервер
- **Ошибки:** Количество и типы ошибок
- **Активные пользователи:** Одновременные сессии

---

## Будущие улучшения

### 1. Планируемые функции
- **Коллаборация:** Редактирование в реальном времени
- **Плагины:** Расширяемая архитектура
- **AI функции:** Автозаполнение, стилизация
- **Мобильное приложение:** React Native версия

### 2. Технические улучшения
- **Кэширование:** Redis для производительности
- **CDN:** Для статических файлов и изображений
- **Микросервисы:** Разделение на отдельные сервисы
- **CI/CD:** Автоматическое развертывание

### 3. Безопасность
- **OAuth 2.0:** Вход через социальные сети
- **2FA:** Двухфакторная аутентификация
- **Аудит:** Логирование всех действий
- **Backup:** Автоматическое резервное копирование

---

## Заключение

Collage Maker - это современное веб-приложение для создания и редактирования коллажей, построенное на стеке React + Node.js + PostgreSQL. Проект демонстрирует хорошие практики разработки, включая модульную архитектуру, безопасность, производительность и удобство использования.

Приложение подходит для широкого круга пользователей - от любителей, создающих простые коллажи для социальных сетей, до профессионалов, нуждающихся в мощном инструменте для графического дизайна.

**Ключевые преимущества:**
- Современный и интуитивно понятный интерфейс
- Мощный редактор на основе Fabric.js
- Надежная система аутентификации и хранения данных
- Масштабируемая архитектура с Docker
- Поддержка различных форматов экспорта
- Интеграция с Unsplash для поиска изображений

Проект продолжает развиваться с учетом обратной связи пользователей и новых технологических возможностей.


---

## Детали реализации

### Библиотеки и методы

#### **Клиентская часть**

**1. Fabric.js (v5.3.0) - Основная библиотека для работы с canvas**
```typescript
// Основные классы и методы:
import { fabric } from 'fabric';

// Создание canvas
const canvas = new fabric.Canvas('canvas-id', {
  width: 1200,
  height: 800,
  backgroundColor: '#ffffff',
  preserveObjectStacking: true, // Сохранение порядка слоев
});

// Основные методы работы с объектами:
// - Добавление объектов
canvas.add(new fabric.Rect({ left: 100, top: 100, width: 200, height: 100, fill: 'red' }));
canvas.add(new fabric.Text('Hello World', { left: 50, top: 50, fontSize: 30 }));

// - Сериализация/десериализация
const json = canvas.toJSON(['id', 'customProperty']); // Сохранение в JSON
canvas.loadFromJSON(json, canvas.renderAll.bind(canvas)); // Загрузка из JSON

// - Работа с выделением
canvas.getActiveObject(); // Получить выбранный объект
canvas.getActiveObjects(); // Получить все выбранные объекты
canvas.discardActiveObject(); // Снять выделение

// - История изменений
canvas.undo(); // Отменить последнее изменение
canvas.redo(); // Повторить отмененное изменение
```

**2. React компоненты и хуки**

**useCanvas.ts - Главный хук для управления редактором:**
```typescript
// Основные методы хука:
const {
  canvasRef,           // Ссылка на canvas элемент
  fabricCanvas,        // Экземпляр Fabric.js canvas
  selectedObject,      // Выбранный объект
  canUndo, canRedo,    // Состояние истории
  gridEnabled,         // Включена ли сетка
  snapEnabled,         // Включена ли привязка
  
  // Методы управления:
  addImage,            // Добавить изображение
  addText,             // Добавить текст
  addShape,            // Добавить фигуру
  addSticker,          // Добавить стикер
  removeSelected,      // Удалить выбранный объект
  duplicateSelected,   // Дублировать объект
  bringForward,        // Переместить вперед
  sendBackward,        // Переместить назад
  bringToFront,        // Переместить на передний план
  sendToBack,          // Переместить на задний план
  lockObject,          // Заблокировать объект
  unlockObject,        // Разблокировать объект
  toggleVisibility,    // Переключить видимость
  applyFilter,         // Применить фильтр
  cropImage,           // Обрезать изображение
  setBackground,       // Установить фон
  undo, redo,          // История
  toggleGrid,          // Включить/выключить сетку
  toggleSnap,          // Включить/выключить привязку
  exportToPNG,         // Экспорт в PNG
  exportToJPEG,        // Экспорт в JPEG
  exportToSVG,         // Экспорт в SVG
} = useCanvas({ width, height, onModified });
```

**3. React Router DOM (v6.22.1) - Маршрутизация:**
```typescript
// Конфигурация маршрутов в App.tsx:
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/editor/:id?" element={<Editor />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
</BrowserRouter>
```

**4. Axios (v1.6.7) - HTTP клиент:**
```typescript
// Настройка в api.ts:
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Интерцептор для добавления токена:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Интерцептор для обработки 401 ошибки:
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### **Серверная часть**

**1. Express (v4.18.2) - Веб-фреймворк:**
```typescript
// Основная конфигурация в index.ts:
const app = express();

// Middleware
app.use(cors()); // CORS
app.use(express.json({ limit: '50mb' })); // Парсинг JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Парсинг URL-encoded
app.use('/uploads', express.static('uploads')); // Статические файлы

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/images', imageRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`; // Проверка соединения с БД
  res.json({ status: 'ok', db: 'connected' });
});
```

**2. Prisma (v5.10.2) - ORM для PostgreSQL:**
```typescript
// Инициализация клиента:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Примеры запросов:
// - Создание пользователя
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    passwordHash: hashedPassword,
    name: 'John Doe',
    role: 'USER',
  },
});

// - Получение проектов пользователя
const projects = await prisma.project.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: 'desc' },
  include: { elements: true }, // Включение связанных элементов
});

// - Обновление проекта
const updatedProject = await prisma.project.update({
  where: { id: projectId },
  data: {
    title: 'New Title',
    canvasData: updatedCanvasData,
    updatedAt: new Date(),
  },
});
```

**3. JWT (jsonwebtoken v9.0.2) - Аутентификация:**
```typescript
// Генерация токена:
const generateToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Верификация токена (middleware):
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded as { id: string };
    next();
  });
};
```

**4. Multer (v2.1.1) - Загрузка файлов:**
```typescript
// Конфигурация multer:
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Использование в роуте:
router.post('/upload', upload.single('image'), imageController.uploadImage);
```

**5. Bcryptjs (v2.4.3) - Хеширование паролей:**
```typescript
// Хеширование пароля при регистрации:
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

// Проверка пароля при входе:
const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
if (!isPasswordValid) {
  return res.status(401).json({ message: 'Invalid credentials' });
}
```

---

## Что хранится в базе данных

### Структура таблиц и данные

#### **1. Таблица `users` (Пользователи)**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'GUEST',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
**Хранимые данные:**
- `id` - UUID идентификатор пользователя
- `email` - Email для входа (уникальный)
- `password_hash` - Хешированный пароль (bcrypt)
- `name` - Имя пользователя (отображаемое)
- `role` - Роль: 'GUEST', 'USER', 'ADMIN'
- `created_at`, `updated_at` - Временные метки

#### **2. Таблица `projects` (Проекты)**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  canvas_data JSONB NOT NULL,
  thumbnail_url VARCHAR(500),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
**Хранимые данные:**
- `id` - UUID идентификатор проекта
- `title` - Название проекта
- `canvas_data` - **JSON данные canvas в формате Fabric.js:**
  ```json
  {
    "version": "5.3.0",
    "objects": [
      {
        "type": "image",
        "src": "/uploads/images/image-123456789.jpg",
        "left": 100,
        "top": 100,
        "width": 300,
        "height": 200,
        "scaleX": 1,
        "scaleY": 1,
        "angle": 0,
        "opacity": 1,
        "filters": [],
        "id": "element-1"
      },
      {
        "type": "text",
        "text": "Hello World",
        "fontSize": 30,
        "fontFamily": "Arial",
        "fill": "#000000",
        "left": 200,
        "top": 150,
        "id": "element-2"
      }
    ],
    "background": "#ffffff",
    "width": 1200,
    "height": 800
  }
  ```
- `thumbnail_url` - URL миниатюры проекта (PNG)
- `user_id` - Ссылка на владельца
- `created_at`, `updated_at` - Временные метки

#### **3. Таблица `collage_elements` (Элементы коллажа)**
```sql
CREATE TABLE collage_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- 'IMAGE', 'TEXT', 'SHAPE', 'STICKER'
  data JSONB NOT NULL, -- Данные элемента
  position JSONB NOT NULL, -- Позиция {x, y, width, height, rotation}
  layer INTEGER NOT NULL, -- Порядок слоев
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
**Хранимые данные:**
- `type` - Тип элемента
- `data` - **JSON данные элемента:**
  - Для изображений: `{ "src": "...", "filters": [...], "crop": {...} }`
  - Для текста: `{ "text": "...", "fontSize": 30, "color": "#000" }`
  - Для фигур: `{ "shape": "rect", "fill": "#ff0000", "stroke": "#000" }`
- `position` - **JSON позиция:** `{ "x": 100, "y": 100, "width": 200, "height": 150, "rotation": 0 }`
- `layer` - Номер слоя (чем больше, тем выше)
- `project_id` - Ссылка на проект

#### **4. Таблица `templates` (Шаблоны)**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  canvas_data JSONB NOT NULL,
  thumbnail_url VARCHAR(500),
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT true,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
**Хранимые данные:**
- `name`, `description` - Название и описание шаблона
- `canvas_data` - JSON данные canvas (аналогично проектам)
- `category` - Категория: 'Social Media', 'YouTube', 'Print', 'Custom'
- `is_public` - Доступен ли публично
- `user_id` - Создатель шаблона (null для системных)

#### **5. Таблица `media` (Медиафайлы)**
```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size INTEGER,
  path VARCHAR(500) NOT NULL,
  source VARCHAR(20) DEFAULT 'UPLOAD', -- 'UPLOAD', 'UNSPLASH'
  unsplash_id VARCHAR(100),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Хранимые данные:**
- `filename` - Имя файла на сервере
- `original_name` - Оригинальное имя файла
- `mime_type` - Тип файла (image/jpeg, image/png)
- `size` - Размер в байтах
- `path` - Путь к файлу относительно uploads
- `source` - Источник: 'UPLOAD' или 'UNSPLASH'
- `unsplash_id` - ID изображения из Unsplash (если source='UNSPLASH')
- `user_id` - Владелец файла

### Объем данных в БД

**Типичные размеры:**
- **Пользователь:** ~500 байт
- **Проект:** 10KB - 5MB (зависит от сложности коллажа)
- **Элемент:** 1KB - 100KB
- **Шаблон:** 5KB - 2MB
- **Медиафайл:** Метаданные ~200 байт + файл на диске

**Оценка на 1000 пользователей:**
- Пользователи: ~500KB
- Проекты: ~500MB (100 проектов на пользователя × 500KB)
- Элементы: ~200MB
- Шаблоны: ~50MB
- Метаданные ��едиа: ~200KB
- **Итого:** ~750MB + файлы на диске

---

## Что останется, если удалить базу данных

### **1. Файлы на диске (НЕ удалятся):**
- **Загруженные изображения:** `uploads/images/` - все загруженные пользователями файлы
- **Миниатюры проектов:** `uploads/thumbnails/` - сгенерированные превью
- **Шаблоны:** `uploads/templates/` - изображения шаблонов
- **SSL сертификаты:** `nginx/ssl/` - сертификаты для HTTPS
- **Исходный код:** Все файлы проекта в `client/`, `server/`, etc.

### **2. Конфигурационные файлы (НЕ удалятся):**
- **`.env` файлы** - переменные окружения
- **`docker-compose.yml`** - конфигурация Docker
- **`nginx/default.conf`** - конфигурация Nginx
- **`prisma/schema.prisma`** - схема базы данных
- **`package.json` файлы** - зависимости

### **3. Docker volumes (НЕ удалятся автоматически):**
- **`postgres_data`** - том с данными PostgreSQL (если не удален явно)
- **`uploads_data`** - том с загруженными файлами

### **4. Что будет потеряно (удалится):**

#### **Все данные из таблиц:**
- **Пользователи:** Все учетные записи, пароли, настройки
- **Проекты:** Все созданные коллажи, история изменений
- **Элементы:** Все объекты на canvas
- **Шаблоны:** Все пользовательские шаблоны
- **Медиа метаданные:** Информация о загруженных файлах (но сами файлы останутся)

#### **Связи между данными:**
- Кто создал какой проект
- Какие элементы принадлежат каким проектам
- Кто загрузил какие файлы
- Настройки пользователей

### **5. Состояние приложения после удаления БД:**

#### **Сценарий 1: Запуск с чистой БД**
```bash
# После удаления БД и перезапуска:
docker-compose down -v  # Удаляет volumes (включая postgres_data)
docker-compose up -d    # Создает новую пустую БД

# Что произойдет:
1. Будет создана новая пустая база данных
2. Prisma применит схему из schema.prisma
3. seed.ts заполнит системные шаблоны (если настроен)
4. Приложение будет работать, но:
   - Нет пользователей (нужно регистрироваться заново)
   - Нет проектов (все коллажи потеряны)
   - Нет пользовательских шаблонов
   - Загруженные файлы остались, но система не знает кому они принадлежат
```

#### **Сценарий 2: Восстановление из backup (если есть)**
```bash
# Восстановление данных:
docker-compose exec db psql -U postgres -d collage_db < backup.sql

# Или через Prisma:
npx prisma db push
npx prisma db seed
```

#### **Сценарий 3: Работа с локальными файлами**
Если пользователь экспортировал проекты в JSON/PNG:
- **JSON файлы:** Можно импортировать обратно (если поддерживается функционал)
- **PNG/JPEG файлы:** Готовые изображения сохранятся
- **Но:** История изменений, слои, редактируемость будут потеряны

### **6. Рекомендации по backup:**

#### **Регулярное резервное копирование:**
```bash
# Backup базы данных:
docker-compose exec db pg_dump -U postgres collage_db > backup_$(date +%Y%m%d).sql

# Backup загруженных файлов:
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Автоматический backup (cron):
0 2 * * * cd /path/to/project && docker-compose exec db pg_dump -U postgres collage_db > /backups/db_$(date +\%Y\%m\%d).sql
0 3 * * * cd /path/to/project && tar -czf /backups/uploads_$(date +\%Y\%m\%d).tar.gz uploads/
```

#### **Что backup'ить обязательно:**
1. **База данных** - все структурированные данные
2. **Папка `uploads/`** - все загруженные файлы
3. **Конфигурационные файлы** - `.env`, `docker-compose.yml`

#### **Что можно восстановить:**
- **Полностью:** Пользователи, проекты, шаблоны (из backup БД)
- **Частично:** Загруженные файлы (из папки uploads)
- **Не восстановить:** Сессии пользователей, кэшированные данные

### **7. Стратегия хранения данных:**

#### **Критические данные (в БД):**
- Учетные данные пользователей
- Структура проектов (JSON canvas)
- Метаданные файлов
- Настройки системы

#### **Медиафайлы (на диске):**
- Загруженные изображения
- Миниатюры
- Экспортированные работы

#### **Временные данные (можно потерять):**
- Сессии пользователей
- Кэш изображений
- Временные файлы обработки

### **Итог:**
**Удаление БД = потеря всех структурированных данных, но сохранение медиафайлов и конфигурации.**

**Рекомендация:** Всегда делайте регулярные backup'ы базы данных и папки `uploads/`. Используйте Docker volumes для persistent хранения, но помните, что `docker-compose down -v` удалит и volumes.


---

## Взаимодействие компонентов, протоколы и порты

### Архитектура взаимодействия

```
┌─────────────────────────────────────────────────────────────┐
│                    Пользовательский браузер                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 React SPA (клиент)                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Editor    │  │  Dashboard  │  │    Auth     │  │  │
│  │  │  Компонент  │  │  Компонент  │  │  Компонент  │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │                │                 │         │  │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  │  │
│  │  │   useCanvas │  │   API Calls │  │ AuthContext │  │  │
│  │  │     Хук     │  │   (Axios)   │  │   Контекст  │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │                │                 │         │  │
│  │  ┌──────▼────────────────▼─────────────────▼──────┐  │  │
│  │  │              API Service Layer                  │  │  │
│  │  │            (services/api.ts)                    │  │  │
│  │  └──────────────────────┬──────────────────────────┘  │  │
│  └─────────────────────────┼─────────────────────────────┘  │
│                            │ HTTP/HTTPS                     │
└────────────────────────────┼─────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Порт 80 (HTTP) → 443 (HTTPS redirect)                │  │
│  │ Порт 443 (HTTPS)                                     │  │
│  │                                                      │  │
│  │ Маршрутизация:                                       │  │
│  │  • /api/*     → server:3000                         │  │
│  │  • /uploads/* → server:3000                         │  │
│  │  • /*         → client:5173                         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ Внутренняя сеть Docker
                  ┌──────────┴──────────┐
                  ▼                     ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   Node.js Server        │  │   React Dev Server      │
│   (server:3000)         │  │   (client:5173)         │
│  ┌───────────────────┐  │  │  ┌───────────────────┐  │
│  │    Express App    │  │  │  │   Vite Dev Server │  │
│  │  • REST API       │  │  │  │  • HMR            │  │
│  │  • JWT Auth       │  │  │  │  • Live Reload    │  │
│  │  • File Upload    │  │  │  │                   │  │
│  └─────────┬─────────┘  │  │  └───────────────────┘  │
│            │             │  └─────────────────────────┘
│    ┌───────▼───────┐    │
│    │   Prisma      │    │
│    │   ORM         │    │
│    └───────┬───────┘    │
│            │             │
└────────────┼─────────────┘
             │ TCP/IP (порт 5432)
             ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                           │
│                (db:5432)                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • users table                                        │  │
│  │ • projects table                                     │  │
│  │ • templates table                                    │  │
│  │ • media table                                        │  │
│  │ • collage_elements table                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Детали взаимодействия

### 1. Взаимодействие между клиентскими компонентами

#### **React Component Hierarchy:**
```
App.tsx (корневой)
├── AuthProvider (контекст аутентификации)
├── BrowserRouter (маршрутизация)
│   ├── Routes
│   │   ├── /login → Login.tsx
│   │   ├── /register → Register.tsx
│   │   ├── /dashboard → Dashboard.tsx (через ProtectedRoute)
│   │   ├── /editor/:id → Editor.tsx
│   │   └── /profile → Profile.tsx
│   └── Navigation (неявная)
└── ToastContainer (уведомления)
```

#### **Взаимодействие внутри Editor.tsx:**
```
Editor.tsx (основной компонент редакт��ра)
├── useCanvas() ←→ CanvasArea.tsx (двусторонняя связь)
│   ├── Fabric.js Canvas
│   ├── События мыши/клавиатуры
│   └── Состояние объектов
├── ContextPanel.tsx (панель контекста)
│   ├── HistoryControls.tsx (история)
│   └── Панели инструментов:
│       ├── PropertiesPanel.tsx (свойства)
│       ├── LayersPanel.tsx (слои)
│       ├── ShapesPanel.tsx (фигуры)
│       ├── TemplatesPanel.tsx (шаблоны)
│       ├── StickersPanel.tsx (стикеры)
│       ├── FilterPanel.tsx (фильтры)
│       ├── BackgroundPanel.tsx (фон)
│       ├── FramesPanel.tsx (рамки)
│       ├── ClipPanel.tsx (обрезка)
│       └── ExportPanel.tsx (экспорт)
├── Модальные окна:
│   ├── ImageUploadModal.tsx
│   ├── ImageSearchModal.tsx
│   ├── TemplatesModal.tsx
│   ├── PreviewModal.tsx
│   └── ExportModal.tsx
└── Toolbar.tsx (верхняя панель инструментов)
```

#### **Механизмы взаимодействия:**
- **Props** - передача данных от родителя к потомку
- **Callback functions** - передача функций для обратной связи
- **React Context (AuthContext)** - глобальное состояние аутентификации
- **Custom Hooks (useCanvas, useHotkeys)** - переиспользуемая логика
- **Event Listeners** - обработка событий DOM и Fabric.js

### 2. Взаимодействие клиент-сервер

#### **Протоколы:**
- **HTTP/1.1** - основной протокол для REST API
- **HTTPS** - через Nginx с TLS 1.2/1.3
- **WebSocket** - не используется (но может быть добавлен для real-time)

#### **Порты (внешние):**
- **Порт 80** - HTTP → перенаправление на 443
- **Порт 443** - HTTPS → основной порт для доступа

#### **Порты (внутренние в Docker):**
- **client:5173** - React dev server (Vite)
- **server:3000** - Node.js/Express API server
- **db:5432** - PostgreSQL database
- **nginx:80/443** - Reverse proxy

#### **Маршрутизация Nginx:**
```nginx
# /etc/nginx/conf.d/default.conf

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name _;
    
    # SSL конфигурация
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Маршрутизация API запросов
    location /api/ {
        proxy_pass http://server:3000;  # → server:3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Маршрутизация загруженных файлов
    location /uploads/ {
        proxy_pass http://server:3000;  # → server:3000
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Все остальные запросы → React приложение
    location / {
        proxy_pass http://client:5173;  # → client:5173
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. REST API взаимодействие

#### **Endpoints и методы:**

| Метод | Endpoint | Назначение | Протокол | Порт |
|-------|----------|------------|----------|------|
| **POST** | `/api/auth/register` | Регистрация | HTTPS | 443 |
| **POST** | `/api/auth/login` | Вход | HTTPS | 443 |
| **GET** | `/api/auth/me` | Инфо о пользователе | HTTPS | 443 |
| **GET** | `/api/projects` | Список проектов | HTTPS | 443 |
| **POST** | `/api/projects` | Создание проекта | HTTPS | 443 |
| **GET** | `/api/projects/:id` | Получение проекта | HTTPS | 443 |
| **PUT** | `/api/projects/:id` | Обновление проекта | HTTPS | 443 |
| **DELETE** | `/api/projects/:id` | Удаление проекта | HTTPS | 443 |
| **GET** | `/api/templates` | Список шаблонов | HTTPS | 443 |
| **POST** | `/api/templates` | Создание шаблона | HTTPS | 443 |
| **POST** | `/api/images/upload` | Загрузка изображения | HTTPS | 443 |
| **GET** | `/api/images/unsplash` | Поиск в Unsplash | HTTPS | 443 |
| **GET** | `/api/health` | Health check | HTTPS | 443 |

#### **Формат запросов/ответов:**
```typescript
// Пример: Регистрация пользователя
// Запрос:
POST https://example.com/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Ответ:
HTTP/1.1 201 Created
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

#### **Аутентификация:**
- **JWT Bearer Token** в заголовке `Authorization`
- **Формат:** `Authorization: Bearer <token>`
- **Срок действия:** 7 дней (настраивается)
- **Refresh tokens:** Не реализовано (можно добавить)

### 4. Взаимодействие с базой данных

#### **Протокол и порт:**
- **Протокол:** TCP/IP
- **Порт:** 5432 (стандартный для PostgreSQL)
- **Внутри Docker:** `db:5432`
- **Снаружи Docker:** `localhost:5432` (если проброшен)

#### **Prisma ORM взаимодействие:**
```typescript
// Подключение к БД
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // postgresql://user:pass@db:5432/dbname
    }
  }
});

// Запросы выполняются через:
// 1. Prisma Client (синхронные/асинхронные методы)
// 2. Raw SQL запросы (при необходимости)
// 3. Транзакции (для атомарных операций)
```

#### **Connection Pool:**
- **Максимум соединений:** 10 (настраивается в Prisma)
- **Таймаут:** 10 секунд
- **Повторные попытки:** 2 раза при ошибке соединения

### 5. Взаимодействие с внешними сервисами

#### **Unsplash API:**
```typescript
// Протокол: HTTPS
// Порт: 443
// Endpoint: https://api.unsplash.com/search/photos
// Аутентификация: Client-ID в заголовке

const response = await axios.get('https://api.unsplash.com/search/photos', {
  params: {
    query: searchTerm,
    per_page: 20,
    orientation: 'landscape'
  },
  headers: {
    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
  }
});
```

#### **Взаимодействие:**
1. Клиент → `/api/images/unsplash?query=nature`
2. Сервер → Unsplash API (HTTPS, порт 443)
3. Unsplash API → Сервер (JSON с изображениями)
4. Сервер → Клиент (обработанные данные)

### 6. Внутреннее взаимодействие в Docker

#### **Docker Network:**
```yaml
# docker-compose.yml создает default network
services:
  db:
    image: postgres:15-alpine
    networks:
      - default  # Все сервисы в одной сети
  
  server:
    build: ./server
    networks:
      - default
    depends_on:
      - db
  
  client:
    build: ./client
    networks:
      - default
    environment:
      VITE_API_URL: /api  # Прокси через Nginx
  
  nginx:
    image: nginx:alpine
    networks:
      - default
    ports:
      - "80:80"
      - "443:443"
```

#### **Разрешение имен в Docker:**
- **`db`** → `172.20.0.2:5432`
- **`server`** → `172.20.0.3:3000`
- **`client`** → `172.20.0.4:5173`
- **`nginx`** → `172.20.0.5:80/443`

#### **Доступность сервисов:**
- **Извне Docker:** Только через nginx (порты 80/443)
- **Внутри Docker:** Все сервисы доступны по именам

### 7. Потоки данных

#### **Поток 1: Создание проекта**
```
1. Пользователь: Клик "Новый проект" в Dashboard.tsx
2. React: Вызов API → POST /api/projects
3. Axios: HTTP запрос → Nginx:443
4. Nginx: Прокси → server:3000/api/projects
5. Express: Роут → projectController.createProject()
6. Prisma: INSERT INTO projects → db:5432
7. PostgreSQL: Сохранение данных → ответ
8. Обратный путь: PostgreSQL → Prisma → Express → Nginx → Axios → React → UI
```

#### **Поток 2: Редактирование canvas**
```
1. Пользователь: Перетаскивание объекта на canvas
2. Fabric.js: Событие object:modified
3. useCanvas: Обработка события → saveHistoryState()
4. React: Обновление состояния → перерендер
5. Автосохранение (каждые 30 сек):
   - useCanvas: Таймер → onModified callback
   - Editor.tsx: Вызов updateProject() API
   - Axios: PUT /api/projects/:id
   - Сервер: Обновление в БД
```

#### **Поток 3: Загрузка изображения**
```
1. Пользователь: Выбор файла в ImageUploadModal.tsx
2. React: FormData создание → axios.post(/api/images/upload)
3. Axios: Multipart/form-data запрос
4. Nginx: Прокси с client_max_body_size 50m
5. Express: Multer middleware → сохранение файла
6. Prisma: INSERT INTO media → db:5432
7. Ответ: { url: '/uploads/images/filename.jpg', id: '...' }
8. useCanvas: addImage(url) → Fabric.js: fabric.Image.fromURL()
```

### 8. Протоколы передачи данных

#### **JSON (REST API):**
- **Content-Type:** `application/json`
- **Кодировка:** UTF-8
- **Размер:** До 50MB (настроено в Express)

#### **Multipart/form-data (загрузка файлов):**
- **Content-Type:** `multipart/form-data`
- **Поля:** `image` (файл), `metadata` (JSON опционально)
- **Максимальный размер:** 50MB

#### **Binary (статичные файлы):**
- **Content-Type:** Определяется по расширению
- **Кэширование:** Headers для изображений
- **Диапазон запросов:** Поддержка Range headers

#### **WebSocket (потенциально):**
- **Порт:** 443 (через wss://)
- **Использование:** Real-time коллаборация
- **Протокол:** Socket.io поверх WebSocket

### 9. Порты и безопасность

#### **Открытые порты:**
| Порт | Сервис | Протокол | Назначение | Доступ |
|------|--------|----------|------------|--------|
| **80** | Nginx | HTTP | Redirect to HTTPS | Public |
| **443** | Nginx | HTTPS | Основной доступ | Public |
| **3000** | Server | HTTP | API (dev) | Localhost |
| **5173** | Client | HTTP | React dev | Localhost |
| **5432** | PostgreSQL | TCP | База данных | Docker only |

#### **Безопасность:**
- **HTTPS:** TLS 1.2/1.3 с самоподписанными сертификатами
- **CORS:** Настроен для безопасного доступа
- **Rate limiting:** Не реализовано (можно добавить)
- **SQL injection:** Защищено через Prisma
- **XSS:** React экранирует по умолчанию
- **File upload:** Валидация MIME types и размеров

### 10. Сетевая диаграмма

```
┌─────────────────────────────────────────────────────────────────┐
│                        Интернет                                 │
│                    (Пользователи)                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (443)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                          │
│              Порт 80 (HTTP → HTTPS redirect)                    │
│              Порт 443 (HTTPS - основной)                        │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               │ /api/*, /uploads/*           │ /*
               ▼                              ▼
    ┌────────────────────┐          ┌────────────────────┐
    │   Node.js Server   │          │  React Dev Server  │
    │   (server:3000)    │          │   (client:5173)    │
    └──────────┬─────────┘          └────────────────────┘
               │
               │ TCP/IP (5432)
               ▼
    ┌────────────────────┐
    │  PostgreSQL DB     │
    │   (db:5432)        │
    └────────────────────┘

Внешние зависимости:
    │ HTTPS (443)
    ▼
┌────────────────────┐
│   Unsplash API     │
│  (api.unsplash.com)│
└────────────────────┘
```

### 11. Производительность и масштабирование

#### **Bottlenecks:**
1. **База данных:** Запросы проектов с большими JSON
2. **Загрузка файлов:** 50MB лимит, обработка на сервере
3. **Canvas операции:** Тяжелые вычисления на клиенте

#### **Оптимизации:**
- **Кэширование:** Не реализовано (можно добавить Redis)
- **CDN:** Для статических файлов и изображений
- **Балансировка нагрузки:** Несколько инстансов server
- **Репликация БД:** Master-slave для чтения

#### **Метрики:**
- **Время ответа API:** < 200ms (целевое)
- **Время загрузки страницы:** < 3 секунд
- **Параллельные пользователи:** 100+ (оценка)
- **Пропускная способность:** 1000 запросов/мин

---

## Итог взаимодействия

### **Ключевые моменты:**

1. **Все внешние запросы** идут через Nginx на порту 443 (HTTPS)
2. **Внутри Docker** сервисы общаются по именам через default network
3. **Клиент-серверное взаимодействие** через REST API (JSON)
4. **Аутентификация** через JWT tokens в заголовках
5. **Загрузка файлов** через multipart/form-data
6. **Состояние редактора** хранится локально + синхронизируется с сервером
7. **Внешние API** (Unsplash) вызываются с сервера для безопасности

### **Протокольная сводка:**

| Уровень | Протокол | Порт | Назначение |
|---------|----------|------|------------|
| **Внешний доступ** | HTTPS | 443 | Основной доступ пользователей |
| **Внутренний API** | HTTP | 3000 | REST API сервера |
| **База данных** | TCP/IP | 5432 | PostgreSQL соединения |
| **Фронтенд dev** | HTTP | 5173 | Vite dev server |
| **Внешние API** | HTTPS | 443 | Unsplash и другие сервисы |

### **Зависимости:**
- **Обязательные:** PostgreSQL, Node.js, Nginx
- **Внешние:** Unsplash API (опционально)
- **Инфраструктура:** Docker, Docker Compose

Такая архитектура обеспечивает безопасность, производительность и возможность масштабирования при росте нагрузки.