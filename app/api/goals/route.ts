import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

    let goal = await db.goal.findUnique({
      where: { userId },
    });

    // If no goal exists, return default values
    if (!goal) {
      return NextResponse.json({
        weeklyTarget: 3,
        weeklyMinutes: 30,
        monthlyTarget: null,
        monthlyMinutes: null,
      });
    }

    return NextResponse.json({
      weeklyTarget: goal.weeklyTarget,
      weeklyMinutes: goal.weeklyMinutes,
      monthlyTarget: goal.monthlyTarget,
      monthlyMinutes: goal.monthlyMinutes,
    });
  } catch (error) {
    console.error('[GOALS_GET_ERROR]', error);
    return NextResponse.json(
      { message: '목표를 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const body = await req.json();
    const { weeklyTarget, weeklyMinutes, monthlyTarget, monthlyMinutes } = body;

    // Validation
    if (weeklyTarget === undefined || weeklyMinutes === undefined) {
      return NextResponse.json(
        { message: '주간 목표는 필수입니다' },
        { status: 400 }
      );
    }

    // Validate weekly target
    if (typeof weeklyTarget !== 'number' || weeklyTarget < 1 || weeklyTarget > 7) {
      return NextResponse.json(
        { message: '주간 목표는 1~7 사이의 숫자여야 합니다' },
        { status: 400 }
      );
    }

    // Validate weekly minutes
    if (typeof weeklyMinutes !== 'number' || weeklyMinutes < 10) {
      return NextResponse.json(
        { message: '주간 목표 시간은 10분 이상이어야 합니다' },
        { status: 400 }
      );
    }

    // Validate monthly target if provided
    if (monthlyTarget !== undefined && monthlyTarget !== null) {
      if (typeof monthlyTarget !== 'number' || monthlyTarget < 1) {
        return NextResponse.json(
          { message: '월간 목표는 1 이상의 숫자여야 합니다' },
          { status: 400 }
        );
      }
    }

    // Validate monthly minutes if provided
    if (monthlyMinutes !== undefined && monthlyMinutes !== null) {
      if (typeof monthlyMinutes !== 'number' || monthlyMinutes < 10) {
        return NextResponse.json(
          { message: '월간 목표 시간은 10분 이상이어야 합니다' },
          { status: 400 }
        );
      }
    }

    // Check if goal exists
    const existingGoal = await db.goal.findUnique({
      where: { userId },
    });

    let goal;
    if (existingGoal) {
      // Update existing goal
      goal = await db.goal.update({
        where: { userId },
        data: {
          weeklyTarget,
          weeklyMinutes,
          monthlyTarget: monthlyTarget || null,
          monthlyMinutes: monthlyMinutes || null,
        },
      });
    } else {
      // Create new goal
      goal = await db.goal.create({
        data: {
          userId,
          weeklyTarget,
          weeklyMinutes,
          monthlyTarget: monthlyTarget || null,
          monthlyMinutes: monthlyMinutes || null,
        },
      });
    }

    return NextResponse.json(
      {
        weeklyTarget: goal.weeklyTarget,
        weeklyMinutes: goal.weeklyMinutes,
        monthlyTarget: goal.monthlyTarget,
        monthlyMinutes: goal.monthlyMinutes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GOALS_PUT_ERROR]', error);
    return NextResponse.json(
      { message: '목표를 저장할 수 없습니다' },
      { status: 500 }
    );
  }
}
