export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-full w-full flex flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
      }}
    >
      <div className="mb-16 text-center">
        <div className="inline-block mb-4 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            Workout Tracker
          </p>
        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          운동 관리
        </h1>
        <p className="text-lg max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          목표를 세우고 습관을 만들어 보세요
        </p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
