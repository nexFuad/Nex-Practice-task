"use client";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 rounded-md border border-slate-200 px-3 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
        >
          Previous
        </button>
        <span
          aria-current="page"
          className="inline-flex size-8 items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white"
        >
          {currentPage}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 rounded-md border border-slate-200 px-3 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
