import {
  getGazebos,
  getBookings,
  createBooking,
  getUserBookings,
  deleteBooking
} from '@/lib/db';
import { generateTimeSlots, sendBookingConfirmation, sendBookingCancellation, getSlotEmoji } from '@/lib/telegram';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

// GET - отримати альтанки та бронювання
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }
    
    const gazebos = await getGazebos();
    const bookings = await getBookings(date);
    const timeSlots = generateTimeSlots();
    
    // Якщо є userId, отримуємо бронювання користувача
    let userBooking = null;
    if (userId) {
      const userBookings = await getUserBookings(userId, date);
      userBooking = userBookings.length > 0 ? userBookings[0] : null;
    }
    
    // Формуємо структуру даних для фронтенду
    const availability = gazebos.map(gazebo => ({
      id: gazebo.id,
      name: gazebo.name,
      slots: timeSlots.map(slot => {
        const slotInfo = getSlotEmoji(slot);
        return {
          time: slot,
          emoji: slotInfo.emoji,
          name: slotInfo.name,
          isBooked: bookings.some(
            b => b.gazebo_id === gazebo.id && b.time_slot === slot
          ),
          bookingInfo: bookings.find(
            b => b.gazebo_id === gazebo.id && b.time_slot === slot
          ) || null
        };
      })
    }));
    
    return NextResponse.json({ 
      gazebos: availability,
      userBooking,
      timeSlots
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - створити бронювання
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Валідація
    const required = ['gazeboId', 'userId', 'firstName', 'houseNumber', 'apartmentNumber', 'bookingDate', 'timeSlot'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }
    
    const booking = await createBooking(data);

    console.log('✅ Booking created successfully:', booking.id);

    // Відправляємо повідомлення користувачу
    const gazebos = await getGazebos();
    const gazebo = gazebos.find(g => g.id === data.gazeboId);

    console.log('📧 Attempting to send confirmation to user:', data.userId);

    try {
      await sendBookingConfirmation(data.userId, {
        gazeboName: gazebo?.name || 'Альтанка',
        date: format(new Date(data.bookingDate), 'd MMMM yyyy, EEEE', { locale: uk }),
        timeSlot: data.timeSlot,
        houseNumber: data.houseNumber,
        apartmentNumber: data.apartmentNumber,
        phoneNumber: data.phoneNumber,
      });
    } catch (notificationError) {
      // Логуємо помилку але не падаємо - бронювання вже створено
      console.error('⚠️ Failed to send notification, but booking was created:', notificationError);
    }

    return NextResponse.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 400 }
    );
  }
}

// DELETE - видалити бронювання
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!bookingId || !userId) {
      return NextResponse.json(
        { error: 'Booking ID and User ID are required' },
        { status: 400 }
      );
    }

    const deleted = await deleteBooking(bookingId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Booking not found or you don\'t have permission' },
        { status: 404 }
      );
    }

    console.log('✅ Booking deleted successfully:', bookingId);
    console.log('📧 Attempting to send cancellation notification to user:', userId);

    // Відправляємо повідомлення про скасування
    try {
      await sendBookingCancellation(userId, {
        gazeboName: deleted.gazebo_name,
        date: format(new Date(deleted.booking_date), 'd MMMM yyyy, EEEE', { locale: uk }),
        timeSlot: deleted.time_slot,
      });
    } catch (notificationError) {
      // Логуємо помилку але не падаємо - бронювання вже видалено
      console.error('⚠️ Failed to send cancellation notification, but booking was deleted:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
