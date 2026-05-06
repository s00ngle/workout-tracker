import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword, validateNickname } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nickname, password, weeklyTarget, weeklyMinutes, monthlyTarget, monthlyMinutes } = body;

    // 1. 입력 검증
    if (!email || !nickname || !password) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      );
    }

    const emailError = validateEmail(email) ? null : '올바른 이메일 형식이 아닙니다';
    if (emailError) {
      return NextResponse.json({ message: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json({ message: nicknameError }, { status: 400 });
    }

    // 2. 중복 확인
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { message: '이미 사용 중인 이메일입니다' },
        { status: 409 }
      );
    }

    const existingNickname = await db.user.findUnique({ where: { nickname } });
    if (existingNickname) {
      return NextResponse.json(
        { message: '이미 사용 중인 닉네임입니다' },
        { status: 409 }
      );
    }

    // 3. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 사용자 생성 (트랜잭션)
    const user = await db.user.create({
      data: {
        email,
        nickname,
        password: hashedPassword,
      },
    });

    // 5. 목표 생성
    await db.goal.create({
      data: {
        userId: user.id,
        weeklyTarget: weeklyTarget || 3,
        weeklyMinutes: weeklyMinutes || 30,
        monthlyTarget: monthlyTarget || null,
        monthlyMinutes: monthlyMinutes || null,
      },
    });

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다',
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return NextResponse.json(
      { message: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
