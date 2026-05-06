'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

interface RegisterFormData {
  email: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  weeklyTarget: number;
  weeklyMinutes: number;
}

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'goals'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      nickname: '',
      password: '',
      passwordConfirm: '',
      weeklyTarget: 3,
      weeklyMinutes: 30,
    },
  });

  const watchPassword = watch('password');
  const watchNickname = watch('nickname');

  // 닉네임 가용성 확인
  const checkNicknameAvailability = async () => {
    if (!watchNickname) {
      setError('닉네임을 입력해주세요');
      return;
    }

    setNicknameCheckLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/check-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: watchNickname }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.available) {
          setNicknameAvailable(true);
          setSuccess('사용 가능한 닉네임입니다');
        } else {
          setNicknameAvailable(false);
          setError('이미 사용 중인 닉네임입니다');
        }
      } else {
        setNicknameAvailable(false);
        setError(data.message || '닉네임 확인 중 오류가 발생했습니다');
      }
    } catch (err) {
      setNicknameAvailable(false);
      setError('닉네임 확인 중 오류가 발생했습니다');
    } finally {
      setNicknameCheckLoading(false);
    }
  };

  // Step 1: 정보 입력 단계
  const onSubmitInfo = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(null);

    // 닉네임 가용성 확인
    if (!nicknameAvailable) {
      setError('닉네임 가용성을 확인해주세요');
      return;
    }

    // 비밀번호 확인
    if (data.password !== data.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    // Step 2로 진행
    setStep('goals');
  };

  // Step 2: 목표 설정 및 회원가입
  const onSubmitGoals = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          nickname: data.nickname,
          password: data.password,
          weeklyTarget: parseInt(String(data.weeklyTarget), 10),
          weeklyMinutes: parseInt(String(data.weeklyMinutes), 10),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess('회원가입이 완료되었습니다');
        reset();
        setNicknameAvailable(null);
        setStep('info');

        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login?success=registered');
        }, 2000);
      } else {
        setError(responseData.message || '회원가입 중 오류가 발생했습니다');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = handleSubmit(step === 'info' ? onSubmitInfo : onSubmitGoals);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {step === 'info' ? '회원가입' : '운동 목표 설정'}
      </h1>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 성공 메시지 */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-4">
        {step === 'info' ? (
          <>
            {/* 이메일 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                {...register('email', {
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '올바른 이메일 형식을 입력해주세요',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* 닉네임 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  {...register('nickname', {
                    required: '닉네임을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '닉네임은 최소 2자 이상이어야 합니다',
                    },
                    maxLength: {
                      value: 20,
                      message: '닉네임은 최대 20자 이하여야 합니다',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_한-힣]+$/,
                      message: '영문, 숫자, _, 한글만 포함 가능합니다',
                    },
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your_nickname"
                />
                <button
                  type="button"
                  onClick={checkNicknameAvailability}
                  disabled={nicknameCheckLoading || !watchNickname}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {nicknameCheckLoading ? '확인 중...' : '확인'}
                </button>
              </div>
              {errors.nickname && (
                <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>
              )}
              {nicknameAvailable === true && (
                <p className="text-green-500 text-sm mt-1">사용 가능한 닉네임입니다</p>
              )}
              {nicknameAvailable === false && (
                <p className="text-red-500 text-sm mt-1">사용할 수 없는 닉네임입니다</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                {...register('password', {
                  required: '비밀번호를 입력해주세요',
                  minLength: {
                    value: 8,
                    message: '비밀번호는 최소 8자 이상이어야 합니다',
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*\d)/,
                    message: '대문자와 숫자를 포함해야 합니다',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Password123"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                최소 8자, 대문자 1개, 숫자 1개 포함
              </p>
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                {...register('passwordConfirm', {
                  required: '비밀번호 확인을 입력해주세요',
                  validate: (value) =>
                    value === watchPassword || '비밀번호가 일치하지 않습니다',
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Password123"
              />
              {errors.passwordConfirm && (
                <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
              )}
            </div>

            {/* 다음 버튼 */}
            <button
              type="submit"
              disabled={isLoading || nicknameAvailable !== true}
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
            >
              다음
            </button>
          </>
        ) : (
          <>
            {/* Step 2: 목표 설정 */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-600 mb-4">
                📧 {watch('email')}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                👤 {watch('nickname')}
              </p>
            </div>

            {/* 주간 목표 (운동 횟수) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주간 운동 목표 횟수
              </label>
              <input
                type="number"
                {...register('weeklyTarget', {
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: '최소 1회 이상이어야 합니다',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="1"
              />
              {errors.weeklyTarget && (
                <p className="text-red-500 text-sm mt-1">{errors.weeklyTarget.message}</p>
              )}
            </div>

            {/* 주간 목표 (운동 시간) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주간 운동 목표 시간 (분)
              </label>
              <input
                type="number"
                {...register('weeklyMinutes', {
                  valueAsNumber: true,
                  min: {
                    value: 10,
                    message: '최소 10분 이상이어야 합니다',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="10"
              />
              {errors.weeklyMinutes && (
                <p className="text-red-500 text-sm mt-1">{errors.weeklyMinutes.message}</p>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep('info')}
                disabled={isLoading}
                className="flex-1 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '가입 중...' : '가입 완료'}
              </button>
            </div>
          </>
        )}
      </form>

      {/* 로그인 링크 */}
      {step === 'info' && (
        <p className="text-center text-sm text-gray-600 mt-6">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-blue-500 hover:text-blue-600 font-semibold">
            로그인
          </a>
        </p>
      )}
    </div>
  );
}
