'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/login',
    });
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:inline">
              Workout Tracker
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-500 font-medium transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="/exercises"
              className="text-gray-700 hover:text-blue-500 font-medium transition-colors"
            >
              운동
            </Link>
            <Link
              href="/statistics"
              className="text-gray-700 hover:text-blue-500 font-medium transition-colors"
            >
              통계
            </Link>
            <Link
              href="/settings/goals"
              className="text-gray-700 hover:text-blue-500 font-medium transition-colors"
            >
              목표
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name || '사용자'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:inline px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              대시보드
            </Link>
            <Link
              href="/exercises"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              운동
            </Link>
            <Link
              href="/statistics"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              통계
            </Link>
            <Link
              href="/settings/goals"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              목표
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 mt-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
