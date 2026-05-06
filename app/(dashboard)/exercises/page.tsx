'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Exercise {
  id: number;
  date: string;
  type: string;
  duration: number;
  intensity: string;
}

export default function ExercisesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const fetchExercises = async () => {
      try {
        const res = await fetch('/api/exercises');
        if (res.ok) {
          const data = await res.json();
          setExercises(data || []);
        }
      } catch (err) {
        console.error('운동 기록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [status, router]);

  const handleDelete = async (id: number) => {
    if (!confirm('이 운동 기록을 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExercises(exercises.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            운동 기록
          </h1>
          <p className="text-base mt-3" style={{ color: 'var(--text-secondary)' }}>
            모든 운동 기록을 확인하고 관리하세요
          </p>
        </div>
        <Link
          href="/exercises/new"
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap flex items-center justify-center w-full md:w-auto"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          ➕ 운동 추가
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {exercises.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              운동 기록이 없습니다
            </p>
            <Link
              href="/exercises/new"
              className="inline-block px-6 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'var(--gray-100)',
                color: 'var(--primary)'
              }}
            >
              첫 운동 기록 추가하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {(() => {
              // Group exercises by date
              const exercisesByDate: { [key: string]: Exercise[] } = {};
              exercises.forEach((exercise) => {
                const dateStr = new Date(exercise.date).toLocaleDateString('ko-KR');
                if (!exercisesByDate[dateStr]) {
                  exercisesByDate[dateStr] = [];
                }
                exercisesByDate[dateStr].push(exercise);
              });

              // Sort dates in descending order (newest first)
              const sortedDates = Object.keys(exercisesByDate).sort((a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateB.getTime() - dateA.getTime();
              });

              return sortedDates.map((dateStr) => (
                <div key={dateStr}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    {dateStr}
                  </h3>
                  <div className="space-y-2">
                    {exercisesByDate[dateStr].map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--gray-50)',
                          borderColor: 'var(--border)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {exercise.type}
                            </p>
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  exercise.intensity === 'high'
                                    ? 'rgba(231, 76, 60, 0.1)'
                                    : exercise.intensity === 'medium'
                                    ? 'rgba(255, 165, 0, 0.1)'
                                    : 'rgba(7, 197, 99, 0.1)',
                                color:
                                  exercise.intensity === 'high'
                                    ? 'var(--error)'
                                    : exercise.intensity === 'medium'
                                    ? 'var(--warning)'
                                    : 'var(--success)'
                              }}
                            >
                              {exercise.intensity === 'high' ? '높음' : exercise.intensity === 'medium' ? '중간' : '낮음'}
                            </span>
                          </div>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {exercise.duration}분
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/exercises/${exercise.id}/edit`}
                            className="transition-opacity hover:opacity-80 p-2 rounded-full flex items-center justify-center"
                            title="수정"
                            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(exercise.id)}
                            className="transition-opacity hover:opacity-80 p-2 rounded-full flex items-center justify-center cursor-pointer"
                            title="삭제"
                            style={{ backgroundColor: 'var(--error)', color: 'white' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
