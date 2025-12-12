export default function PagamentoLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-elevated rounded-lg w-32 mx-auto" />
          <div className="h-64 bg-surface-elevated rounded-xl" />
          <div className="h-12 bg-surface-elevated rounded-lg" />
        </div>
      </div>
    </div>
  );
}
