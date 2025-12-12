export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        <p className="text-text-tertiary text-sm">Carregando...</p>
      </div>
    </div>
  );
}
