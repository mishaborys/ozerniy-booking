import {
  createSlotSubscription,
  deleteSlotSubscription,
  getUserSlotSubscriptions,
  isSlotFullyBooked,
} from '@/lib/db';
import { sendSubscriptionCreatedNotification } from '@/lib/telegram';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

// GET - отримати підписки користувача
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const subscriptions = await getUserSlotSubscriptions(userId);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - створити підписку
export async function POST(request) {
  try {
    const data = await request.json();

    // Валідація
    const required = ['userId', 'firstName', 'bookingDate', 'timeSlot'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // КРИТИЧНА ПЕРЕВІРКА: переконатись що всі 3 альтанки дійсно зайняті
    const isFullyBooked = await isSlotFullyBooked(data.bookingDate, data.timeSlot);

    if (!isFullyBooked) {
      return NextResponse.json(
        { error: 'Є вільні альтанки в цьому слоті. Підписка не потрібна.' },
        { status: 400 }
      );
    }

    const subscription = await createSlotSubscription(data);

    // Відправляємо Telegram повідомлення про створення підписки
    try {
      await sendSubscriptionCreatedNotification(data.userId, {
        date: format(new Date(data.bookingDate), 'd MMMM yyyy, EEEE', { locale: uk }),
        timeSlot: data.timeSlot,
      });
      console.log('✅ Subscription created notification sent');
    } catch (notificationError) {
      console.error('⚠️ Failed to send subscription notification:', notificationError);
      // Не падаємо - підписка вже створена
    }

    return NextResponse.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 400 }
    );
  }
}

// DELETE - видалити підписку
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Subscription ID and User ID are required' },
        { status: 400 }
      );
    }

    const deleted = await deleteSlotSubscription(subscriptionId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Subscription not found or you don\'t have permission' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
