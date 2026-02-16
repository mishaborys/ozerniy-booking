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

  useEffect(() => {
    // Ініціалізація Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Отримуємо дані користувача
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        setUserData(user);
        checkMembership(user.id);
      } else {
        setLoading(false);
        console.error('User data not available');
      }

      // Налаштування головної кнопки
      tg.MainButton.hide();
    } else {
      // Для тестування без Telegram
      const testUser = {
        id: 123456789,
        first_name: 'Тест',
        username: 'testuser',
      };
      setUserData(testUser);
      setIsMember(true); // Для тестування
      setLoading(false);
    }
  }, []);

  const checkMembership = async (userId) => {
    try {
      const response = await fetch('/api/check-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      setIsMember(data.isMember);
    } catch (error) {
      console.error('Failed to check membership:', error);
      setIsMember(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (gazeboId, gazeboName, timeSlot) => {
    setSelectedSlot({ gazeboId, gazeboName, timeSlot });
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  const handleBookingSuccess = (booking) => {
    setSelectedSlot(null);
    setShowSuccess(true);
    
    // Ховаємо повідомлення через 3 секунди
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    // Оновлюємо календар
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
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center">
        <div className="text-tg-text text-xl">Завантаження...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <div className="text-red-600 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Помилка</h2>
            <p>Не вдалося отримати дані користувача. Будь ласка, відкрийте додаток через Telegram бот.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <div className="text-orange-600 text-center">
            <div className="text-4xl mb-4">🚫</div>
            <h2 className="text-xl font-bold mb-2">Доступ обмежено</h2>
            <p className="mb-4">
              Для бронювання альтанок ви повинні бути учасником групи жильців ЖК "ОГ Гатне - чат" в Telegram.
            </p>
            <p className="text-sm text-gray-600">
              Приєднайтесь до групи та спробуйте знову. Щоб стати учасником групи напишіть{' '}
              <button
                onClick={handleCopyAdmin}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
              >
                @BurdaDmytro
              </button>
              {' '}в особисті повідомлення адресу свого проживання.
            </p>
            {copySuccess && (
              <div className="mt-3 text-sm text-green-600 font-medium animate-pulse">
                ✅ Тег скопійовано!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 
            className="text-3xl font-bold mb-2" 
            style={{ 
              color: '#000000',
              textShadow: '0 0 3px #ffffff, 0 0 3px #ffffff, 0 0 3px #ffffff, 0 0 5px #ffffff'
            }}
          >
            🌊🌲 ОГ Бронювання альтанок
          </h1>
          <p className="text-tg-hint" style={{ color: '#666666' }}>
            ЖК Озерний Гай
          </p>
          {userData && (
            <p className="text-sm text-tg-hint mt-2" style={{ color: '#666666' }}>
              Вітаємо, {userData.first_name}! 👋
            </p>
          )}
          
          <button
            onClick={() => setShowMyBookings(true)}
            className="mt-4 w-full px-4 py-3 bg-tg-button text-tg-button-text rounded-lg font-medium hover:opacity-90"
          >
            📋 Мої бронювання
          </button>

          <button
            onClick={() => setShowSubscriptions(true)}
            className="mt-2 w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
          >
            🔔 Мої підписки
          </button>
        </div>

        {/* Повідомлення про успішне бронювання */}
        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 animate-pulse">
            ✅ Бронювання успішно створено!
          </div>
        )}

        {/* Календар */}
        <Calendar
          onSlotSelect={handleSlotSelect}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userId={userData?.id}
          onBookingClick={handleBookingClick}
          onOpenDatePicker={() => setShowDatePicker(true)}
        />

        {/* Інструкція */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Правила бронювання:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Тривалість слоту: 3,5 години</li>
            <li>• Максимум 3 активних бронювання на користувача</li>
            <li>• Натисніть на зайнятий слот щоб побачити деталі</li>
            <li>• Бронювання доступне з 8:00 до 22:00</li>
            <li>• Можна скасувати своє бронювання</li>
            <li>• 🔔 Підпишіться на повідомлення якщо всі альтанки зайняті</li>
          </ul>
        </div>

        {/* Форма бронювання */}
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

        {/* Деталі бронювання */}
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

        {/* Мої бронювання */}
        {showMyBookings && (
          <MyBookings
            userId={userData?.id}
            onClose={() => setShowMyBookings(false)}
          />
        )}

        {/* Мої підписки */}
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
