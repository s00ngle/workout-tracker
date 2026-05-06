import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const { id } = await params;
    const exerciseId = parseInt(id, 10);

    // Check if exercise exists and belongs to user
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json(
        { message: '운동 기록을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (exercise.userId !== userId) {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      );
    }

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

    const updatedExercise = await db.exercise.update({
      where: { id: exerciseId },
      data: {
        date: new Date(date),
        type,
        duration,
        intensity,
      },
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('[EXERCISES_PUT_ERROR]', error);
    return NextResponse.json(
      { message: '운동 기록을 수정할 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const { id } = await params;
    const exerciseId = parseInt(id, 10);

    // Check if exercise exists and belongs to user
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json(
        { message: '운동 기록을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (exercise.userId !== userId) {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      );
    }

    await db.exercise.delete({
      where: { id: exerciseId },
    });

    return NextResponse.json(
      { message: '운동 기록이 삭제되었습니다' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[EXERCISES_DELETE_ERROR]', error);
    return NextResponse.json(
      { message: '운동 기록을 삭제할 수 없습니다' },
      { status: 500 }
    );
  }
}
