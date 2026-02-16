'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function MyBookings({ userId, onClose }) {
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

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
      setPastBookings(past.reverse()); // Найновіші спочатку
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings?id=${bookingId}&userId=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Помилка при скасуванні');
      }

      alert('✅ Бронювання скасовано!');
      fetchBookings();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  const displayBookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>📋 Мої бронювання</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Таби */}
          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'border-b-2 border-transparent'
              }`}
              style={activeTab !== 'active' ? { color: '#666666' } : {}}
            >
              Активні ({activeBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'border-b-2 border-transparent'
              }`}
              style={activeTab !== 'history' ? { color: '#666666' } : {}}
            >
              Історія ({pastBookings.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8" style={{ color: '#666666' }}>
              Завантаження...
            </div>
          ) : displayBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏡</div>
              <p style={{ color: '#666666' }}>
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
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
                        {booking.gazebo_name}
                      </span>
                    </div>

                    <div className="space-y-1" style={{ color: '#666666' }}>
                      <div className="font-medium">
                        📅 {format(new Date(booking.booking_date), 'd MMMM yyyy, EEEE', { locale: uk })}
                      </div>
                      <div className="text-sm">
                        🕐 {booking.time_slot}
                      </div>
                      <div className="text-sm">
                        🏠 Будинок {booking.house_number}, кв. {booking.apartment_number}
                      </div>
                      {booking.phone_number && (
                        <div className="text-sm">
                          📞 {booking.phone_number}
                        </div>
                      )}
                    </div>

                    {activeTab === 'active' && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="w-full px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        Скасувати бронювання
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              style={{ color: '#333333' }}
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
