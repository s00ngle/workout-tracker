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
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      userId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const exercises = await db.exercise.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('[EXERCISES_GET_ERROR]', error);
    return NextResponse.json(
      { message: '운동 기록을 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const { date, type, duration, intensity } = body;

    // Validation
    if (!date || !type || !duration || !intensity) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      );
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { message: '운동 시간은 0보다 커야 합니다' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(intensity)) {
      return NextResponse.json(
        { message: '강도는 low, medium, high 중 하나여야 합니다' },
        { status: 400 }
      );
    }

    const exercise = await db.exercise.create({
      data: {
        userId,
        date: new Date(date),
        type,
        duration,
        intensity,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('[EXERCISES_POST_ERROR]', error);
    return NextResponse.json(
      { message: '운동 기록을 생성할 수 없습니다' },
      { status: 500 }
    );
  }
}
