'use client';

import { useState } from 'react';
import { format } from 'date-fns';

export default function BookingForm({
  gazeboId,
  gazeboName,
  timeSlot,
  date,
  userId,
  username,
  firstName,
  onSuccess,
  onCancel
}) {
  const [formData, setFormData] = useState({
    firstName: firstName || '',
    houseNumber: '',
    apartmentNumber: '',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gazeboId,
          userId,
          username,
          firstName: formData.firstName,
          houseNumber: formData.houseNumber,
          apartmentNumber: formData.apartmentNumber,
          phoneNumber: formData.phoneNumber,
          bookingDate: format(date, 'yyyy-MM-dd'),
          timeSlot,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Помилка при бронюванні');
      onSuccess(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Бронювання альтанки
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          {/* Booking info */}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Альтанка:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{gazeboName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Час:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{timeSlot}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Дата:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{format(date, 'dd.MM.yyyy')}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Ім'я <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Введіть ім'я"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Адреса будинку <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.houseNumber}
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Наприклад: Приозерний 6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Номер квартири <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.apartmentNumber}
                onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Наприклад: 42"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Номер телефону <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-shadow"
                placeholder="+380..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Бронювання...' : 'Забронювати'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
