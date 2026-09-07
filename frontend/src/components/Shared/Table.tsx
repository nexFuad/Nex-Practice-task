"use client";

import { MoreVertical, type LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./pagination";

export type TableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  minWidth?: string;
};

export type TableAction<T> = {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  danger?: boolean;
  hidden?: (row: T) => boolean;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T, index: number) => string | number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  minHeight?: string;
  tableMinWidth?: string;
  className?: string;
  loading?: boolean;
  skeletonRows?: number;
  actions?: TableAction<T>[];
};

export function Table<T>({
  columns,
  rows,
  getRowId,
  emptyMessage = "No records found.",
  onRowClick,
  page = 1,
  pageSize = 10,
  totalItems = rows.length,
  onPageChange,
  minHeight = "80vh",
  tableMinWidth,
  className = "",
  loading = false,
  skeletonRows = 6,
  actions = [],
}: TableProps<T>) {
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("pointerdown", close);
    const closeOnViewportChange = () => setOpenMenuId(null);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, []);
  const toggleActionsMenu = (
    rowId: string | number,
    button: HTMLButtonElement,
  ) => {
    if (openMenuId === rowId) {
      setOpenMenuId(null);
      return;
    }
    const rect = button.getBoundingClientRect();
    const estimatedHeight = 260;
    const openAbove = rect.bottom + estimatedHeight > window.innerHeight - 12;
    setMenuPosition({
      top: openAbove
        ? Math.max(12, rect.top - estimatedHeight)
        : rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
    setOpenMenuId(rowId);
  };
  return (
    <section
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}
    >
      <div
        className="min-h-[80vh] overflow-x-scroll overflow-y-visible scrollbar-gutter-stable"
        style={{ minHeight }}
      >
        <table
          className="w-full min-w-max border-separate border-spacing-0 text-left text-sm text-slate-700"
          style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
        >
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={
                    column.minWidth ? { minWidth: column.minWidth } : undefined
                  }
                  className={`h-10 whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-800 sm:px-4 ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="h-10 w-16 whitespace-nowrap border-b border-slate-200 px-3 py-2 text-right font-medium text-slate-800 sm:px-4">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="border-b border-slate-100 px-3 py-4 sm:px-4"
                    >
                      <div className="h-4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="border-b border-slate-100 px-3 py-4 sm:px-4">
                      <div className="h-4 animate-pulse rounded bg-slate-100" />
                    </td>
                  )}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length ? 1 : 0)}
                  className="h-[calc(80vh-2.5rem)] px-5 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={getRowId(row, rowIndex)}
                    onClick={() => onRowClick?.(row)}
                    className={
                      onRowClick
                        ? "cursor-pointer transition hover:bg-slate-50"
                        : ""
                    }
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`whitespace-nowrap border-b border-slate-200 px-3 py-4 sm:px-4 ${column.className ?? ""}`}
                      >
                        {column.cell(row, rowIndex)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="relative border-b border-slate-200 px-3 py-2 text-right sm:px-4">
                        <button
                          ref={
                            openMenuId === getRowId(row, rowIndex)
                              ? triggerRef
                              : undefined
                          }
                          type="button"
                          aria-label="Open row actions"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleActionsMenu(
                              getRowId(row, rowIndex),
                              event.currentTarget,
                            );
                          }}
                          className="grid size-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
                        >
                          <MoreVertical className="size-5" />
                        </button>
                        {openMenuId === getRowId(row, rowIndex) &&
                          menuPosition &&
                          typeof document !== "undefined" &&
                          createPortal(
                            <div
                              ref={menuRef}
                              className="fixed z-100 min-w-40 rounded-lg border border-slate-200 bg-white p-1 text-left shadow-xl"
                              style={menuPosition}
                            >
                              {actions
                                .filter((action) => !action.hidden?.(row))
                                .map((action) => {
                                  const Icon = action.icon;

                                  return (
                                    <button
                                      key={action.label}
                                      type="button"
                                      onClick={() => {
                                        action.onClick(row);
                                        setOpenMenuId(null);
                                      }}
                                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 ${action.danger ? "text-red-600" : "text-slate-700"}`}
                                    >
                                      {Icon && (
                                        <Icon className="size-4 shrink-0" />
                                      )}
                                      <span>{action.label}</span>
                                    </button>
                                  );
                                })}
                            </div>,
                            document.body,
                          )}
                      </td>
                    )}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
