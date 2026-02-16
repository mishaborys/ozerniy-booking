# 🏡 Telegram Mini App - Бронювання альтанок ЖК Озерний Гай

Система бронювання альтанок для мешканців ЖК Озерний Гай через Telegram Mini App.

## 📋 Функціонал

- ✅ Перевірка членства користувача в групі Telegram
- ✅ Відображення 3 альтанок з доступними слотами
- ✅ Слоти тривалістю 3,5 години (з 8:00 до 22:00)
- ✅ Обмеження: 1 бронювання на користувача на день
- ✅ Збереження інформації про користувача (ім'я, будинок, квартира, Telegram username)
- ✅ Опціональне поле номер телефону

## 🚀 Швидкий старт

### 1. Клонування проекту

Розпакуй ZIP файл або склонуй репозиторій:

```bash
cd ozerniy-booking
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних середовища

Створи файл `.env.local` в корені проекту:

```env
# Telegram Bot Token (вже є)
TELEGRAM_BOT_TOKEN=8286795545:AAGjus1oayh3WXqiw0FGYtZ1gD9g185QM6o

# Telegram Group ID (потрібно отримати)
TELEGRAM_GROUP_ID=-1001234567890

# Vercel Postgres (автоматично з'являться після створення БД)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# URL додатку (після деплою)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Отримання ID групи Telegram

1. Додай бота до своєї групи ЖК як **адміністратора**
2. Відправ будь-яке повідомлення в групу
3. Відкрий в браузері:
   ```
   https://api.telegram.org/bot8286795545:AAGjus1oayh3WXqiw0FGYtZ1gD9g185QM6o/getUpdates
   ```
4. Знайди `"chat":{"id":-1001234567890}` - це твій GROUP_ID (зі знаком мінус!)
5. Додай цей ID в `.env.local` як `TELEGRAM_GROUP_ID`

### 5. Локальне тестування (опціонально)

```bash
npm run dev
```

Відкрий http://localhost:3000

## 📦 Деплой на Vercel

### Крок 1: Встановлення Vercel CLI

```bash
npm install -g vercel
```

### Крок 2: Авторизація

```bash
vercel login
```

### Крок 3: Створення проекту

```bash
vercel
```

Відповіси на питання:
- Set up and deploy? **Y**
- Which scope? **Вибери свій акаунт**
- Link to existing project? **N**
- Project name? **ozerniy-booking** (або своє)
- In which directory? **./** (Enter)
- Override settings? **N**

### Крок 4: Створення Vercel Postgres БД

1. Перейди на https://vercel.com/dashboard
2. Вибери свій проект **ozerniy-booking**
3. Перейди на вкладку **Storage**
4. Натисни **Create Database**
5. Вибери **Postgres**
6. Назва БД: **ozerniy-booking-db**
7. Регіон: **Washington, D.C., USA (iad1)** (найближчий до України)
8. Натисни **Create**

### Крок 5: Підключення БД до проекту

1. В Storage -> вибери створену БД
2. Натисни **Connect**
3. Перейди на вкладку **.env.local**
4. **СКОПІЮЙ ВСІ ЗМІННІ** (POSTGRES_URL, POSTGRES_PRISMA_URL, і т.д.)
5. Також додай ці змінні в **Environment Variables** проекту на Vercel:
   - Settings -> Environment Variables
   - Додай всі POSTGRES_* змінні
   - Додай TELEGRAM_BOT_TOKEN
   - Додай TELEGRAM_GROUP_ID

### Крок 6: Фінальний деплой

```bash
vercel --prod
```

### Крок 7: Ініціалізація бази даних

Після деплою, відкрий в браузері:

```
https://your-app.vercel.app/api/init-db
```

Повинно показати: `{"success":true,"message":"Database initialized successfully"}`

### Крок 8: Налаштування Mini App в боті

1. Відкрий [@BotFather](https://t.me/botfather) в Telegram
2. Надішли команду `/mybots`
3. Вибери свого бота
4. Натисни **Bot Settings** → **Menu Button** → **Configure menu button**
5. Введи текст кнопки: `🏡 Забронювати альтанку`
6. Введи URL: `https://your-app.vercel.app`
7. Готово! Тепер в боті з'явиться кнопка меню

## 🧪 Тестування

### Перевірка членства

Відкрий в браузері (замінивши USER_ID на свій Telegram ID):

```
https://your-app.vercel.app/api/check-member
```

POST запит з body:
```json
{
  "userId": 123456789
}
```

### Перевірка бронювань

```
https://your-app.vercel.app/api/bookings?date=2026-02-15
```

## 📱 Використання

1. Користувач відкриває бота в Telegram
2. Натискає кнопку "🏡 Забронювати альтанку"
3. Відкривається Mini App
4. Система перевіряє, чи є користувач в групі ЖК
5. Користувач вибирає дату, альтанку та час
6. Заповнює форму (ім'я, будинок, квартира)
7. Підтверджує бронювання
8. Готово! ✅

## 🗂️ Структура проекту

```
ozerniy-booking/
├── app/
│   ├── api/
│   │   ├── bookings/route.js       # CRUD для бронювань
│   │   ├── check-member/route.js   # Перевірка членства
│   │   └── init-db/route.js        # Ініціалізація БД
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx                     # Головна сторінка
├── components/
│   ├── Calendar.jsx                 # Календар з альтанками
│   └── BookingForm.jsx              # Форма бронювання
├── lib/
│   ├── db.js                        # Робота з БД
│   └── telegram.js                  # Telegram API
├── .env.local                       # Змінні середовища (НЕ комітити!)
├── package.json
└── README.md
```

## 🔧 Технології

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Vercel Postgres
- **Telegram**: Telegram Bot API, Mini Apps SDK
- **Hosting**: Vercel

## ⚙️ Налаштування слотів

Якщо потрібно змінити час роботи або тривалість слотів, відредагуй `lib/telegram.js`:

```javascript
export function generateTimeSlots() {
  const startHour = 8;        // Початок роботи
  const endHour = 22;         // Кінець роботи
  const slotDuration = 3.5;   // Тривалість слоту в годинах
  // ...
}
```

## 🐛 Помилки і вирішення

### "Database init error"
- Перевір, чи правильно додані всі POSTGRES_* змінні в Environment Variables на Vercel
- Спробуй знову викликати `/api/init-db`

### "Failed to check membership"
- Перевір, чи правильний TELEGRAM_GROUP_ID (повинен бути зі знаком мінус)
- Перевір, чи бот доданий до групи як адміністратор

### "User data not available"
- Перевір, чи правильно налаштований Menu Button в BotFather
- Перевір, чи URL веде на правильний домен

## 📞 Підтримка

Якщо виникли питання - пиши автору проекту!

## 📄 Ліцензія

MIT License - використовуй вільно для своїх потреб!
