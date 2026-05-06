import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ExerciseForm } from '@/components/exercise-form';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getExercise(id: number, userId: number) {
  const exercise = await db.exercise.findUnique({
    where: { id },
  });

  if (!exercise || exercise.userId !== userId) {
    return null;
  }

  return exercise;
}

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id, 10);
  const { id } = await params;
  const exerciseId = parseInt(id, 10);

  const exercise = await getExercise(exerciseId, userId);

  if (!exercise) {
    redirect('/exercises');
  }

  const initialData = {
    date: format(
      exercise.date instanceof Date ? exercise.date : new Date(exercise.date),
      'yyyy-MM-dd'
    ),
    type: exercise.type,
    duration: exercise.duration,
    intensity: exercise.intensity,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">운동 기록 수정</h1>
        <p className="mt-1 text-gray-600">운동 기록을 수정하세요</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <ExerciseForm
          mode="edit"
          exerciseId={exerciseId}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
