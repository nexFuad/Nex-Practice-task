type LoadingProps = { message?: string; backgroundClassName?: string };

export function Loading({
  message = "Loading your workspace…",
  backgroundClassName = "bg-white",
}: LoadingProps) {
  return (
    <main className={`grid min-h-screen place-items-center ${backgroundClassName}`} aria-busy="true">
      <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
        <span className="size-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        {message}
      </div>
    </main>
  );
}
