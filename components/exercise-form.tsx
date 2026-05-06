'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

interface ExerciseFormProps {
  mode: 'add' | 'edit';
  exerciseId?: number;
  initialData?: {
    date: string;
    type: string;
    duration: number;
    intensity: string;
  };
}

interface FormData {
  date: string;
  type: string;
  duration: number;
  intensity: string;
}

export function ExerciseForm({
  mode,
  exerciseId,
  initialData,
}: ExerciseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultDate = initialData?.date || format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      date: defaultDate,
      type: initialData?.type || '',
      duration: initialData?.duration || 30,
      intensity: initialData?.intensity || 'medium',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url =
        mode === 'edit' ? `/api/exercises/${exerciseId}` : '/api/exercises';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date(data.date).toISOString(),
          type: data.type,
          duration: parseInt(data.duration.toString(), 10),
          intensity: data.intensity.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '요청 처리 중 오류가 발생했습니다');
      }

      setSuccess(
        mode === 'edit'
          ? '운동 기록이 수정되었습니다'
          : '운동 기록이 생성되었습니다'
      );

      // Redirect after success
      setTimeout(() => {
        router.push('/exercises');
        router.refresh();
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Date Input */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          운동 날짜 *
        </label>
        <input
          id="date"
          type="date"
          {...register('date', { required: '운동 날짜를 선택해주세요' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* Exercise Type Input */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          운동 종류 *
        </label>
        <input
          id="type"
          type="text"
          placeholder="예: 조깅, 요가, 헬스"
          {...register('type', {
            required: '운동 종류를 입력해주세요',
            minLength: {
              value: 1,
              message: '운동 종류를 입력해주세요',
            },
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Duration Input */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
          운동 시간 (분) *
        </label>
        <input
          id="duration"
          type="number"
          min="1"
          step="1"
          {...register('duration', {
            required: '운동 시간을 입력해주세요',
            min: {
              value: 1,
              message: '운동 시간은 1분 이상이어야 합니다',
            },
            valueAsNumber: true,
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
        )}
      </div>

      {/* Intensity Select */}
      <div>
        <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
          운동 강도 *
        </label>
        <select
          id="intensity"
          {...register('intensity', { required: '운동 강도를 선택해주세요' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <option value="low">낮음</option>
          <option value="medium">중간</option>
          <option value="high">높음</option>
        </select>
        {errors.intensity && (
          <p className="mt-1 text-sm text-red-600">{errors.intensity.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isLoading ? '처리 중...' : mode === 'edit' ? '수정하기' : '추가하기'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/exercises')}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
