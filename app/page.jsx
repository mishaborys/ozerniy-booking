'use client';

import { useEffect, useState } from 'react';
import Calendar from '@/components/Calendar';
import BookingForm from '@/components/BookingForm';
import BookingDetails from '@/components/BookingDetails';
import DatePicker from '@/components/DatePicker';
import MyBookings from '@/components/MyBookings';
import SubscriptionsManager from '@/components/SubscriptionsManager';
import { startOfToday } from 'date-fns';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasSubscriptions, setHasSubscriptions] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Always use dark mode
      document.documentElement.classList.add('dark');

      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserData(user);
        checkMembership(user.id);
      } else {
        setLoading(false);
        console.error('User data not available');
      }

      tg.MainButton.hide();
    } else {
      // Test mode: always dark
      document.documentElement.classList.add('dark');
      const testUser = {
        id: 123456789,
        first_name: 'Тест',
        username: 'testuser',
      };
      setUserData(testUser);
      setIsMember(true);
      setLoading(false);
    }
  }, []);

  const checkMembership = async (userId) => {
    // TODO: re-enable membership check after testing
    setIsMember(true);
    setLoading(false);
    // try {
    //   const response = await fetch('/api/check-member', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userId }),
    //   });
    //   const data = await response.json();
    //   setIsMember(data.isMember);
    // } catch (error) {
    //   console.error('Failed to check membership:', error);
    //   setIsMember(false);
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    const checkSubscriptions = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(`/api/subscriptions?userId=${userData.id}`);
        const data = await response.json();
        setHasSubscriptions(data.subscriptions && data.subscriptions.length > 0);
      } catch (error) {
        console.error('Failed to check subscriptions:', error);
        setHasSubscriptions(false);
      }
    };
    checkSubscriptions();
  }, [userData, showSubscriptions]);

  const handleSlotSelect = (gazeboId, gazeboName, timeSlot) => {
    setSelectedSlot({ gazeboId, gazeboName, timeSlot });
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSelectedDate(new Date(selectedDate));
  };

  const handleBookingCancel = () => {
    setSelectedSlot(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleCopyAdmin = async () => {
    try {
      await navigator.clipboard.writeText('@BurdaDmytro');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg">Завантаження...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Помилка</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Не вдалося отримати дані користувача. Будь ласка, відкрийте додаток через Telegram бот.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Доступ обмежено</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Для бронювання альтанок ви повинні бути учасником групи жильців ЖК "ОГ Гатне - чат" в Telegram.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Приєднайтесь до групи та спробуйте знову. Щоб стати учасником групи напишіть{' '}
              <button
                onClick={handleCopyAdmin}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline cursor-pointer"
              >
                @BurdaDmytro
              </button>
              {' '}в особисті повідомлення адресу свого проживання.
            </p>
            {copySuccess && (
              <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                ✅ Тег скопійовано!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4 pb-20">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            🌊🌲 ОГ Бронювання альтанок
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ЖК Озерний Гай</p>
          {userData && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Вітаємо, {userData.first_name}! 👋
            </p>
          )}

          <button
            onClick={() => setShowMyBookings(true)}
            className="mt-4 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            📋 Мої бронювання
          </button>

          {hasSubscriptions && (
            <button
              onClick={() => setShowSubscriptions(true)}
              className="mt-2 w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              🔔 Мої підписки
            </button>
          )}
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl p-4 animate-pulse">
            ✅ Бронювання успішно створено!
          </div>
        )}

        {/* Calendar */}
        <Calendar
          onSlotSelect={handleSlotSelect}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userId={userData?.id}
          onBookingClick={handleBookingClick}
          onOpenDatePicker={() => setShowDatePicker(true)}
        />

        {/* Rules */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">ℹ️ Правила бронювання:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Тривалість слоту: 3,5 години</li>
            <li>• Максимум 3 активних бронювання на користувача</li>
            <li>• Натисніть на зайнятий слот щоб побачити деталі</li>
            <li>• Бронювання доступне з 8:00 до 22:00</li>
            <li>• Можна скасувати своє бронювання</li>
            <li>• Бронювання доступне не більше ніж на 45 днів вперед</li>
            <li>• Створюйте підписку, якщо всі альтанки зайняті</li>
          </ul>
        </div>

        {/* Booking Form */}
        {selectedSlot && (
          <BookingForm
            gazeboId={selectedSlot.gazeboId}
            gazeboName={selectedSlot.gazeboName}
            timeSlot={selectedSlot.timeSlot}
            date={selectedDate}
            userId={userData.id}
            username={userData.username}
            firstName={userData.first_name}
            onSuccess={handleBookingSuccess}
            onCancel={handleBookingCancel}
          />
        )}

        {/* Booking Details */}
        {selectedBooking && (
          <BookingDetails
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            currentUserId={userData?.id}
          />
        )}

        {/* Date Picker */}
        {showDatePicker && (
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onClose={() => setShowDatePicker(false)}
          />
        )}

        {/* My Bookings */}
        {showMyBookings && (
          <MyBookings
            userId={userData?.id}
            onClose={() => setShowMyBookings(false)}
          />
        )}

        {/* Subscriptions */}
        {showSubscriptions && (
          <SubscriptionsManager
            userId={userData?.id}
            onClose={() => setShowSubscriptions(false)}
          />
        )}
      </div>
    </div>
  );
}
