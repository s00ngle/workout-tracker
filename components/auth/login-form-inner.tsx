'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormInnerProps {
  register: UseFormRegister<LoginFormData>;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  errors: FieldErrors<LoginFormData>;
  isLoading: boolean;
  error: string | null;
}

export function LoginFormInner({
  register,
  handleSubmit,
  onSubmit,
  errors,
  isLoading,
  error: externalError,
}: LoginFormInnerProps) {
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam === 'registered') {
      setSuccess('회원가입이 완료되었습니다. 이제 로그인하세요.');
    }
  }, [searchParams]);

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
          로그인
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          계정에 접속하세요
        </p>
      </div>

      {externalError && (
        <div
          className="mb-6 p-4 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {externalError}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-var(--gray-50)"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--gray-50)'
            }}
            placeholder="your@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
              {errors.email.message}
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
            })}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--gray-50)'
            }}
            placeholder="Password123"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm mt-2" style={{ color: 'var(--error)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 font-semibold rounded-xl transition-all duration-200 text-white mt-8 hover:shadow-lg active:scale-95 disabled:opacity-60"
          style={{
            backgroundColor: 'var(--primary)'
          }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
        계정이 없으신가요?{' '}
        <a href="/register" className="font-semibold hover:text-blue-600 transition-colors" style={{ color: 'var(--primary)' }}>
          회원가입
        </a>
      </p>
    </div>
  );
}
