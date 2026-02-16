'use client';

import { useState } from 'react';

export default function BookingDetails({ booking, onClose, currentUserId }) {
  const isOwner = booking.user_id === currentUserId;
  const [copyPhoneSuccess, setCopyPhoneSuccess] = useState(false);
  const [copyTagSuccess, setCopyTagSuccess] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(booking.phone_number);
      setCopyPhoneSuccess(true);
      setTimeout(() => {
        setCopyPhoneSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyTag = async () => {
    try {
      await navigator.clipboard.writeText(`@${booking.username}`);
      setCopyTagSuccess(true);
      setTimeout(() => {
        setCopyTagSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings?id=${booking.id}&userId=${currentUserId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Помилка при скасуванні');
      }

      alert('✅ Бронювання скасовано!');
      window.location.reload(); // Перезавантажуємо сторінку
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              {isOwner ? '📋 Ваше бронювання' : '👤 Деталі бронювання'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span style={{ color: '#666666' }}>Альтанка:</span>
                <span className="font-semibold" style={{ color: '#1a1a1a' }}>{booking.gazebo_name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#666666' }}>Час:</span>
                <span className="font-semibold" style={{ color: '#1a1a1a' }}>{booking.time_slot}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#666666' }}>Дата:</span>
                <span className="font-semibold" style={{ color: '#1a1a1a' }}>
                  {new Date(booking.booking_date).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold" style={{ color: '#1a1a1a' }}>Контактна інформація:</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#666666' }}>Ім'я:</span>
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>{booking.first_name}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: '#666666' }}>Будинок:</span>
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>{booking.house_number}</span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: '#666666' }}>Квартира:</span>
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>{booking.apartment_number}</span>
                </div>

                {booking.phone_number && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#666666' }}>Телефон:</span>
                    <button
                      onClick={handleCopyPhone}
                      className="font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      {booking.phone_number}
                    </button>
                  </div>
                )}

                {booking.username && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#666666' }}>Telegram:</span>
                    <button
                      onClick={handleCopyTag}
                      className="font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      @{booking.username}
                    </button>
                  </div>
                )}
              </div>

              {copyPhoneSuccess && (
                <div className="text-sm text-green-600 font-medium animate-pulse text-center">
                  ✅ Телефон скопійовано!
                </div>
              )}

              {copyTagSuccess && (
                <div className="text-sm text-green-600 font-medium animate-pulse text-center">
                  ✅ Тег скопійовано!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              style={{ color: '#333333' }}
            >
              Закрити
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                Скасувати бронювання
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
