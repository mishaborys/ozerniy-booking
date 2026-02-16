const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_ID = process.env.TELEGRAM_GROUP_ID;

export async function checkUserMembership(userId) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${GROUP_ID}&user_id=${userId}`
    );
    
    const data = await response.json();
    
    if (!data.ok) {
      return false;
    }
    
    const status = data.result.status;
    // member, administrator, creator - дозволені статуси
    return ['member', 'administrator', 'creator'].includes(status);
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
}

export async function sendBookingConfirmation(userId, booking) {
  try {
    console.log('📨 Sending booking confirmation to user:', userId);

    if (!BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN is not set!');
      return;
    }

    const message = `
✅ *Бронювання підтверджено!*

🏡 *Альтанка:* ${booking.gazeboName}
📅 *Дата:* ${booking.date}
🕐 *Час:* ${booking.timeSlot}
🏠 *Адреса:* Будинок ${booking.houseNumber}, кв. ${booking.apartmentNumber}
📱 *Телефон:* ${booking.phoneNumber}

Гарного відпочинку! 🎉
    `;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: userId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Telegram API error:', data);
      console.error('Response status:', response.status);
      throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
    }

    console.log('✅ Booking confirmation sent successfully to user:', userId);
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error);
    console.error('Error details:', error.message);
  }
}

export function generateTimeSlots() {
  const slots = [];
  const startHour = 8;
  const endHour = 22;
  const slotDuration = 3.5; // годин
  
  let currentHour = startHour;
  
  while (currentHour < endHour) {
    const startTime = formatTime(currentHour);
    const endTime = formatTime(currentHour + slotDuration);
    slots.push(`${startTime}-${endTime}`);
    currentHour += slotDuration;
  }
  
  return slots;
}

export function getSlotEmoji(timeSlot) {
  const startTime = timeSlot.split('-')[0];
  const hour = parseInt(startTime.split(':')[0]);
  
  // 08:00-11:30 - Ранковий
  if (hour >= 6 && hour < 11) {
    return { emoji: '🌅', name: 'Ранковий' };
  } 
  // 11:30-15:00 - Обідній
  else if (hour >= 11 && hour < 15) {
    return { emoji: '🌞', name: 'Обідній' };
  } 
  // 15:00-18:30 - Вечірній
  else if (hour >= 15 && hour < 18) {
    return { emoji: '🌇', name: 'Вечірній' };
  } 
  // 18:30-22:00 - Нічний
  else {
    return { emoji: '🌙', name: 'Нічний' };
  }
}

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
