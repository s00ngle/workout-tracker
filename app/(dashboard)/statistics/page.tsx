'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  ResponsiveContainer,
} from 'recharts';

interface DailyStats {
  date: string;
  count: number;
  minutes: number;
}

interface StatisticsData {
  weeklyStats: DailyStats[];
  monthlyStats: DailyStats[];
  weeklyGoal: number;
  weeklyMinutesGoal: number;
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const fetchData = async () => {
      try {
        const [weeklyRes, monthlyRes, goalsRes] = await Promise.all([
          fetch('/api/statistics/weekly'),
          fetch('/api/statistics/monthly'),
          fetch('/api/goals'),
        ]);

        let weeklyStats = [];
        let monthlyStats = [];
        let weeklyGoal = 3;
        let weeklyMinutesGoal = 30;

        if (weeklyRes.ok) {
          const weekData = await weeklyRes.json();
          weeklyStats = weekData.dailyStats || [];
          weeklyGoal = weekData.weeklyGoal?.target || 3;
          weeklyMinutesGoal = weekData.weeklyGoal?.targetMinutes || 30;
        }

        if (monthlyRes.ok) {
          const monthData = await monthlyRes.json();
          monthlyStats = monthData.dailyStats || [];
        }

        if (goalsRes.ok) {
          const goalData = await goalsRes.json();
          if (goalData) {
            weeklyGoal = goalData.weeklyTarget || weeklyGoal;
            weeklyMinutesGoal = goalData.weeklyMinutes || weeklyMinutesGoal;
          }
        }

        setData({
          weeklyStats,
          monthlyStats,
          weeklyGoal,
          weeklyMinutesGoal,
        });
      } catch (err) {
        console.error('통계 조회 실패:', err);
        setData({
          weeklyStats: [],
          monthlyStats: [],
          weeklyGoal: 3,
          weeklyMinutesGoal: 30,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, router]);

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session || !data) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          통계
        </h1>
        <p className="text-base mt-3" style={{ color: 'var(--text-secondary)' }}>
          운동 기록 통계를 확인하세요
        </p>
      </div>

      <div
        className="rounded-2xl p-8 border"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight" style={{ color: 'var(--foreground)' }}>
          주간 통계
        </h2>
        {data.weeklyStats.length > 0 ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>주간 목표:</span> {data.weeklyGoal}회 / {data.weeklyMinutesGoal}분
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  stroke="#6b7280"
                />
                <YAxis stroke="#10b981" label={{ value: '운동 시간 (분)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'minutes') return [value, '운동 시간(분)'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('ko-KR')}
                />
                <Bar dataKey="minutes" fill="#10b981" name="운동 시간(분)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              주간 운동 데이터가 없습니다
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
              운동을 추가하면 통계가 표시됩니다
            </p>
            <a
              href="/exercises/new"
              className="inline-block px-6 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white'
              }}
            >
              첫 운동 추가하기
            </a>
          </div>
        )}
      </div>

      <div
        className="rounded-2xl p-8 border"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight" style={{ color: 'var(--foreground)' }}>
          월간 통계
        </h2>
        {data.monthlyStats.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const day = new Date(date).getDate();
                    // 1일, 11일, 21일만 표시
                    if (day === 1 || day === 11 || day === 21) {
                      return day + '일';
                    }
                    return '';
                  }}
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#f59e0b" label={{ value: '운동 시간 (분)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'minutes') return [value, '운동 시간(분)'];
                    if (name === 'count') return [value, '운동 횟수'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${new Date(label).getDate()}일`}
                />
                <Bar dataKey="minutes" fill="#f59e0b" name="운동 시간(분)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div
                className="rounded-2xl p-6 border text-center"
                style={{
                  backgroundColor: 'var(--gray-50)',
                  borderColor: 'var(--border)'
                }}
              >
                <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  총 운동 횟수
                </p>
                <p className="text-4xl font-bold mt-3 tracking-tight" style={{ color: 'var(--warning)' }}>
                  {data.monthlyStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>회</p>
              </div>
              <div
                className="rounded-2xl p-6 border text-center"
                style={{
                  backgroundColor: 'var(--gray-50)',
                  borderColor: 'var(--border)'
                }}
              >
                <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  총 운동 시간
                </p>
                <p className="text-4xl font-bold mt-3 tracking-tight" style={{ color: 'var(--success)' }}>
                  {data.monthlyStats.reduce((sum, stat) => sum + stat.minutes, 0)}
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>분</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              월간 운동 데이터가 없습니다
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
              운동을 추가하면 통계가 표시됩니다
            </p>
            <a
              href="/exercises/new"
              className="inline-block px-6 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white'
              }}
            >
              첫 운동 추가하기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
