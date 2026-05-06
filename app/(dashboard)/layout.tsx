import { Navbar } from '@/components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-full flex flex-col"
      style={{
        backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
      }}
    >
      <Navbar />
      <main className="flex-1 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
