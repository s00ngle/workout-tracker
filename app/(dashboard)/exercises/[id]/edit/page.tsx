'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ExerciseForm } from '@/components/exercise-form';
import { format } from 'date-fns';

interface Exercise {
  id: number;
  date: string;
  type: string;
  duration: number;
  intensity: string;
}

export default function EditExercisePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const exerciseId = parseInt(params.id as string, 10);
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const fetchExercise = async () => {
      try {
        const res = await fetch(`/api/exercises`);
        if (res.ok) {
          const exercises = await res.json();
          const found = exercises.find((ex: Exercise) => ex.id === exerciseId);
          if (found) {
            setExercise({
              ...found,
              date: format(new Date(found.date), 'yyyy-MM-dd'),
            });
          } else {
            setError('운동 기록을 찾을 수 없습니다');
          }
        }
      } catch (err) {
        setError('운동 기록을 불러올 수 없습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [status, router, exerciseId]);

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="p-6">
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--error)'
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-6">
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            color: 'var(--warning)'
          }}
        >
          운동 기록을 찾을 수 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          운동 수정
        </h1>
        <p className="text-base mt-3" style={{ color: 'var(--text-secondary)' }}>
          운동 기록을 수정하세요
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
        <ExerciseForm
          mode="edit"
          exerciseId={exerciseId}
          initialData={exercise}
        />
      </div>
    </div>
  );
}
