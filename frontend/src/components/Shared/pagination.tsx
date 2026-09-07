"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const maxVisiblePages = 5;
  const windowStart = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1,
    ),
  );
  const windowEnd = Math.min(totalPages, windowStart + maxVisiblePages - 1);
  const visiblePages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, index) => windowStart + index,
  );

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-4" />
          Back
        </button>
        {visiblePages.map((pageNumber) => {
          const active = pageNumber === currentPage;
          return (
            <button
              key={pageNumber}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={`inline-flex size-9 items-center justify-center rounded-md border text-sm font-medium transition ${active ? "border-neutral-950 bg-neutral-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
