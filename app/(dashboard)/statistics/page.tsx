import { getSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { StatisticsChart } from '@/components/statistics-chart';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface DailyStats {
  date: string;
  displayDate?: string;
  dayOfWeek?: string;
  count: number;
  minutes: number;
}

interface WeeklyResponse {
  weekStart: string;
  weekEnd: string;
  dailyStats: DailyStats[];
  weeklyStats: {
    totalExercises: number;
    totalMinutes: number;
    daysWithExercises: number;
  };
  weeklyGoal: {
    target: number;
    targetMinutes: number;
    completed: number;
    completedMinutes: number;
  };
  achievementPercentage: number;
}

interface MonthlyResponse {
  monthStart: string;
  monthEnd: string;
  dailyStats: DailyStats[];
  monthlyStats: {
    totalExercises: number;
    totalMinutes: number;
    daysWithExercises: number;
  };
  monthlyGoal: {
    target: number;
    targetMinutes: number;
    completed: number;
    completedMinutes: number;
  } | null;
  achievementPercentage: number;
}

async function getWeeklyStats(startDate?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/statistics/weekly?${params.toString()}`,
      {
        cache: 'no-store',
        headers: {
          Cookie: `next-auth.session-token=${process.env.SESSION_TOKEN || ''}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weekly stats');
    }

    return (await response.json()) as WeeklyResponse;
  } catch (error) {
    console.error('[WEEKLY_STATS_ERROR]', error);
    return null;
  }
}

async function getMonthlyStats(startDate?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/statistics/monthly?${params.toString()}`,
      {
        cache: 'no-store',
        headers: {
          Cookie: `next-auth.session-token=${process.env.SESSION_TOKEN || ''}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch monthly stats');
    }

    return (await response.json()) as MonthlyResponse;
  } catch (error) {
    console.error('[MONTHLY_STATS_ERROR]', error);
    return null;
  }
}

export default async function StatisticsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const weeklyData = await getWeeklyStats();
  const monthlyData = await getMonthlyStats();

  if (!weeklyData || !monthlyData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">통계</h1>
          <p className="text-gray-600 mt-1">운동 기록을 분석해보세요.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">통계 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const weekChartData = weeklyData.dailyStats.map((stat) => ({
    date: stat.date,
    displayDate: stat.displayDate,
    value: stat.count,
  }));

  const weekMinutesData = weeklyData.dailyStats.map((stat) => ({
    date: stat.date,
    displayDate: stat.displayDate,
    value: stat.minutes,
  }));

  const monthChartData = monthlyData.dailyStats.map((stat) => ({
    date: stat.date,
    displayDate: stat.displayDate,
    value: stat.count,
  }));

  const monthMinutesData = monthlyData.dailyStats.map((stat) => ({
    date: stat.date,
    displayDate: stat.displayDate,
    value: stat.minutes,
  }));

  const weekFormatted = `${format(new Date(weeklyData.weekStart), 'd', { locale: ko })}월 ${format(new Date(weeklyData.weekStart), 'd', { locale: ko })}일 - ${format(new Date(weeklyData.weekEnd), 'd', { locale: ko })}일`;

  const monthFormatted = format(new Date(monthlyData.monthStart), 'M월', {
    locale: ko,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">통계</h1>
          <p className="text-gray-600 mt-1">운동 기록을 분석해보세요.</p>
        </div>
        <Link
          href="/exercises/new"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          운동 추가
        </Link>
      </div>

      {/* Weekly Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">주간 통계</h2>
            <p className="text-gray-600 text-sm mt-1">{weekFormatted}</p>
          </div>
        </div>

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">총 운동</h3>
            <div className="text-3xl font-bold text-gray-800">
              {weeklyData.weeklyStats.totalExercises}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {weeklyData.weeklyStats.totalMinutes}분
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              운동 일수
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {weeklyData.weeklyGoal.completed}/{weeklyData.weeklyGoal.target}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {weeklyData.achievementPercentage}% 달성
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              목표 시간
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {weeklyData.weeklyGoal.completedMinutes}/
              {weeklyData.weeklyGoal.targetMinutes}분
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {weeklyData.weeklyGoal.targetMinutes > 0
                ? Math.round(
                    (weeklyData.weeklyGoal.completedMinutes /
                      weeklyData.weeklyGoal.targetMinutes) *
                      100
                  )
                : 0}
              % 달성
            </p>
          </div>
        </div>

        {/* Weekly Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatisticsChart
            title="주간 운동 횟수"
            data={weekChartData}
            type="bar"
            metric="횟수"
          />
          <StatisticsChart
            title="주간 운동 시간"
            data={weekMinutesData}
            type="line"
            metric="분"
            unit="분"
          />
        </div>

        {/* Weekly Goal Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            주간 목표 진행 상황
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">운동 일수</span>
                <span className="text-sm font-semibold text-blue-600">
                  {weeklyData.weeklyGoal.completed}/{weeklyData.weeklyGoal.target}일
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min((weeklyData.weeklyGoal.completed / weeklyData.weeklyGoal.target) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  운동 시간
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {weeklyData.weeklyGoal.completedMinutes}/
                  {weeklyData.weeklyGoal.targetMinutes}분
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min((weeklyData.weeklyGoal.completedMinutes / weeklyData.weeklyGoal.targetMinutes) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Section */}
      <div className="space-y-4 border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">월간 통계</h2>
            <p className="text-gray-600 text-sm mt-1">{monthFormatted}</p>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">총 운동</h3>
            <div className="text-3xl font-bold text-gray-800">
              {monthlyData.monthlyStats.totalExercises}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {monthlyData.monthlyStats.totalMinutes}분
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              운동 일수
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {monthlyData.monthlyStats.daysWithExercises}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {monthlyData.achievementPercentage > 0
                ? monthlyData.achievementPercentage
                : 0}
              % 달성
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              총 시간
            </h3>
            <div className="text-3xl font-bold text-gray-800">
              {monthlyData.monthlyStats.totalMinutes}분
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round(monthlyData.monthlyStats.totalMinutes / 60)}시간{' '}
              {monthlyData.monthlyStats.totalMinutes % 60}분
            </p>
          </div>
        </div>

        {/* Monthly Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatisticsChart
            title="월간 운동 횟수"
            data={monthChartData}
            type="bar"
            metric="횟수"
          />
          <StatisticsChart
            title="월간 운동 시간"
            data={monthMinutesData}
            type="line"
            metric="분"
            unit="분"
          />
        </div>

        {/* Monthly Goal Progress */}
        {monthlyData.monthlyGoal && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              월간 목표 진행 상황
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    운동 일수
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {monthlyData.monthlyGoal.completed}/
                    {monthlyData.monthlyGoal.target}일
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((monthlyData.monthlyGoal.completed / monthlyData.monthlyGoal.target) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    운동 시간
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {monthlyData.monthlyGoal.completedMinutes}/
                    {monthlyData.monthlyGoal.targetMinutes}분
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((monthlyData.monthlyGoal.completedMinutes / monthlyData.monthlyGoal.targetMinutes) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
