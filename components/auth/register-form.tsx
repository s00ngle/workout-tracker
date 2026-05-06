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

  const onSubmitInfo = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(null);

    if (!nicknameAvailable) {
      setError('닉네임 가용성을 확인해주세요');
      return;
    }

    if (data.password !== data.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    setStep('goals');
  };

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
    <div
      className="rounded-3xl p-12 max-w-md mx-auto bg-white"
      style={{
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          {step === 'info' ? '회원가입' : '목표 설정'}
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          {step === 'info' ? '새로운 계정을 생성하세요' : '운동 목표를 설정하세요'}
        </p>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-6 p-4 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--success)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-5">
        {step === 'info' ? (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
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
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--gray-50)'
                }}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
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
                  className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--gray-50)'
                  }}
                  placeholder="your_nickname"
                />
                <button
                  type="button"
                  onClick={checkNicknameAvailability}
                  disabled={nicknameCheckLoading || !watchNickname}
                  className="px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  }}
                >
                  {nicknameCheckLoading ? '확인 중...' : '확인'}
                </button>
              </div>
              {errors.nickname && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  {errors.nickname.message}
                </p>
              )}
              {nicknameAvailable === true && (
                <p className="text-sm mt-2" style={{ color: 'var(--success)' }}>
                  사용 가능한 닉네임입니다
                </p>
              )}
              {nicknameAvailable === false && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  사용할 수 없는 닉네임입니다
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
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
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--gray-50)'
                }}
                placeholder="Password123"
              />
              {errors.password && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                최소 8자, 대문자 1개, 숫자 1개 포함
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                {...register('passwordConfirm', {
                  required: '비밀번호 확인을 입력해주세요',
                  validate: (value) =>
                    value === watchPassword || '비밀번호가 일치하지 않습니다',
                })}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--gray-50)'
                }}
                placeholder="Password123"
              />
              {errors.passwordConfirm && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || nicknameAvailable !== true}
              className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-60 mt-8"
              style={{
                backgroundColor: 'var(--primary)'
              }}
            >
              다음
            </button>
          </>
        ) : (
          <>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--border)'
              }}
            >
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                📧 {watch('email')}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                👤 {watch('nickname')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
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
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--gray-50)'
                }}
                min="1"
              />
              {errors.weeklyTarget && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  {errors.weeklyTarget.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>
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
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--gray-50)'
                }}
                min="10"
              />
              {errors.weeklyMinutes && (
                <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
                  {errors.weeklyMinutes.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep('info')}
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--gray-200)',
                  color: 'var(--text-primary)'
                }}
              >
                이전
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--primary)'
                }}
              >
                {isLoading ? '가입 중...' : '가입 완료'}
              </button>
            </div>
          </>
        )}
      </form>

      {step === 'info' && (
        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--primary)' }}>
            로그인
          </a>
        </p>
      )}
    </div>
  );
}
