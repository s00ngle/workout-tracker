import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';
import { ExerciseListClient } from '@/components/exercise-list-client';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface Exercise {
  id: number;
  date: Date;
  type: string;
  duration: number;
  intensity: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

async function getExercises(userId: number) {
  const exercises = await db.exercise.findMany({
    where: { userId },
    orderBy: {
      date: 'desc',
    },
  });
  return exercises;
}

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id, 10);
  const exercises = await getExercises(userId);

  const formattedExercises = exercises.map((ex) => ({
    ...ex,
    date: ex.date instanceof Date ? ex.date : new Date(ex.date),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">운동 기록</h1>
          <p className="mt-1 text-gray-600">모든 운동 기록을 관리하세요</p>
        </div>
        <Link
          href="/exercises/new"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
        >
          + 운동 추가
        </Link>
      </div>

      {/* Exercises Table */}
      {formattedExercises.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ExerciseListClient exercises={formattedExercises} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">아직 운동 기록이 없습니다</p>
          <Link
            href="/exercises/new"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            첫 운동 기록 추가하기
          </Link>
        </div>
      )}
    </div>
  );
}
