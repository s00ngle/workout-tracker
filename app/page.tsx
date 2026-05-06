import { getSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  if (session) {
    // Redirect authenticated users to dashboard
    redirect('/dashboard');
  } else {
    // Redirect unauthenticated users to login
    redirect('/login');
  }
}
