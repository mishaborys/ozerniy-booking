import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { format, addDays } from 'date-fns';
import { uk } from 'date-fns/locale';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

async function sendMessage(chatId, text) {
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
      }),
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export async function GET(request) {
  try {
    // Перевірка секретного ключа
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const in3Days = addDays(today, 3);
    in3Days.setHours(0, 0, 0, 0);
    
    const tomorrow = addDays(today, 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Знаходимо бронювання на через 3 дні
    const { rows: bookings3Days } = await sql`
      SELECT b.*, g.name as gazebo_name 
      FROM bookings b
      JOIN gazebos g ON b.gazebo_id = g.id
      WHERE b.booking_date = ${format(in3Days, 'yyyy-MM-dd')};
    `;

    // Знаходимо бронювання на завтра
    const { rows: bookingsTomorrow } = await sql`
      SELECT b.*, g.name as gazebo_name 
      FROM bookings b
      JOIN gazebos g ON b.gazebo_id = g.id
      WHERE b.booking_date = ${format(tomorrow, 'yyyy-MM-dd')};
    `;

    let sent3Days = 0;
    let sentTomorrow = 0;

    // Відправляємо нагадування за 3 дні
    for (const booking of bookings3Days) {
      const message = `
⏰ *Нагадування про бронювання*

Через 3 дні у вас заброньована альтанка:

🏡 *${booking.gazebo_name}*
📅 *Дата:* ${format(new Date(booking.booking_date), 'd MMMM yyyy, EEEE', { locale: uk })}
🕐 *Час:* ${booking.time_slot}
🏠 *Адреса:* Будинок ${booking.house_number}, кв. ${booking.apartment_number}

Гарного відпочинку! 🎉
      `;
      
      await sendMessage(booking.user_id, message);
      sent3Days++;
    }

    // Відправляємо нагадування на завтра
    for (const booking of bookingsTomorrow) {
      const message = `
⏰ *Нагадування про бронювання*

Завтра у вас заброньована альтанка:

🏡 *${booking.gazebo_name}*
📅 *Дата:* ${format(new Date(booking.booking_date), 'd MMMM yyyy, EEEE', { locale: uk })}
🕐 *Час:* ${booking.time_slot}
🏠 *Адреса:* Будинок ${booking.house_number}, кв. ${booking.apartment_number}

До зустрічі завтра! 👋
      `;
      
      await sendMessage(booking.user_id, message);
      sentTomorrow++;
    }

    return NextResponse.json({ 
      success: true, 
      sent: {
        in3Days: sent3Days,
        tomorrow: sentTomorrow
      }
    });
  } catch (error) {
    console.error('Send reminders error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
