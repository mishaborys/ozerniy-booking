'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfToday, isBefore } from 'date-fns';
import { uk } from 'date-fns/locale';
import SubscriptionConfirmModal from './SubscriptionConfirmModal';

export default function Calendar({ 
  onSlotSelect, 
  selectedDate, 
  onDateChange, 
  userId,
  onBookingClick,
  onOpenDatePicker 
}) {
  const [gazebos, setGazebos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBooking, setUserBooking] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, userId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      
      if (userId) {
        params.append('userId', userId);
      }
      
      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      setGazebos(data.gazebos);
      setUserBooking(data.userBooking);

      // Завантажуємо підписки користувача
      if (userId) {
        const subsResponse = await fetch(`/api/subscriptions?userId=${userId}`);
        const subsData = await subsResponse.json();
        setUserSubscriptions(subsData.subscriptions || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (days) => {
    const newDate = addDays(selectedDate, days);
    // Дозволяємо перегляд будь-яких дат (включно з минулими)
    onDateChange(newDate);
  };

  const handleSlotClick = (slot, gazebo) => {
    if (slot.isBooked) {
      // Показуємо деталі бронювання
      onBookingClick(slot.bookingInfo);
    } else if (!userBooking) {
      // Створюємо нове бронювання
      onSlotSelect(gazebo.id, gazebo.name, slot.time);
    }
  };

  const isSlotFullyBooked = (timeSlot) => {
    // Перевіряємо чи всі 3 альтанки зайняті в цьому слоті
    const bookedCount = gazebos.filter(gazebo =>
      gazebo.slots.find(slot => slot.time === timeSlot && slot.isBooked)
    ).length;
    return bookedCount === 3;
  };

  const isUserSubscribedToSlot = (timeSlot) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return userSubscriptions.some(
      sub => sub.booking_date === dateStr && sub.time_slot === timeSlot
    );
  };

  const handleSubscribeClick = (timeSlot) => {
    // Зберігаємо timeSlot і відкриваємо модальне вікно
    setPendingSubscription(timeSlot);
    setShowSubscriptionModal(true);
  };

  const handleConfirmSubscription = async () => {
    if (!pendingSubscription) return;

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username,
          firstName: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Користувач',
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: pendingSubscription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка підписки');
      }

      // Закриваємо модальне вікно
      setShowSubscriptionModal(false);
      setPendingSubscription(null);

      // Оновлюємо список підписок
      fetchBookings();
    } catch (error) {
      alert('❌ ' + error.message);
      setShowSubscriptionModal(false);
      setPendingSubscription(null);
    }
  };

  const handleCancelSubscription = () => {
    setShowSubscriptionModal(false);
    setPendingSubscription(null);
  };

  const handleUnsubscribeClick = async (timeSlot) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const subscription = userSubscriptions.find(
      sub => sub.booking_date === dateStr && sub.time_slot === timeSlot
    );

    if (!subscription) return;

    try {
      const response = await fetch(
        `/api/subscriptions?id=${subscription.id}&userId=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Помилка відписки');
      }

      // Оновлюємо список підписок
      fetchBookings();
      alert('✅ Ви відписались від повідомлень про цей слот');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-tg-hint">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Вибір дати */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4" style={{ backgroundColor: '#ffffff' }}>
        <button
          onClick={() => handleDateChange(-1)}
          className="text-2xl text-tg-button"
          style={{ color: '#40a7e3' }}
        >
          ←
        </button>
        
        <button
          onClick={onOpenDatePicker}
          className="text-center hover:bg-gray-50 rounded-lg px-4 py-2 transition-colors"
        >
          <div 
            className="text-lg font-semibold"
            style={{ 
              color: '#000000',
              textShadow: '0 0 3px #ffffff, 0 0 3px #ffffff, 0 0 5px #ffffff'
            }}
          >
            {format(selectedDate, 'd MMMM yyyy', { locale: uk })}
          </div>
          <div 
            className="text-sm"
            style={{ 
              color: '#000000',
              textShadow: '0 0 2px #ffffff, 0 0 2px #ffffff, 0 0 4px #ffffff'
            }}
          >
            {format(selectedDate, 'EEEE', { locale: uk })} · Натисніть для вибору
          </div>
        </button>
        
        <button
          onClick={() => handleDateChange(1)}
          className="text-2xl text-tg-button"
          style={{ color: '#40a7e3' }}
        >
          →
        </button>
      </div>

      {/* Повідомлення про існуюче бронювання */}
      {userBooking && (
        <div 
          onClick={() => onBookingClick(userBooking)}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div className="text-sm text-blue-800">
            <strong>Ваше бронювання:</strong> {userBooking.gazebo_name}, {userBooking.time_slot}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Натисніть для деталей
          </div>
        </div>
      )}

      {/* Сітка альтанок та слотів */}
      <div className="space-y-4">
        {gazebos.map((gazebo) => (
          <div key={gazebo.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-tg-button text-tg-button-text px-4 py-3 font-semibold">
              {gazebo.name}
            </div>
            
            <div className="p-2 space-y-2">
              {gazebo.slots.map((slot) => {
                const isPastDate = isBefore(selectedDate, startOfToday());
                const isDisabled = !slot.isBooked && (userBooking || isPastDate);
                const isFullyBooked = isSlotFullyBooked(slot.time);
                const isSubscribed = isUserSubscribedToSlot(slot.time);

                return (
                  <div key={slot.time} className="space-y-1">
                    <button
                      onClick={() => handleSlotClick(slot, gazebo)}
                      disabled={isDisabled}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        slot.isBooked
                          ? isPastDate
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer border border-gray-300'
                            : 'bg-orange-50 text-orange-800 hover:bg-orange-100 cursor-pointer border border-orange-200'
                          : isPastDate
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : userBooking
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-800 hover:bg-green-100 active:bg-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{slot.emoji}</span>
                          <div>
                            <div className="font-medium">{slot.time}</div>
                            <div className="text-xs opacity-75">{slot.name}</div>
                          </div>
                        </div>
                        <span className="text-sm">
                          {slot.isBooked ? '👤 Зайнято' : isPastDate ? '—' : '✓ Вільно'}
                        </span>
                      </div>
                    </button>

                    {/* Кнопка підписки - показується ТІЛЬКИ якщо всі 3 альтанки зайняті */}
                    {!isPastDate && isFullyBooked && !userBooking && (
                      <button
                        onClick={() => isSubscribed ? handleUnsubscribeClick(slot.time) : handleSubscribeClick(slot.time)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSubscribed
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100'
                            : 'bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100'
                        }`}
                      >
                        {isSubscribed ? '🔕 Відписатись від повідомлень' : '🔔 Повідомити якщо звільниться'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {userBooking && (
        <div className="text-center text-sm text-tg-hint mt-4">
          У вас вже є бронювання на цей день. Натисніть на нього, щоб переглянути деталі або скасувати.
        </div>
      )}

      {/* Модальне вікно підтвердження підписки */}
      {showSubscriptionModal && pendingSubscription && (
        <SubscriptionConfirmModal
          timeSlot={pendingSubscription}
          date={format(selectedDate, 'd MMMM yyyy, EEEE', { locale: uk })}
          onConfirm={handleConfirmSubscription}
          onClose={handleCancelSubscription}
        />
      )}
    </div>
  );
}
