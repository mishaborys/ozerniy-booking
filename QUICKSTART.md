# 🚀 ШВИДКІ ІНСТРУКЦІЇ - ПОЧНИ ЗВІДСИ!

## ✅ Що вже готово:
- ✅ Код проекту
- ✅ Telegram бот токен вже додано
- ✅ Структура бази даних

## 📝 ЩО ТРЕБА ЗРОБИТИ (5 КРОКІВ):

### Крок 1: Отримай ID групи Telegram

1. Додай свого бота до групи ЖК як **адміністратора**
2. Відправ будь-яке повідомлення в групу
3. Відкрий в браузері:
   ```
   https://api.telegram.org/bot8286795545:AAGjus1oayh3WXqiw0FGYtZ1gD9g185QM6o/getUpdates
   ```
4. Знайди в JSON: `"chat":{"id":-1001234567890}`
5. Скопіюй ID (зі знаком мінус!) - це твій GROUP_ID

### Крок 2: Встанови залежності

```bash
cd ozerniy-booking
npm install
```

### Крок 3: Задеплой на Vercel

```bash
# Встанови Vercel CLI (якщо ще не встановлено)
npm install -g vercel

# Авторизуйся
vercel login

# Задеплой проект
vercel
```

Відповідай на питання:
- Set up and deploy? → **Y**
- Which scope? → **Вибери свій акаунт**
- Link to existing project? → **N**
- Project name? → **ozerniy-booking**
- In which directory? → **./** (просто Enter)
- Override settings? → **N**

### Крок 4: Створи Postgres БД на Vercel

1. Перейди на https://vercel.com/dashboard
2. Вибери проект **ozerniy-booking**
3. Перейди: **Storage** → **Create Database** → **Postgres**
4. Назва: **ozerniy-booking-db**
5. Регіон: **Washington, D.C., USA (iad1)**
6. Натисни **Create**

### Крок 5: Додай змінні середовища

1. В Vercel Dashboard → твій проект → **Settings** → **Environment Variables**
2. Додай ці змінні:

```
TELEGRAM_BOT_TOKEN = 8286795545:AAGjus1oayh3WXqiw0FGYtZ1gD9g185QM6o
TELEGRAM_GROUP_ID = -100ТВІЙ_GROUP_ID (замінити!)
```

3. Postgres змінні додаються автоматично після створення БД
4. Перейди на вкладку **Deployments**
5. Натисни на останній деплой → три крапки → **Redeploy**

### Крок 6: Ініціалізуй базу даних

Відкрий в браузері (замінивши на свій URL):
```
https://твій-проект.vercel.app/api/init-db
```

Має показати:
```json
{"success":true,"message":"Database initialized successfully"}
```

### Крок 7: Налаштуй Menu Button в боті

1. Відкрий [@BotFather](https://t.me/botfather)
2. Команда: `/mybots`
3. Вибери свого бота
4. **Bot Settings** → **Menu Button** → **Configure menu button**
5. Текст кнопки: `🏡 Забронювати альтанку`
6. URL: `https://твій-проект.vercel.app`

## 🎉 ГОТОВО!

Тепер відкрий бота в Telegram і натисни кнопку "Забронювати альтанку" - Mini App запрацює!

## 🆘 Проблеми?

**Не отримую GROUP_ID:**
- Бот повинен бути адміністратором групи
- Відправ нове повідомлення в групу
- Перевір getUpdates знову

**База даних не працює:**
- Перевір Environment Variables на Vercel
- Спробуй Redeploy
- Перевіртe /api/init-db знову

**Mini App не відкривається:**
- Перевір URL в Menu Button
- Переконайся, що деплой завершився успішно
- Почекай 1-2 хвилини після деплою

## 📚 Детальна документація

Дивись файл **README.md** для повної документації.
