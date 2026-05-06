import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  subWeeks,
  addWeeks,
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

    // Determine the week to fetch
    let referenceDate = new Date();
    if (startDateParam) {
      referenceDate = parseISO(startDateParam);
    }

    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Sunday

    // Fetch exercises for the week
    const exercises = await db.exercise.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
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

    const weeklyTarget = goal?.weeklyTarget || 3;
    const weeklyMinutes = goal?.weeklyMinutes || 150;

    // Build daily stats for the week (0-7 days)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dailyStats = daysInWeek.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayExercises = exercises.filter(
        (ex) => format(ex.date, 'yyyy-MM-dd') === dateStr
      );

      const count = dayExercises.length;
      const minutes = dayExercises.reduce((sum, ex) => sum + ex.duration, 0);

      return {
        date: dateStr,
        displayDate: format(day, 'd'),
        dayOfWeek: format(day, 'EEEE', { locale: require('date-fns/locale/ko') }),
        count,
        minutes,
      };
    });

    // Calculate weekly stats
    const totalExercises = exercises.length;
    const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const daysWithExercises = new Set(
      exercises.map((ex) => format(ex.date, 'yyyy-MM-dd'))
    ).size;

    const achievementPercentage = Math.round(
      (daysWithExercises / weeklyTarget) * 100
    );

    return NextResponse.json({
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      dailyStats,
      weeklyStats: {
        totalExercises,
        totalMinutes,
        daysWithExercises,
      },
      weeklyGoal: {
        target: weeklyTarget,
        targetMinutes: weeklyMinutes,
        completed: daysWithExercises,
        completedMinutes: totalMinutes,
      },
      achievementPercentage,
    });
  } catch (error) {
    console.error('[STATISTICS_WEEKLY_GET_ERROR]', error);
    return NextResponse.json(
      { message: '주간 통계를 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}
