# 운동 체크 사이트 설계 문서

**작성일**: 2026-05-06  
**프로젝트**: 매일 운동 여부를 체크하는 Next.js 사이트  
**상태**: 설계 완료

---

## 1. 프로젝트 개요

매일 운동 여부와 상세 정보(종류, 시간, 강도)를 기록하고, 캘린더 UI와 통계를 통해 운동 습관을 관리하는 웹 애플리케이션입니다.

**핵심 기능**:
- 회원가입 및 로그인 (닉네임 중복확인)
- 운동 기록 관리 (종류, 시간, 강도)
- 캘린더 뷰 (월간 운동 현황)
- 주간/월간 통계
- 목표 설정 및 달성률 추적

---

## 2. 기술 스택

| 분야 | 기술 |
|------|------|
| **프레임워크** | Next.js (App Router) |
| **데이터베이스** | SQLite + Prisma ORM |
| **인증** | NextAuth.js (세션 기반) |
| **스타일** | TailwindCSS |
| **폼 관리** | React Hook Form |
| **클라이언트 상태** | Zustand |
| **서버 상태** | Next.js Server Components |
| **호스팅** | Vercel (또는 자체 서버) |

---

## 3. 주요 페이지 및 기능

### 3.1 인증 페이지

#### 회원가입 (`/auth/register`)
- **입력 항목**:
  - 이메일 (고유)
  - 닉네임 (고유, 중복확인 버튼 포함)
  - 비밀번호
- **목표 설정** (회원가입 단계 2):
  - 주간 목표: 운동 횟수 (기본값: 3회), 운동 시간 (기본값: 30분)
  - 월간 목표: 선택적 입력
- **플로우**:
  1. 기본 정보 입력
  2. 목표 설정
  3. 가입 버튼 클릭
  4. User + Goal 레코드 생성
  5. 자동 로그인 → 대시보드로 이동

#### 로그인 (`/auth/login`)
- 이메일 및 비밀번호 입력
- NextAuth.js를 통한 인증
- 성공 시 세션 생성 → 대시보드로 리다이렉트

#### 로그아웃
- 세션 삭제
- 로그인 페이지로 리다이렉트

---

### 3.2 대시보드 (메인 페이지, `/`)

**접근 권한**: 로그인 사용자만

**구성 요소**:
1. **현황 요약**:
   - 오늘의 운동 여부 (완료/미완료)
   - 이번 주 운동 횟수 / 목표 (예: 2/3)
   - 이번 주 총 운동 시간 / 목표 (예: 45분/90분)

2. **캘린더 뷰** (당월):
   - 각 날짜별 운동 여부 표시
   - 클릭 시 해당 날짜의 운동 기록 상세 조회
   - 색상 구분 (운동함/안함)

3. **빠른 추가**:
   - 오늘 운동 추가 버튼 (모달 또는 페이지 이동)

---

### 3.3 운동 기록 페이지 (`/exercises`)

**접근 권한**: 로그인 사용자만

**기능**:
- 운동 기록 목록 (테이블 형식)
  - 날짜, 운동 종류, 시간, 강도
  - 수정/삭제 버튼

- 운동 추가 (`/exercises/new`):
  - 날짜 선택
  - 운동 종류 입력 (자유 텍스트)
  - 운동 시간 (분 단위)
  - 강도 선택 (Low / Medium / High)
  - 저장 버튼

- 운동 수정 (`/exercises/:id/edit`):
  - 기존 정보 표시
  - 수정 후 저장

- 운동 삭제:
  - 목록에서 삭제 버튼 클릭
  - 확인 모달 표시 후 삭제

---

### 3.4 통계 페이지 (`/statistics`)

**접근 권한**: 로그인 사용자만

**구성 요소**:
1. **주간 통계**:
   - 일일 운동 횟수 그래프 (막대 그래프)
   - 일일 운동 시간 그래프 (선 그래프)
   - 목표 대비 달성률

2. **월간 통계**:
   - 월별 운동 횟수 그래프
   - 월별 운동 시간 그래프
   - 월간 목표 설정 여부에 따라 표시

3. **통계 필터**:
   - 월 선택 (이전/다음 월 이동)

---

### 3.5 목표 설정 페이지 (`/settings/goals`)

**접근 권한**: 로그인 사용자만

**기능**:
- 현재 목표 표시
- 목표 수정:
  - 주간 목표 (횟수, 시간)
  - 월간 목표 (선택적)
- 저장 버튼

---

## 4. 데이터 모델

### 4.1 User 테이블

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  nickname  String    @unique
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // 관계
  exercises Exercise[]
  goal      Goal?
}
```

### 4.2 Goal 테이블

```prisma
model Goal {
  id              Int       @id @default(autoincrement())
  userId          Int       @unique
  weeklyTarget    Int       @default(3)          // 주간 목표 횟수
  weeklyMinutes   Int       @default(30)         // 주간 목표 시간 (분)
  monthlyTarget   Int?                           // 월간 목표 횟수 (선택사항)
  monthlyMinutes  Int?                           // 월간 목표 시간 (선택사항)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // 관계
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 4.3 Exercise 테이블

```prisma
model Exercise {
  id        Int       @id @default(autoincrement())
  userId    Int
  date      DateTime
  type      String                           // 운동 종류 (예: 러닝, 헬스)
  duration  Int                              // 운동 시간 (분)
  intensity String    @default("medium")     // low / medium / high
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // 관계
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, date])
}
```

---

## 5. 인증 흐름

### 5.1 회원가입

```
사용자 → 회원가입 페이지 
  ↓
기본 정보 입력 (이메일, 닉네임, 비밀번호)
  ↓
닉네임 중복확인 API 호출 (실시간)
  ↓
목표 설정 페이지
  ↓
가입 버튼 클릭
  ↓
User + Goal 생성
  ↓
NextAuth.js 세션 생성
  ↓
대시보드로 리다이렉트
```

### 5.2 로그인

```
사용자 → 로그인 페이지
  ↓
이메일 + 비밀번호 입력
  ↓
NextAuth.js 인증
  ↓
세션 생성
  ↓
대시보드로 리다이렉트
```

### 5.3 보호된 페이지

- NextAuth.js 미들웨어로 세션 확인
- 미인증 사용자: 로그인 페이지로 리다이렉트

---

## 6. API 엔드포인트

### 6.1 인증 API

| 메서드 | 엔드포인트 | 설명 | 요청 | 응답 |
|--------|----------|------|-----|------|
| POST | `/api/auth/register` | 회원가입 | `{email, nickname, password, weeklyTarget, weeklyMinutes, monthlyTarget?, monthlyMinutes?}` | `{success, userId}` |
| POST | `/api/auth/check-nickname` | 닉네임 중복확인 | `{nickname}` | `{available: boolean}` |
| POST | `/api/auth/login` | 로그인 (NextAuth.js) | NextAuth.js 처리 | - |
| POST | `/api/auth/logout` | 로그아웃 | - | - |

### 6.2 운동 기록 API

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/exercises` | 전체 기록 조회 (필터: 날짜 범위) | 로그인 |
| POST | `/api/exercises` | 운동 추가 | 로그인 |
| PUT | `/api/exercises/:id` | 운동 수정 | 로그인 |
| DELETE | `/api/exercises/:id` | 운동 삭제 | 로그인 |

### 6.3 목표 API

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/goals` | 사용자 목표 조회 | 로그인 |
| PUT | `/api/goals` | 목표 수정 | 로그인 |

### 6.4 통계 API

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/statistics/weekly` | 주간 통계 | 로그인 |
| GET | `/api/statistics/monthly` | 월간 통계 | 로그인 |

---

## 7. 상태 관리 전략

### 7.1 Zustand (클라이언트 상태)

**관리 데이터**:
- 로그인 사용자 정보 (email, nickname)
- UI 상태 (모달 열림/닫힘, 페이지 필터)
- 목표 정보 (로컬 캐시)

```typescript
// 예시
const userStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### 7.2 Server Components (서버 상태)

**데이터 페칭**:
- 운동 기록 목록
- 통계 데이터 (주간/월간)
- 목표 정보

Server Components에서 직접 DB 쿼리 → props로 클라이언트 컴포넌트에 전달

---

## 8. 에러 처리

### 8.1 클라이언트 에러

- **폼 검증**: React Hook Form으로 실시간 검증
  - 이메일 형식 확인
  - 비밀번호 강도 확인
  - 필수 필드 확인

- **API 에러**:
  - 닉네임 중복 (409 Conflict)
  - 이메일 중복 (409 Conflict)
  - 잘못된 로그인 (401 Unauthorized)
  - 서버 에러 (500): 사용자 친화적 메시지 표시

### 8.2 서버 에러

- 트랜잭션 처리 (User + Goal 동시 생성)
- DB 연결 오류 처리
- 권한 검증 (본인 데이터만 접근)

---

## 9. 보안 고려사항

- **비밀번호**: bcrypt로 해싱 저장
- **세션**: NextAuth.js의 보안 기본값 사용
- **CORS**: API 라우트는 Same-Origin만 허용
- **입력 검증**: 서버사이드 검증 필수
- **인가**: 각 API에서 사용자 ID 확인

---

## 10. 향후 확장 기능 (범위 밖)

- 친구 추가 및 비교
- 운동 알림 (이메일)
- 모바일 앱
- SNS 공유 기능
- AI 기반 운동 추천

---

## 11. 배포 계획

1. **개발 환경**: 로컬 SQLite
2. **프로덕션**:
   - SQLite 파일 기반 (자체 서버) 또는
   - PostgreSQL로 마이그레이션 (선택사항)
   - Vercel 배포
   - 환경 변수 관리 (.env.local)

---

**설계 검토 완료**: ✅
