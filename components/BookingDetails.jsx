'use client';

export default function BookingDetails({ booking, onClose, currentUserId }) {
  const isOwner = booking.user_id === currentUserId;

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
            <h2 className="text-2xl font-bold text-gray-900">
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
                <span className="text-gray-600">Альтанка:</span>
                <span className="font-semibold">{booking.gazebo_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Час:</span>
                <span className="font-semibold">{booking.time_slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Дата:</span>
                <span className="font-semibold">
                  {new Date(booking.booking_date).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Контактна інформація:</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ім'я:</span>
                  <span className="font-medium">{booking.first_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Будинок:</span>
                  <span className="font-medium">{booking.house_number}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Квартира:</span>
                  <span className="font-medium">{booking.apartment_number}</span>
                </div>

                {booking.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Телефон:</span>
                    <a 
                      href={`tel:${booking.phone_number}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {booking.phone_number}
                    </a>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Telegram:</span>
                  <a 
                    href={booking.username ? `https://t.me/${booking.username}` : `tg://user?id=${booking.user_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {booking.username ? `@${booking.username}` : 'Відкрити в Telegram'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
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
