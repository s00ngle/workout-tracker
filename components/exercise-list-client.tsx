'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';
import { format } from 'date-fns';

interface Exercise {
  id: number;
  date: Date;
  type: string;
  duration: number;
  intensity: string;
}

interface ExerciseListClientProps {
  exercises: Exercise[];
}

function getIntensityColor(intensity: string): string {
  switch (intensity.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getIntensityLabel(intensity: string): string {
  switch (intensity.toLowerCase()) {
    case 'low':
      return '낮음';
    case 'medium':
      return '중간';
    case 'high':
      return '높음';
    default:
      return intensity;
  }
}

export function ExerciseListClient({ exercises }: ExerciseListClientProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      setDeleteId(null);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                날짜
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                운동 종류
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                운동 시간
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                강도
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {format(new Date(exercise.date), 'yyyy년 MM월 dd일')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {exercise.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDuration(exercise.duration)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getIntensityColor(
                      exercise.intensity
                    )}`}
                  >
                    {getIntensityLabel(exercise.intensity)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <Link
                    href={`/exercises/${exercise.id}/edit`}
                    className="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => setDeleteId(exercise.id)}
                    className="inline-block px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDeleting}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              운동 기록 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              정말로 이 운동 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
