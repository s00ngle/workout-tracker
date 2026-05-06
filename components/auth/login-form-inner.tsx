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

  // Check if redirected from registration
  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam === 'registered') {
      setSuccess('회원가입이 완료되었습니다. 이제 로그인하세요.');
    }
  }, [searchParams]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">로그인</h1>

      {/* 에러 메시지 */}
      {externalError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{externalError}</p>
        </div>
      )}

      {/* 성공 메시지 */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Password123"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* 회원가입 링크 */}
      <p className="text-center text-sm text-gray-600 mt-6">
        계정이 없으신가요?{' '}
        <a href="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
          회원가입
        </a>
      </p>
    </div>
  );
}
