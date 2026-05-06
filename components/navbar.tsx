'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/login',
    });
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl tracking-tight" style={{ color: 'var(--primary)' }}>
          🏋️ Workout
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link
            href="/"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)', '--hover-color': 'var(--primary)' } as any}
          >
            대시보드
          </Link>
          <Link
            href="/exercises"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' } as any}
          >
            운동 기록
          </Link>
          <Link
            href="/statistics"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' } as any}
          >
            통계
          </Link>
          <Link
            href="/settings/goals"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' } as any}
          >
            목표
          </Link>

          {session?.user && (
            <div className="flex items-center gap-4 border-l pl-8" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--error)',
                  color: 'white'
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-lg font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          ☰
        </button>

        {isMenuOpen && (
          <div
            className="absolute top-full right-6 mt-4 bg-white rounded-xl shadow-lg p-4 space-y-2 md:hidden z-50"
            style={{ borderColor: 'var(--border)', border: '1px solid' }}
          >
            <Link
              href="/"
              className="block px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              대시보드
            </Link>
            <Link
              href="/exercises"
              className="block px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              운동 기록
            </Link>
            <Link
              href="/statistics"
              className="block px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              통계
            </Link>
            <Link
              href="/settings/goals"
              className="block px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              목표
            </Link>
            {session?.user && (
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--error)',
                  color: 'white'
                }}
              >
                로그아웃
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
