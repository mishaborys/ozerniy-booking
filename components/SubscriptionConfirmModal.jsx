'use client';

export default function SubscriptionConfirmModal({ timeSlot, date, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              🔔 Підписка на повідомлення
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-4 mb-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Дата:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Час:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{timeSlot}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            Ми надішлемо вам повідомлення в Telegram, якщо будь-яка альтанка буде скасована в цей часовий інтервал.
          </p>

          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center mb-5">
            Бажаєте підписатись?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Закрити
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors"
            >
              Підписатись
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
