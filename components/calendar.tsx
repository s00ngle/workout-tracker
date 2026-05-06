'use client';

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { useState } from 'react';
import { ko } from 'date-fns/locale';

interface Exercise {
  id: number;
  date: string | Date;
  type: string;
  duration: number;
  intensity: string;
}

interface CalendarProps {
  exercises: Exercise[];
  onDayClick?: (date: Date) => void;
}

export function Calendar({ exercises, onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Create a set of dates with exercises for faster lookup
  const exerciseDates = new Set(
    exercises.map((ex) => {
      const date = typeof ex.date === 'string' ? parseISO(ex.date) : ex.date;
      return format(date, 'yyyy-MM-dd');
    })
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const hasExercise = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return exerciseDates.has(dateStr);
  };

  const getExercisesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return exercises.filter((ex) => {
      const exDate = typeof ex.date === 'string' ? parseISO(ex.date) : ex.date;
      return format(exDate, 'yyyy-MM-dd') === dateStr;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date: Date) => {
    onDayClick?.(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {format(currentDate, 'yyyy년 MMMM', { locale: ko })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 md:gap-2 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 text-xs md:text-sm h-10 md:h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const hasExerciseToday = hasExercise(day);
          const dayExercises = getExercisesForDay(day);

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-16 md:min-h-20 p-2 md:p-2 rounded-lg border-2 cursor-pointer transition-all flex flex-col
                ${!isCurrentMonth ? 'bg-gray-50 border-gray-100' : 'border-gray-200'}
                ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                ${hasExerciseToday ? 'bg-green-50 border-green-300 hover:bg-green-100' : 'bg-white hover:bg-gray-50'}
              `}
            >
              <div
                className={`text-base md:text-sm font-semibold ${
                  isCurrentMonth ? (
                    day.getDay() === 0 ? 'text-red-600' :
                    day.getDay() === 6 ? 'text-blue-600' :
                    isToday ? 'text-blue-600' :
                    'text-gray-800'
                  ) : (
                    day.getDay() === 0 ? 'text-red-300' :
                    day.getDay() === 6 ? 'text-blue-300' :
                    'text-gray-400'
                  )
                }`}
              >
                {format(day, 'd')}
              </div>

              {/* Exercise indicator */}
              {hasExerciseToday && dayExercises.length > 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-1 text-green-700 font-medium text-xs md:text-xs">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    {dayExercises.reduce((sum, ex) => sum + ex.duration, 0)}<span className="hidden md:inline">분</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span>운동함</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
          <span>운동 안함</span>
        </div>
      </div>
    </div>
  );
}
