import { getSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { GoalForm } from '@/components/goal-form';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
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

async function getGoalData(userId: number) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch user's goal
  const goal = await db.goal.findUnique({
    where: { userId },
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

  // Fetch this month's exercises
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

  return {
    goal,
    weekExercises,
    monthExercises,
  };
}

function calculateStats(exercises: Exercise[]) {
  const uniqueDays = new Set(
    exercises.map((ex) => {
      const date = typeof ex.date === 'string' ? parseISO(ex.date) : ex.date;
      return format(date, 'yyyy-MM-dd');
    })
  ).size;

  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0);

  return {
    uniqueDays,
    totalMinutes,
  };
}

export default async function GoalSettingsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id);
  const { goal, weekExercises, monthExercises } = await getGoalData(userId);

  const weekStats = calculateStats(weekExercises);
  const monthStats = calculateStats(monthExercises);

  const defaultGoal = {
    weeklyTarget: 3,
    weeklyMinutes: 30,
    monthlyTarget: null,
    monthlyMinutes: null,
  };

  const currentGoal = goal || defaultGoal;

  const currentStats = {
    weeklyDays: weekStats.uniqueDays,
    weeklyMinutes: weekStats.totalMinutes,
    monthlyDays: monthStats.uniqueDays,
    monthlyMinutes: monthStats.totalMinutes,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">목표 설정</h1>
          <p className="text-gray-600 mt-1">운동 목표를 설정하고 진행 상황을 추적하세요.</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goal Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
          <GoalForm
            initialValues={currentGoal}
            currentStats={currentStats}
          />
        </div>

        {/* Goal Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">목표 요약</h2>

          {/* Weekly Goal */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">주간 목표</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">목표 운동일</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentGoal.weeklyTarget}일
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">목표 운동 시간</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentGoal.weeklyMinutes}분
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-600 font-medium mb-2">이번 주 진행도</p>
                <p className="text-sm text-gray-700">
                  운동일: <span className="font-bold">{weekStats.uniqueDays}/{currentGoal.weeklyTarget}일</span>
                </p>
                <p className="text-sm text-gray-700">
                  운동 시간: <span className="font-bold">{weekStats.totalMinutes}/{currentGoal.weeklyMinutes}분</span>
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Goal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">월간 목표</h3>
            {currentGoal.monthlyTarget ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">목표 운동일</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentGoal.monthlyTarget}일
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">목표 운동 시간</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentGoal.monthlyMinutes}분
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-purple-600 font-medium mb-2">이번 달 진행도</p>
                  <p className="text-sm text-gray-700">
                    운동일: <span className="font-bold">{monthStats.uniqueDays}/{currentGoal.monthlyTarget}일</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    운동 시간: <span className="font-bold">{monthStats.totalMinutes}/{currentGoal.monthlyMinutes}분</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">월간 목표가 설정되지 않았습니다</p>
                <p className="text-gray-500 text-xs mt-2">목표 설정 폼에서 월간 목표를 추가할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">목표 설정 팁</h3>
        <ul className="text-sm text-green-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">•</span>
            <span>현실적인 목표를 설정하세요. 작은 목표부터 시작하면 동기부여가 됩니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">•</span>
            <span>주간 목표는 최소 3일, 월간 목표는 선택사항입니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">•</span>
            <span>목표를 달성하면 대시보드에서 진행 상황을 확인할 수 있습니다.</span>
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
        >
          돌아가기
        </Link>
      </div>
    </div>
  );
}
