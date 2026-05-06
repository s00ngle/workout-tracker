import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateNickname } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nickname } = body;

    if (!nickname) {
      return NextResponse.json(
        { message: '닉네임을 입력해주세요' },
        { status: 400 }
      );
    }

    // 형식 검증
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json(
        { available: false, message: nicknameError },
        { status: 400 }
      );
    }

    // 중복 확인
    const existing = await db.user.findUnique({ where: { nickname } });

    return NextResponse.json({
      available: !existing,
    });
  } catch (error) {
    console.error('[CHECK_NICKNAME ERROR]', error);
    return NextResponse.json(
      { message: '요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
