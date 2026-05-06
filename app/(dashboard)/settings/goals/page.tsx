'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface Goal {
  weeklyTarget: number;
  weeklyMinutes: number;
  monthlyTarget?: number;
  monthlyMinutes?: number;
}

interface FormData {
  weeklyTarget: number;
  weeklyMinutes: number;
  monthlyTarget?: number | null;
  monthlyMinutes?: number | null;
}

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const { register, handleSubmit, watch, reset } = useForm<FormData>();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const fetchGoal = async () => {
      try {
        const res = await fetch('/api/goals');
        if (res.ok) {
          const goalData = await res.json();
          if (goalData) {
            setGoal(goalData);
            reset({
              weeklyTarget: goalData.weeklyTarget,
              weeklyMinutes: goalData.weeklyMinutes,
              monthlyTarget: goalData.monthlyTarget || null,
              monthlyMinutes: goalData.monthlyMinutes || null,
            });
          }
        }
      } catch (err) {
        console.error('목표 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [status, router, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setMessage(null);

    try {
      // 빈 필드를 null로 변환
      const submitData = {
        weeklyTarget: data.weeklyTarget,
        weeklyMinutes: data.weeklyMinutes,
        monthlyTarget: data.monthlyTarget || null,
        monthlyMinutes: data.monthlyMinutes || null,
      };

      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const responseData = await res.json();

      if (res.ok) {
        setGoal(responseData);
        setMessage({ type: 'success', text: '목표가 저장되었습니다' });
      } else {
        setMessage({ type: 'error', text: responseData.message || '목표 저장에 실패했습니다' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '목표 저장 중 오류가 발생했습니다' });
      console.error('목표 저장 실패:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
          운동 목표 설정
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          주간과 월간 목표를 설정해 운동 습관을 관리하세요
        </p>
      </div>

      {message && (
        <div
          className="max-w-3xl mx-auto px-6 py-4 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor:
              message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
            border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 주간 목표 섹션 */}
          <div
            className="rounded-2xl p-8 border"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  주간 목표
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  1주일 목표 설정
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  목표 횟수
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('weeklyTarget', { valueAsNumber: true, min: 1 })}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-lg"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--gray-50)'
                    }}
                    min="1"
                  />
                  <span className="absolute right-4 top-3 text-lg" style={{ color: 'var(--text-tertiary)' }}>회</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  목표 시간
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('weeklyMinutes', { valueAsNumber: true, min: 10 })}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-lg"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--gray-50)'
                    }}
                    min="10"
                  />
                  <span className="absolute right-4 top-3 text-lg" style={{ color: 'var(--text-tertiary)' }}>분</span>
                </div>
              </div>

              <div
                className="p-4 rounded-xl text-sm"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <p style={{ color: 'var(--primary)' }}>
                  💡 일주일에 3회, 각 30분 이상을 추천합니다
                </p>
              </div>
            </div>
          </div>

          {/* 월간 목표 섹션 */}
          <div
            className="rounded-2xl p-8 border"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  월간 목표
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  선택사항
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  목표 횟수
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('monthlyTarget', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-lg"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--gray-50)'
                    }}
                    min="1"
                    placeholder="입력 안 함"
                  />
                  <span className="absolute right-4 top-3 text-lg" style={{ color: 'var(--text-tertiary)' }}>회</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  목표 시간
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('monthlyMinutes', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-lg"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--gray-50)'
                    }}
                    min="10"
                    placeholder="입력 안 함"
                  />
                  <span className="absolute right-4 top-3 text-lg" style={{ color: 'var(--text-tertiary)' }}>분</span>
                </div>
              </div>

              <div
                className="p-4 rounded-xl text-sm"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}
              >
                <p style={{ color: 'var(--warning)' }}>
                  💡 더 큰 목표를 설정해 장기적인 성과를 추적하세요
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-8 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: 'var(--primary)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {submitting ? '저장 중...' : '목표 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
