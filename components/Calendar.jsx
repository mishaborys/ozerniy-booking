'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfToday, isBefore, isAfter } from 'date-fns';
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

  const maxDate = addDays(startOfToday(), 45);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, userId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: format(selectedDate, 'yyyy-MM-dd') });
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      setGazebos(data.gazebos);
      setUserBooking(data.userBooking);

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
    if (days > 0 && isAfter(newDate, maxDate)) return;
    onDateChange(newDate);
  };

  const handleSlotClick = (slot, gazebo) => {
    if (slot.isBooked) {
      onBookingClick(slot.bookingInfo);
    } else if (!userBooking) {
      onSlotSelect(gazebo.id, gazebo.name, slot.time);
    }
  };

  const isSlotFullyBooked = (timeSlot) => {
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
      if (!response.ok) throw new Error(data.error || 'Помилка підписки');
      setShowSubscriptionModal(false);
      setPendingSubscription(null);
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
      if (!response.ok) throw new Error('Помилка відписки');
      fetchBookings();
      alert('✅ Ви відписались від повідомлень про цей слот');
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 dark:text-gray-500">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <button
          onClick={() => handleDateChange(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xl"
        >
          ←
        </button>

        <button
          onClick={onOpenDatePicker}
          className="text-center px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {format(selectedDate, 'd MMMM yyyy', { locale: uk })}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {format(selectedDate, 'EEEE', { locale: uk })} · Натисніть для вибору
          </div>
        </button>

        <button
          onClick={() => handleDateChange(1)}
          disabled={isAfter(addDays(selectedDate, 1), maxDate)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xl disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>

      {/* User booking notice */}
      {userBooking && (
        <div
          onClick={() => onBookingClick(userBooking)}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
            Ваше бронювання: {userBooking.gazebo_name}, {userBooking.time_slot}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            Натисніть для деталей
          </div>
        </div>
      )}

      {/* Gazebo grid */}
      <div className="space-y-4">
        {gazebos.map((gazebo) => (
          <div key={gazebo.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-3 font-semibold text-sm">
              {gazebo.name}
            </div>

            <div className="p-3 space-y-2">
              {gazebo.slots.map((slot) => {
                const isPastDate = isBefore(selectedDate, startOfToday());
                const isTooFarAhead = isAfter(selectedDate, maxDate);
                const isDisabled = !slot.isBooked && (userBooking || isPastDate || isTooFarAhead);
                const isFullyBooked = isSlotFullyBooked(slot.time);
                const isSubscribed = isUserSubscribedToSlot(slot.time);

                let slotClass = '';
                if (slot.isBooked) {
                  slotClass = isPastDate
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30';
                } else if (isPastDate || isTooFarAhead) {
                  slotClass = 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 cursor-not-allowed';
                } else if (userBooking) {
                  slotClass = 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 cursor-not-allowed';
                } else {
                  slotClass = 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 active:bg-emerald-200 dark:active:bg-emerald-900/40';
                }

                return (
                  <div key={slot.time} className="space-y-1">
                    <button
                      onClick={() => handleSlotClick(slot, gazebo)}
                      disabled={isDisabled}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${slotClass}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{slot.emoji}</span>
                          <div>
                            <div className="font-medium text-sm">{slot.time}</div>
                            <div className="text-xs opacity-70">{slot.name}</div>
                          </div>
                        </div>
                        <span className="text-xs font-medium">
                          {slot.isBooked ? '👤 Зайнято' : isPastDate ? '—' : '✓ Вільно'}
                        </span>
                      </div>
                    </button>

                    {/* Subscription button */}
                    {!isPastDate && !isTooFarAhead && isFullyBooked && !userBooking && (
                      <button
                        onClick={() => isSubscribed ? handleUnsubscribeClick(slot.time) : handleSubscribeClick(slot.time)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isSubscribed
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
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
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          У вас вже є бронювання на цей день. Натисніть на нього, щоб переглянути деталі або скасувати.
        </div>
      )}

      {/* Subscription confirm modal */}
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
