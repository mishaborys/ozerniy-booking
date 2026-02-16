'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function DatePicker({ selectedDate, onDateSelect, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Отримуємо день тижня для першого дня місяця (0 = неділя)
  const firstDayOfWeek = monthStart.getDay();
  // Конвертуємо в формат, де понеділок = 0
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date) => {
    if (!isBefore(date, startOfToday())) {
      onDateSelect(date);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" style={{ backgroundColor: '#ffffff' }}>
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900" style={{ color: '#000000' }}>Виберіть дату</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Навігація по місяцях */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              style={{ color: '#000000' }}
            >
              ←
            </button>
            <div className="text-lg font-semibold" style={{ color: '#000000' }}>
              {format(currentMonth, 'LLLL yyyy', { locale: uk })}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              style={{ color: '#000000' }}
            >
              →
            </button>
          </div>

          {/* Дні тижня */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
                style={{ color: '#666666' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Дні місяця */}
          <div className="grid grid-cols-7 gap-1">
            {/* Пусті клітинки перед першим днем */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Дні місяця */}
            {daysInMonth.map((day) => {
              const isPast = isBefore(day, startOfToday());
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  disabled={isPast}
                  style={{
                    color: isPast ? '#cccccc' : isSelected ? '#ffffff' : '#000000'
                  }}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium
                    ${isPast 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-blue-100 cursor-pointer'
                    }
                    ${isSelected 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : ''
                    }
                    ${isTodayDate && !isSelected 
                      ? 'border-2 border-blue-500 text-blue-600' 
                      : ''
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Легенда */}
          <div className="mt-4 flex gap-4 text-xs text-gray-600" style={{ color: '#666666' }}>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
              <span>Сьогодні</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Вибрано</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
