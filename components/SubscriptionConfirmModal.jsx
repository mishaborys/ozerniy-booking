'use client';

export default function SubscriptionConfirmModal({ timeSlot, date, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              🔔 Підписка на повідомлення
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span style={{ color: '#666666' }}>Дата:</span>
              <span className="font-semibold" style={{ color: '#1a1a1a' }}>{date}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#666666' }}>Час:</span>
              <span className="font-semibold" style={{ color: '#1a1a1a' }}>{timeSlot}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-center" style={{ color: '#333333' }}>
              Ми надішлемо вам повідомлення в Telegram, якщо будь-яка альтанка буде скасована в цей часовий інтервал.
            </p>
          </div>

          <p className="text-center font-semibold mb-4" style={{ color: '#1a1a1a' }}>
            Бажаєте підписатись?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              style={{ color: '#333333' }}
            >
              Закрити
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Підписатись
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
