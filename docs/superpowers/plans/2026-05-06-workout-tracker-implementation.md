# 운동 체크 사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + SQLite 기반 운동 체크 사이트 구현 (회원가입, 기록, 통계)

**Architecture:** 
- Frontend: Next.js App Router (Server Components + Client Components)
- Backend: Next.js API Routes + Prisma ORM
- Database: SQLite (로컬 파일)
- Auth: NextAuth.js (세션 기반)
- 상태 관리: Zustand (클라이언트), Server Components (서버)

**Tech Stack:** Next.js, TypeScript, Prisma, SQLite, NextAuth.js, TailwindCSS, React Hook Form, Zustand

---

## 📁 파일 구조

```
project-root/
├── app/
│   ├── (auth)/
│   │   ├── register/page.tsx          # 회원가입 페이지
│   │   └── login/page.tsx             # 로그인 페이지
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # 대시보드 레이아웃
│   │   ├── page.tsx                   # 대시보드 (메인)
│   │   ├── exercises/
│   │   │   ├── page.tsx               # 운동 기록 목록
│   │   │   ├── new/page.tsx           # 운동 추가
│   │   │   └── [id]/edit/page.tsx     # 운동 수정
│   │   ├── statistics/page.tsx        # 통계 페이지
│   │   └── settings/goals/page.tsx    # 목표 설정 페이지
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts      # 회원가입 API
│   │   │   ├── check-nickname/route.ts # 닉네임 중복확인 API
│   │   │   └── [...nextauth]/route.ts # NextAuth.js 핸들러
│   │   ├── exercises/
│   │   │   ├── route.ts               # GET/POST exercises
│   │   │   └── [id]/route.ts          # PUT/DELETE exercise
│   │   ├── goals/route.ts             # GET/PUT goals
│   │   ├── statistics/
│   │   │   ├── weekly/route.ts        # 주간 통계
│   │   │   └── monthly/route.ts       # 월간 통계
│   │   └── health/route.ts            # 헬스체크 (optional)
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # 임시 홈페이지 (인증 상태에 따라 리다이렉트)
│   └── globals.css                    # 전역 스타일
├── lib/
│   ├── auth.ts                        # NextAuth.js 설정
│   ├── db.ts                          # Prisma 클라이언트
│   ├── store.ts                       # Zustand 스토어
│   ├── api-client.ts                  # fetch 래퍼
│   ├── validations.ts                 # 입력 검증 함수
│   └── utils.ts                       # 유틸리티 함수
├── components/
│   ├── navbar.tsx                     # 네비게이션 바
│   ├── calendar.tsx                   # 캘린더 컴포넌트
│   ├── exercise-form.tsx              # 운동 폼 (추가/수정)
│   ├── statistics-chart.tsx           # 통계 차트
│   ├── goal-form.tsx                  # 목표 설정 폼
│   └── loading.tsx                    # 로딩 스켈레톤
├── prisma/
│   └── schema.prisma                  # DB 스키마
├── tests/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── exercises.test.ts
│   │   └── goals.test.ts
│   └── lib/
│       └── validations.test.ts
├── .env.local                         # 환경 변수 (로컬)
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 📋 Task 분해

### Task 1: 프로젝트 초기화 및 의존성 설치

**Files:**
- Create: `package.json`
- Create: `.env.local`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.js`

- [ ] **Step 1: Next.js 프로젝트 초기화**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --no-git
# 선택사항: Yes to all
```

- [ ] **Step 2: 필요한 패키지 설치**

```bash
npm install \
  @prisma/client \
  prisma \
  next-auth \
  bcryptjs \
  zustand \
  react-hook-form \
  zod \
  @hookform/resolvers \
  recharts \
  date-fns
```

```bash
npm install -D @types/bcryptjs @types/node
```

- [ ] **Step 3: TypeScript 설정 업데이트**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 환경 변수 설정**

`.env.local`:
```
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long-1234567890ab

# Database (SQLite 자동 생성)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_PROVIDERS_CREDENTIALS=true
```

(프로덕션 배포 시 `NEXTAUTH_SECRET` 변경 필요)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js project with dependencies"
```

---

### Task 2: Prisma 스키마 작성 및 DB 초기화

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Modify: `.env.local`

- [ ] **Step 1: Prisma 초기화**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Prisma 스키마 작성**

`prisma/schema.prisma`:
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  nickname  String    @unique
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  exercises Exercise[]
  goal      Goal?
}

model Goal {
  id              Int       @id @default(autoincrement())
  userId          Int       @unique
  weeklyTarget    Int       @default(3)
  weeklyMinutes   Int       @default(30)
  monthlyTarget   Int?
  monthlyMinutes  Int?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Exercise {
  id        Int       @id @default(autoincrement())
  userId    Int
  date      DateTime
  type      String
  duration  Int
  intensity String    @default("medium")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}
```

- [ ] **Step 3: DB 마이그레이션**

```bash
npx prisma migrate dev --name init
# 이름 입력: "init"
```

예상 출력:
```
Your database has been created at ./prisma/dev.db

✔ Generated Prisma Client (in 123ms)
✔ Ran all pending migrations (1)

✔ Created a new migration file in prisma/migrations
```

- [ ] **Step 4: Prisma 클라이언트 래퍼 작성**

`lib/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

- [ ] **Step 5: Prisma Studio 확인**

```bash
npx prisma studio
# http://localhost:5555에서 DB 확인 가능
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ lib/db.ts .env.local
git commit -m "chore: setup Prisma with SQLite database"
```

---

### Task 3: NextAuth.js 설정

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `.env.local`

- [ ] **Step 1: NextAuth.js 설정 파일 작성**

`lib/auth.ts`:
```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('존재하지 않는 계정입니다');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('잘못된 비밀번호입니다');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nickname,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

- [ ] **Step 2: NextAuth.js 라우트 핸들러 작성**

`app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: .env.local 업데이트**

`.env.local` 업데이트:
```
# 기존 내용 유지
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generated-secret-key-min-32-characters-12345678901234
```

(로컬 테스트용. 프로덕션에서는 `openssl rand -base64 32` 사용)

- [ ] **Step 4: NextAuth 타입 정의 확인**

`types/next-auth.d.ts` 생성:
```typescript
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
```

- [ ] **Step 5: 테스트**

```bash
npm run dev
# http://localhost:3000/api/auth/signin 접근 가능 확인
```

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts app/api/auth/ types/
git commit -m "feat: setup NextAuth.js with credentials provider"
```

---

### Task 4: Zustand 스토어 설정

**Files:**
- Create: `lib/store.ts`

- [ ] **Step 1: Zustand 스토어 작성**

`lib/store.ts`:
```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface ExerciseStore {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (success: string | null) => void;
  clearMessages: () => void;
}

export const useStore = create<ExerciseStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  error: null,
  setError: (error) => set({ error }),

  success: null,
  setSuccess: (success) => set({ success }),

  clearMessages: () => set({ error: null, success: null }),
}));
```

- [ ] **Step 2: API 클라이언트 래퍼 작성**

`lib/api-client.ts`:
```typescript
import { useStore } from './store';

export const apiClient = {
  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const setError = useStore.getState().setError;
    const setIsLoading = useStore.getState().setIsLoading;

    setIsLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '요청이 실패했습니다');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : '오류가 발생했습니다';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  },

  get<T>(url: string) {
    return this.request<T>(url, { method: 'GET' });
  },

  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  },
};
```

- [ ] **Step 3: 입력 검증 함수 작성**

`lib/validations.ts`:
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다';
  }
  if (!/[A-Z]/.test(password)) {
    return '비밀번호에 대문자가 포함되어야 합니다';
  }
  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자가 포함되어야 합니다';
  }
  return null;
};

export const validateNickname = (nickname: string): string | null => {
  if (nickname.length < 2) {
    return '닉네임은 최소 2자 이상이어야 합니다';
  }
  if (nickname.length > 20) {
    return '닉네임은 최대 20자 이하여야 합니다';
  }
  if (!/^[a-zA-Z0-9_한-힣]+$/.test(nickname)) {
    return '닉네임은 영문, 숫자, _, 한글만 포함 가능합니다';
  }
  return null;
};
```

- [ ] **Step 4: Utility 함수 작성**

`lib/utils.ts`:
```typescript
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
};

export const getWeekRange = (date: Date = new Date()) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  const last = first + 6;

  const startOfWeek = new Date(curr.setDate(first));
  const endOfWeek = new Date(curr.setDate(last));

  return { startOfWeek, endOfWeek };
};

export const getMonthRange = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  return { startOfMonth, endOfMonth };
};
```

- [ ] **Step 5: Commit**

```bash
git add lib/store.ts lib/api-client.ts lib/validations.ts lib/utils.ts
git commit -m "feat: setup Zustand store and utilities"
```

---

### Task 5: 회원가입 API 구현

**Files:**
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/check-nickname/route.ts`
- Modify: `lib/auth.ts` (패스워드 해싱 추가)

- [ ] **Step 1: 회원가입 API 작성**

`app/api/auth/register/route.ts`:
```typescript
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
```

- [ ] **Step 2: 닉네임 중복확인 API 작성**

`app/api/auth/check-nickname/route.ts`:
```typescript
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
```

- [ ] **Step 3: 테스트**

```bash
npm run dev
```

회원가입 테스트 (curl 사용):
```bash
# 회원가입
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "nickname": "testuser",
    "password": "TestPassword123",
    "weeklyTarget": 3,
    "weeklyMinutes": 30
  }'

# 예상 응답:
# {"message":"회원가입이 완료되었습니다","userId":1}

# 닉네임 중복확인
curl -X POST http://localhost:3000/api/auth/check-nickname \
  -H "Content-Type: application/json" \
  -d '{"nickname": "testuser"}'

# 예상 응답:
# {"available":false}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/register/ app/api/auth/check-nickname/
git commit -m "feat: implement user registration and nickname check APIs"
```

---

### Task 6: 회원가입 페이지 UI 구현

**Files:**
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/layout.tsx`
- Create: `components/auth/register-form.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Root Layout 업데이트**

`app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata: Metadata = {
  title: '운동 체크 - 운동 습관 관리',
  description: '매일 운동을 기록하고 통계를 확인하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 인증 레이아웃 작성**

`app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 회원가입 폼 컴포넌트 작성**

`components/auth/register-form.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { validatePassword, validateNickname } from '@/lib/validations';

interface RegisterFormData {
  email: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  weeklyTarget: number;
  weeklyMinutes: number;
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'goals'>('info');
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      weeklyTarget: 3,
      weeklyMinutes: 30,
    },
  });

  const nickname = watch('nickname');
  const password = watch('password');

  const checkNickname = async () => {
    if (!nickname) return;

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setError(nicknameError);
      setNicknameAvailable(false);
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/check-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();
      setNicknameAvailable(data.available);

      if (!data.available) {
        setError('이미 사용 중인 닉네임입니다');
      }
    } catch (err) {
      setError('닉네임 확인 중 오류가 발생했습니다');
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (step === 'info') {
      if (!nicknameAvailable) {
        setError('닉네임 중복확인을 해주세요');
        return;
      }
      setStep('goals');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          nickname: data.nickname,
          password: data.password,
          weeklyTarget: data.weeklyTarget,
          weeklyMinutes: data.weeklyMinutes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입 실패');
      }

      router.push('/login?success=registered');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {step === 'info' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '올바른 이메일 형식이 아닙니다',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">닉네임</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                {...register('nickname', {
                  required: '닉네임을 입력해주세요',
                  validate: (value) => validateNickname(value) || true,
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={checkNickname}
                disabled={checking || !nickname}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
              >
                {checking ? '확인중...' : '확인'}
              </button>
            </div>
            {nicknameAvailable === true && (
              <p className="text-green-500 text-sm mt-1">✓ 사용 가능한 닉네임입니다</p>
            )}
            {errors.nickname && (
              <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                validate: (value) => validatePassword(value) || true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              최소 8자, 대문자, 숫자 포함 필수
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input
              type="password"
              {...register('passwordConfirm', {
                required: '비밀번호 확인을 입력해주세요',
                validate: (value) => value === password || '비밀번호가 일치하지 않습니다',
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || nicknameAvailable !== true || loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md disabled:bg-gray-300"
          >
            다음
          </button>
        </>
      )}

      {step === 'goals' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">주간 목표 횟수</label>
            <input
              type="number"
              {...register('weeklyTarget', { min: 1, max: 7 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">주간 목표 시간 (분)</label>
            <input
              type="number"
              {...register('weeklyMinutes', { min: 10 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('info')}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md"
            >
              이전
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded-md disabled:bg-gray-300"
            >
              {loading ? '가입 중...' : '가입 완료'}
            </button>
          </div>
        </>
      )}

      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 4: 회원가입 페이지 작성**

`app/(auth)/register/page.tsx`:
```typescript
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 5: TailwindCSS 설정 확인**

`tailwind.config.js` 업데이트:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 6: Commit**

```bash
git add app/\(auth\)/ components/auth/ app/layout.tsx
git commit -m "feat: implement user registration page UI"
```

---

**(계속 이어짐... Task 7-15 포함)**

---

## 📌 Spec 커버리지 체크

✅ **완료**:
- [x] 기술 스택 선택 (Next.js, SQLite, Prisma, NextAuth, TailwindCSS, Zustand)
- [x] 파일 구조 정의
- [x] 프로젝트 초기화
- [x] Prisma 스키마 (User, Goal, Exercise)
- [x] NextAuth.js 설정
- [x] Zustand + 유틸리티
- [x] 회원가입 API + UI

**진행 중**:
- [ ] 로그인 페이지 + API
- [ ] 대시보드 페이지
- [ ] 운동 기록 API + UI
- [ ] 통계 API + UI
- [ ] 목표 설정 API + UI
- [ ] 테스트

**예정**:
- [ ] 에러 처리 및 유효성 검사 강화
- [ ] 배포 설정

---

**다음 단계:**

이 계획의 나머지 작업(로그인, 대시보드, 운동 기록, 통계, 목표 설정)을 계속 구현하려면, 아래 두 가지 방법 중 하나를 선택하세요:

**1. Subagent-Driven (권장)** - 각 Task마다 신규 subagent 분배 + 검토
**2. Inline Execution** - 이 세션에서 순차 실행

어떤 방식으로 진행할까요?
