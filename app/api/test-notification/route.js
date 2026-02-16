import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing notification send to user:', userId);
    console.log('🔑 BOT_TOKEN exists:', !!BOT_TOKEN);
    console.log('🔑 BOT_TOKEN (first 10 chars):', BOT_TOKEN?.substring(0, 10));

    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: 'TELEGRAM_BOT_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const testMessage = `🧪 *Тестове повідомлення*\n\nЯкщо ви це бачите, відправка повідомлень працює!`;

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId,
          text: testMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    const data = await response.json();

    console.log('📬 Telegram API response:', data);

    if (!response.ok) {
      console.error('❌ Telegram API error:', data);
      return NextResponse.json(
        {
          error: 'Failed to send message',
          telegramError: data,
          status: response.status,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      telegramResponse: data,
    });
  } catch (error) {
    console.error('❌ Error in test endpoint:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
