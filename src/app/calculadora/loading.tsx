export default function CalculadoraLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-elevated rounded-lg w-64" />
          <div className="h-4 bg-surface-elevated rounded w-96" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-elevated rounded-lg" />
              ))}
            </div>
            <div className="h-80 bg-surface-elevated rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
