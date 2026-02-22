'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function MyBookings({ userId, onClose }) {
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/my-bookings?userId=${userId}`);
      const data = await response.json();

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const active = (data.bookings || []).filter(b => {
        const bookingDate = new Date(b.booking_date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= now;
      });

      const past = (data.bookings || []).filter(b => {
        const bookingDate = new Date(b.booking_date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate < now;
      });

      setActiveBookings(active);
      setPastBookings(past.reverse());
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;
    try {
      const response = await fetch(
        `/api/bookings?id=${bookingId}&userId=${userId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Помилка при скасуванні');
      alert('✅ Бронювання скасовано!');
      fetchBookings();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const displayBookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">📋 Мої бронювання</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Активні ({activeBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Історія ({pastBookings.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              Завантаження...
            </div>
          ) : displayBookings.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🏡</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'active'
                  ? 'У вас поки немає активних бронювань'
                  : 'Історія бронювань порожня'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {displayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl p-4"
                >
                  <div className="space-y-3">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {booking.gazebo_name}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        📅 {format(new Date(booking.booking_date), 'd MMMM yyyy, EEEE', { locale: uk })}
                      </div>
                      <div>🕐 {booking.time_slot}</div>
                      <div>🏠 Будинок {booking.house_number}, кв. {booking.apartment_number}</div>
                      {booking.phone_number && <div>📞 {booking.phone_number}</div>}
                    </div>

                    {activeTab === 'active' && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        Скасувати бронювання
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
