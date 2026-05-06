import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ExerciseForm } from '@/components/exercise-form';

export const dynamic = 'force-dynamic';

export default async function NewExercisePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">운동 기록 추가</h1>
        <p className="mt-1 text-gray-600">새로운 운동 기록을 추가하세요</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <ExerciseForm mode="add" />
      </div>
    </div>
  );
}
