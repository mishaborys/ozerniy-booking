import { getAllUserBookings, saveFeedback } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_USER_ID = 356656729;

// Зберігаємо стан користувачів, що очікують відгук
const waitingForFeedback = new Map();

async function sendMessage(chatId, text, options = {}) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        ...options,
      }),
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Обробляємо тільки повідомлення
    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text || '';
    const firstName = message.from.first_name || '';
    const lastName = message.from.last_name || '';
    const username = message.from.username || '';

    // Якщо користувач в режимі очікування відгуку
    if (waitingForFeedback.has(userId) && !text.startsWith('/')) {
      const feedback = text;
      
      // Зберігаємо відгук в БД
      await saveFeedback({
        userId,
        username,
        firstName,
        lastName,
        message: feedback,
      });
      
      // Відправляємо користувачу підтвердження
      await sendMessage(
        chatId,
        '✅ Дякуємо за ваш відгук! Ми обов\'язково його розглянемо.'
      );
      
      // Відправляємо адміністратору
      const userLink = username 
        ? `@${username}` 
        : `[${firstName}](tg://user?id=${userId})`;
      
      await sendMessage(
        ADMIN_USER_ID,
        `📬 *Новий відгук*\n\n` +
        `*Користувач:* ${userLink}\n` +
        `*Ім'я:* ${firstName} ${lastName}\n` +
        `*User ID:* \`${userId}\`\n\n` +
        `*Відгук:*\n${feedback}`
      );
      
      // Видаляємо зі стану очікування
      waitingForFeedback.delete(userId);
      
      return NextResponse.json({ ok: true });
    }

    // Команда /start
    if (text === '/start') {
      await sendMessage(
        chatId,
        `🏡 *Вітаємо в системі бронювання альтанок ЖК Озерний Гай!*

Для бронювання альтанки натисніть кнопку *"Забронювати"* в меню бота (внизу біля поля вводу).

📋 *Доступні команди:*
/my\\_bookings - переглянути мої бронювання
/feedback - залишити відгук
/start - показати це повідомлення

Гарного відпочинку! 🎉`
      );
    }
    
    // Команда /my_bookings
    else if (text === '/my_bookings') {
      const bookings = await getAllUserBookings(userId);
      
      // Фільтруємо активні бронювання
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const activeBookings = bookings.filter(b => {
        const bookingDate = new Date(b.booking_date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= now;
      });
      
      if (activeBookings.length === 0) {
        await sendMessage(
          chatId,
          '📋 *Мої бронювання*\n\nУ вас поки немає активних бронювань.\n\nНатисніть кнопку "Забронювати" щоб створити нове бронювання.'
        );
      } else {
        let messageText = '📋 *Мої бронювання*\n\n';
        
        activeBookings.forEach((booking, index) => {
          const date = format(new Date(booking.booking_date), 'd MMMM yyyy, EEEE', { locale: uk });
          messageText += `${index + 1}\\. *${booking.gazebo_name}*\n`;
          messageText += `   📅 ${date}\n`;
          messageText += `   🕐 ${booking.time_slot}\n`;
          messageText += `   🏠 Будинок ${booking.house_number}, кв\\. ${booking.apartment_number}\n\n`;
        });
        
        messageText += '_Щоб скасувати бронювання, відкрийте додаток через кнопку "Забронювати"_';
        
        await sendMessage(chatId, messageText);
      }
    }
    
    // Команда /feedback
    else if (text === '/feedback') {
      waitingForFeedback.set(userId, true);
      
      await sendMessage(
        chatId,
        '💬 *Залишити відгук*\n\n' +
        'Будь ласка, напишіть ваш відгук про роботу системи бронювання.\n\n' +
        'Ми цінуємо вашу думку та обов\'язково розглянемо всі пропозиції!'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
