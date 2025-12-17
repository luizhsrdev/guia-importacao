export default function VendedoresLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-elevated rounded-lg w-48" />
          <div className="h-12 bg-surface-elevated rounded-lg w-full max-w-md" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-surface-elevated rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
