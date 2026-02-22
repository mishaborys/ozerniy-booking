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
    if (!confirm('Відписатись від повідомлень про цей слот?')) return;
    try {
      const response = await fetch(
        `/api/subscriptions?id=${subscriptionId}&userId=${userId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Помилка відписки');
      alert('✅ Успішно відписано');
      fetchSubscriptions();
    } catch (error) {
      alert('❌ ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🔔 Мої підписки</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              Завантаження...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
              У вас немає активних підписок
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-4"
                >
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Дата:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {format(new Date(sub.booking_date), 'd MMMM yyyy', { locale: uk })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Час:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {sub.time_slot}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.id)}
                    className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Відписатись
                  </button>
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
