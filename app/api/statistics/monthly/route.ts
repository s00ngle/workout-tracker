import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
} from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');

    // Determine the month to fetch
    let referenceDate = new Date();
    if (startDateParam) {
      referenceDate = parseISO(startDateParam);
    }

    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);

    // Fetch exercises for the month
    const exercises = await db.exercise.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get user's goal
    const goal = await db.goal.findUnique({
      where: { userId },
    });

    const monthlyTarget = goal?.monthlyTarget;
    const monthlyMinutes = goal?.monthlyMinutes;

    // Build daily stats for the month (1-31 days)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dailyStats = daysInMonth.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayExercises = exercises.filter(
        (ex) => format(ex.date, 'yyyy-MM-dd') === dateStr
      );

      const count = dayExercises.length > 0 ? 1 : 0;
      const minutes = dayExercises.reduce((sum, ex) => sum + ex.duration, 0);

      return {
        date: dateStr,
        displayDate: format(day, 'd'),
        count,
        minutes,
      };
    });

    // Calculate monthly stats
    const totalExercises = exercises.length;
    const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const daysWithExercises = new Set(
      exercises.map((ex) => format(ex.date, 'yyyy-MM-dd'))
    ).size;

    let achievementPercentage = 0;
    if (monthlyTarget) {
      achievementPercentage = Math.round(
        (daysWithExercises / monthlyTarget) * 100
      );
    }

    return NextResponse.json({
      monthStart: format(monthStart, 'yyyy-MM-dd'),
      monthEnd: format(monthEnd, 'yyyy-MM-dd'),
      dailyStats,
      monthlyStats: {
        totalExercises,
        totalMinutes,
        daysWithExercises,
      },
      monthlyGoal: monthlyTarget
        ? {
            target: monthlyTarget,
            targetMinutes: monthlyMinutes || 0,
            completed: daysWithExercises,
            completedMinutes: totalMinutes,
          }
        : null,
      achievementPercentage,
    });
  } catch (error) {
    console.error('[STATISTICS_MONTHLY_GET_ERROR]', error);
    return NextResponse.json(
      { message: '월간 통계를 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}
