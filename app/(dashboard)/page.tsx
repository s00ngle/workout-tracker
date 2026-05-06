'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from '@/components/calendar';

interface Exercise {
  id: number;
  date: string;
  type: string;
  duration: number;
  intensity: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [thisWeekMinutes, setThisWeekMinutes] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [weeklyMinutesGoal, setWeeklyMinutesGoal] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const fetchData = async () => {
      try {
        const [exercisesRes, goalsRes] = await Promise.all([
          fetch('/api/exercises'),
          fetch('/api/goals'),
        ]);

        if (exercisesRes.ok) {
          const exData = await exercisesRes.json();
          setExercises(exData || []);

          // Calculate this week stats
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);

          const weekExercises = exData.filter((ex: Exercise) => {
            const exDate = new Date(ex.date);
            return exDate >= weekStart && exDate <= now;
          });

          // Count unique days with exercises (multiple exercises on same day = 1)
          const uniqueDays = new Set(
            weekExercises.map((ex: Exercise) => {
              const exDate = new Date(ex.date);
              return exDate.toDateString();
            })
          );

          setThisWeekCount(uniqueDays.size);
          setThisWeekMinutes(weekExercises.reduce((sum: number, ex: Exercise) => sum + ex.duration, 0));
        }

        if (goalsRes.ok) {
          const goalData = await goalsRes.json();
          if (goalData) {
            setWeeklyGoal(goalData.weeklyTarget || 3);
            setWeeklyMinutesGoal(goalData.weeklyMinutes || 30);
          }
        }
      } catch (err) {
        console.error('데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, router]);

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          대시보드
        </h1>
        <p className="text-base mt-3" style={{ color: 'var(--text-secondary)' }}>
          안녕하세요, {session.user?.name}님! 오늘의 운동 진행 상황을 확인하세요.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="rounded-2xl p-8 border transition-all hover:shadow-lg hover:-translate-y-1 duration-200"
          style={{
            backgroundColor: 'white',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            이번 주 운동
          </h2>
          <p className="text-5xl font-bold mt-4 tracking-tight" style={{ color: 'var(--primary)' }}>
            {thisWeekCount}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            목표: {weeklyGoal}회
          </p>
        </div>

        <div
          className="rounded-2xl p-8 border transition-all hover:shadow-lg hover:-translate-y-1 duration-200"
          style={{
            backgroundColor: 'white',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            이번 주 운동 시간
          </h2>
          <p className="text-5xl font-bold mt-4 tracking-tight" style={{ color: 'var(--success)' }}>
            {thisWeekMinutes}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            목표: {weeklyMinutesGoal}분
          </p>
        </div>

        <Link
          href="/exercises/new"
          className="rounded-2xl p-8 border transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 duration-200 flex flex-col items-center justify-center cursor-pointer"
          style={{
            backgroundColor: 'var(--primary)',
            borderColor: 'var(--primary)',
            color: 'white',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <span className="text-3xl mb-2">➕</span>
          <h2 className="text-sm font-semibold">운동 추가</h2>
          <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            새로운 운동 기록하기
          </p>
        </Link>
      </div>

      {/* Calendar */}
      <Calendar exercises={exercises} />
    </div>
  );
}
