'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface GoalFormProps {
  onSuccess?: () => void;
  initialValues?: {
    weeklyTarget: number;
    weeklyMinutes: number;
    monthlyTarget: number | null;
    monthlyMinutes: number | null;
  };
  currentStats?: {
    weeklyDays: number;
    weeklyMinutes: number;
    monthlyDays: number;
    monthlyMinutes: number;
  };
}

interface FormData {
  weeklyTarget: number;
  weeklyMinutes: number;
  monthlyTarget: number | null;
  monthlyMinutes: number | null;
}

export function GoalForm({
  onSuccess,
  initialValues,
  currentStats,
}: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      weeklyTarget: initialValues?.weeklyTarget || 3,
      weeklyMinutes: initialValues?.weeklyMinutes || 30,
      monthlyTarget: initialValues?.monthlyTarget || null,
      monthlyMinutes: initialValues?.monthlyMinutes || null,
    },
  });

  const monthlyTargetValue = watch('monthlyTarget');
  const monthlyMinutesValue = watch('monthlyMinutes');
  const weeklyTargetValue = watch('weeklyTarget');
  const weeklyMinutesValue = watch('weeklyMinutes');

  useEffect(() => {
    if (initialValues) {
      reset({
        weeklyTarget: initialValues.weeklyTarget,
        weeklyMinutes: initialValues.weeklyMinutes,
        monthlyTarget: initialValues.monthlyTarget,
        monthlyMinutes: initialValues.monthlyMinutes,
      });
    }
  }, [initialValues, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weeklyTarget: parseInt(data.weeklyTarget.toString(), 10),
          weeklyMinutes: parseInt(data.weeklyMinutes.toString(), 10),
          monthlyTarget: data.monthlyTarget ? parseInt(data.monthlyTarget.toString(), 10) : null,
          monthlyMinutes: data.monthlyMinutes ? parseInt(data.monthlyMinutes.toString(), 10) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '요청 처리 중 오류가 발생했습니다');
      }

      setSuccess('목표가 성공적으로 저장되었습니다!');

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
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

      {/* Current Stats */}
      {currentStats && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">현재 진행 상황</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">이번 주: <span className="font-bold">{currentStats.weeklyDays}일/{weeklyTargetValue}일</span></p>
              <p className="text-blue-700">{currentStats.weeklyMinutes}분/{weeklyMinutesValue}분</p>
            </div>
            {monthlyTargetValue && (
              <div>
                <p className="text-blue-700">이번 달: <span className="font-bold">{currentStats.monthlyDays}일/{monthlyTargetValue}일</span></p>
                <p className="text-blue-700">{currentStats.monthlyMinutes}분/{monthlyMinutesValue || 0}분</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Target Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">주간 목표</h3>

        {/* Weekly Target Days */}
        <div className="mb-4">
          <label htmlFor="weeklyTarget" className="block text-sm font-medium text-gray-700 mb-2">
            주간 목표 운동 횟수 (일) *
          </label>
          <div className="flex items-center gap-2">
            <input
              id="weeklyTarget"
              type="number"
              min="1"
              max="7"
              step="1"
              {...register('weeklyTarget', {
                required: '주간 목표 횟수를 입력해주세요',
                min: {
                  value: 1,
                  message: '최소 1일 이상이어야 합니다',
                },
                max: {
                  value: 7,
                  message: '최대 7일까지 설정할 수 있습니다',
                },
                valueAsNumber: true,
              })}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            <span className="text-gray-600">일</span>
          </div>
          {errors.weeklyTarget && (
            <p className="mt-1 text-sm text-red-600">{errors.weeklyTarget.message}</p>
          )}
        </div>

        {/* Weekly Target Minutes */}
        <div>
          <label htmlFor="weeklyMinutes" className="block text-sm font-medium text-gray-700 mb-2">
            주간 목표 운동 시간 (분) *
          </label>
          <div className="flex items-center gap-2">
            <input
              id="weeklyMinutes"
              type="number"
              min="10"
              step="10"
              {...register('weeklyMinutes', {
                required: '주간 목표 시간을 입력해주세요',
                min: {
                  value: 10,
                  message: '최소 10분 이상이어야 합니다',
                },
                valueAsNumber: true,
              })}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            <span className="text-gray-600">분</span>
          </div>
          {errors.weeklyMinutes && (
            <p className="mt-1 text-sm text-red-600">{errors.weeklyMinutes.message}</p>
          )}
        </div>
      </div>

      {/* Monthly Target Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">월간 목표 (선택사항)</h3>
        <p className="text-sm text-gray-600 mb-4">월간 목표를 설정하려면 아래 필드를 입력하세요.</p>

        {/* Monthly Target Days */}
        <div className="mb-4">
          <label htmlFor="monthlyTarget" className="block text-sm font-medium text-gray-700 mb-2">
            월간 목표 운동 횟수 (일)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="monthlyTarget"
              type="number"
              min="1"
              step="1"
              {...register('monthlyTarget', {
                min: {
                  value: 1,
                  message: '최소 1일 이상이어야 합니다',
                },
                valueAsNumber: true,
              })}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="예: 16"
              disabled={isLoading}
            />
            <span className="text-gray-600">일</span>
          </div>
          {errors.monthlyTarget && (
            <p className="mt-1 text-sm text-red-600">{errors.monthlyTarget.message}</p>
          )}
        </div>

        {/* Monthly Target Minutes */}
        <div>
          <label htmlFor="monthlyMinutes" className="block text-sm font-medium text-gray-700 mb-2">
            월간 목표 운동 시간 (분)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="monthlyMinutes"
              type="number"
              min="10"
              step="10"
              {...register('monthlyMinutes', {
                min: {
                  value: 10,
                  message: '최소 10분 이상이어야 합니다',
                },
                valueAsNumber: true,
              })}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="예: 600"
              disabled={isLoading}
            />
            <span className="text-gray-600">분</span>
          </div>
          {errors.monthlyMinutes && (
            <p className="mt-1 text-sm text-red-600">{errors.monthlyMinutes.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isLoading ? '저장 중...' : '목표 저장'}
        </button>
      </div>
    </form>
  );
}
