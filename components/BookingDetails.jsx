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
      setTimeout(() => setCopyPhoneSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyTag = async () => {
    try {
      await navigator.clipboard.writeText(`@${booking.username}`);
      setCopyTagSuccess(true);
      setTimeout(() => setCopyTagSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;

    try {
      const response = await fetch(
        `/api/bookings?id=${booking.id}&userId=${currentUserId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Помилка при скасуванні');
      alert('✅ Бронювання скасовано!');
      window.location.reload();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isOwner ? '📋 Ваше бронювання' : '👤 Деталі бронювання'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Booking info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Альтанка:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{booking.gazebo_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Час:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{booking.time_slot}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Дата:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(booking.booking_date).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </div>

            {/* Contact info */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Контактна інформація:</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ім'я:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{booking.first_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Будинок:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{booking.house_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Квартира:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{booking.apartment_number}</span>
                </div>

                {booking.phone_number && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Телефон:</span>
                    <button
                      onClick={handleCopyPhone}
                      className="font-medium text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                    >
                      {booking.phone_number}
                    </button>
                  </div>
                )}

                {booking.username && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Telegram:</span>
                    <button
                      onClick={handleCopyTag}
                      className="font-medium text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                    >
                      @{booking.username}
                    </button>
                  </div>
                )}
              </div>

              {copyPhoneSuccess && (
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-pulse text-center">
                  ✅ Телефон скопійовано!
                </div>
              )}
              {copyTagSuccess && (
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-pulse text-center">
                  ✅ Тег скопійовано!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Закрити
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                Скасувати
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
