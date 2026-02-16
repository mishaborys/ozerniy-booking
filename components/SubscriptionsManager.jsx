'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function SubscriptionsManager({ userId, onClose }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`);
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId) => {
    if (!confirm('Відписатись від повідомлень про цей слот?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/subscriptions?id=${subscriptionId}&userId=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Помилка відписки');
      }

      alert('✅ Успішно відписано');
      fetchSubscriptions();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              🔔 Мої підписки
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Завантаження...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              У вас немає активних підписок
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: '#666666' }}>Дата:</span>
                      <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
                        {format(new Date(sub.booking_date), 'd MMMM yyyy', { locale: uk })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: '#666666' }}>Час:</span>
                      <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
                        {sub.time_slot}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.id)}
                    className="mt-3 w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    Відписатись
                  </button>
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
