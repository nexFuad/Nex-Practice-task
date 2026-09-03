type TableSkeletonProps = {
  columns: number;
  rows?: number;
  className?: string;
};

/** A stable table placeholder that prevents layout jumps while query data loads. */
export function TableSkeleton({
  columns,
  rows = 8,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading table data"
      className={`animate-pulse space-y-3 p-4 ${className}`}
    >
      <div
        className="grid gap-4 border-b border-slate-200 pb-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(5rem, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <span key={`head-${index}`} className="h-4 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 py-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(5rem, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <span
              key={`cell-${rowIndex}-${columnIndex}`}
              className="h-5 rounded bg-slate-100"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
