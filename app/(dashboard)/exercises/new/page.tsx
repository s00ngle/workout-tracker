'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ExerciseForm } from '@/components/exercise-form';

export default function NewExercisePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          운동 추가
        </h1>
        <p className="text-base mt-3" style={{ color: 'var(--text-secondary)' }}>
          오늘의 운동을 기록하세요
        </p>
      </div>

      <div
        className="rounded-2xl p-8 border"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <ExerciseForm mode="add" />
      </div>
    </div>
  );
}
