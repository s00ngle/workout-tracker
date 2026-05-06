import { getSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Calendar } from '@/components/calendar';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  isToday,
} from 'date-fns';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Exercise {
  id: number;
  date: Date | string;
  type: string;
  duration: number;
  intensity: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

async function getDashboardData(userId: number) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch all exercises for the month (for calendar)
  const monthExercises = await db.exercise.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Fetch this week's exercises
  const weekExercises = await db.exercise.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Fetch today's exercises
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayExercises = await db.exercise.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Get user's goal
  const goal = await db.goal.findUnique({
    where: { userId },
  });

  return {
    monthExercises,
    weekExercises,
    todayExercises,
    goal,
  };
}

function calculateStats(exercises: Exercise[]) {
  const totalExercises = exercises.length;
  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const uniqueDays = new Set(
    exercises.map((ex) => {
      const date = typeof ex.date === 'string' ? parseISO(ex.date) : ex.date;
      return format(date, 'yyyy-MM-dd');
    })
  ).size;

  return {
    totalExercises,
    totalMinutes,
    uniqueDays,
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id);
  const { monthExercises, weekExercises, todayExercises, goal } =
    await getDashboardData(userId);

  const weekStats = calculateStats(weekExercises);
  const monthStats = calculateStats(monthExercises);
  const todayStats = calculateStats(todayExercises);

  const weekGoal = goal?.weeklyTarget || 3;
  const weekGoalMinutes = goal?.weeklyMinutes || 150;
  const monthGoal = goal?.monthlyTarget || 12;
  const monthGoalMinutes = goal?.monthlyMinutes || 600;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">대시보드</h1>
          <p className="text-gray-600 mt-1">반갑습니다! 오늘 운동을 시작해보세요.</p>
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
          빠른 추가
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Status */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">오늘의 운동</h3>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {todayStats.totalExercises}
          </div>
          <p className="text-sm text-gray-600">
            {todayStats.totalMinutes > 0
              ? `${todayStats.totalMinutes}분 운동함`
              : '아직 운동하지 않음'}
          </p>
          {todayStats.totalExercises === 0 && (
            <Link
              href="/exercises/new"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium mt-3 inline-block"
            >
              지금 추가하기 →
            </Link>
          )}
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">이번 주</h3>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {weekStats.uniqueDays}/{weekGoal}
          </div>
          <div className="text-xs text-gray-600">
            {weekStats.totalMinutes}/{weekGoalMinutes}분
          </div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((weekStats.uniqueDays / weekGoal) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">이번 달</h3>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {monthStats.uniqueDays}/{monthGoal || '목표 미설정'}
          </div>
          <div className="text-xs text-gray-600">
            {monthStats.totalMinutes}/{monthGoalMinutes || '목표 미설정'}분
          </div>
          {monthGoal && (
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((monthStats.uniqueDays / monthGoal) * 100, 100)}%`,
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Goal Status */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">이번 달 목표</h3>
          <div className="text-lg font-bold text-gray-800 mb-1">
            {goal ? `${goal.weeklyTarget}회/주` : '미설정'}
          </div>
          <div className="text-xs text-gray-600">
            {goal ? `${goal.weeklyMinutes}분/주` : '목표를 설정하세요'}
          </div>
          <Link
            href="/goals"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium mt-3 inline-block"
          >
            목표 설정 →
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            exercises={monthExercises.map((ex) => ({
              ...ex,
              date: ex.date instanceof Date ? ex.date.toISOString() : String(ex.date),
            }))}
          />
        </div>

        {/* Recent Exercises */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">최근 운동</h2>

          {weekExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">최근 운동이 없습니다</p>
              <Link
                href="/exercises/new"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                운동 기록하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {weekExercises.map((exercise) => {
                const date = parseISO(exercise.date instanceof Date ? exercise.date.toISOString() : String(exercise.date));
                return (
                  <div
                    key={exercise.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium text-gray-800">{exercise.type}</div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {exercise.intensity === 'high'
                          ? '고강도'
                          : exercise.intensity === 'medium'
                            ? '중강도'
                            : '저강도'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {exercise.duration}분
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(date, 'M월 d일 (EEEE)', {
                        locale: require('date-fns/locale/ko'),
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
