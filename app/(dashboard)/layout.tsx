import { getSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Protect the dashboard - redirect to login if not authenticated
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <Navbar user={session.user} />
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
