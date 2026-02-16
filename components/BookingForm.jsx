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
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при бронюванні');
      }

      onSuccess(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>Бронювання альтанки</h2>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#666666' }}>Альтанка:</span>
              <span className="font-semibold" style={{ color: '#1a1a1a' }}>{gazeboName}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#666666' }}>Час:</span>
              <span className="font-semibold" style={{ color: '#1a1a1a' }}>{timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#666666' }}>Дата:</span>
              <span className="font-semibold" style={{ color: '#1a1a1a' }}>{format(date, 'dd.MM.yyyy')}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>
                Ім'я <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tg-button focus:border-transparent"
                style={{ color: '#1a1a1a' }}
                placeholder="Введіть ім'я"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>
                Адреса будинку <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.houseNumber}
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tg-button focus:border-transparent"
                style={{ color: '#1a1a1a' }}
                placeholder="Наприклад: Приозерний 6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>
                Номер квартири <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.apartmentNumber}
                onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tg-button focus:border-transparent"
                style={{ color: '#1a1a1a' }}
                placeholder="Наприклад: 42"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>
                Номер телефону <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tg-button focus:border-transparent"
                style={{ color: '#1a1a1a' }}
                placeholder="+380..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
                style={{ color: '#333333' }}
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-tg-button text-tg-button-text rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
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
