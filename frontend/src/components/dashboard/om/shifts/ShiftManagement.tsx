"use client";

import { Download, Plus, Search } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createShift,
  deleteShift,
  getShifts,
  updateShift,
  type PaginatedShifts,
} from "./shifts.api";
import { ShiftFormModal } from "./ShiftFormModal";
import { ShiftStats } from "./ShiftStats";
import { ShiftsTable } from "./ShiftsTable";
import { UsersPagination } from "../users/UsersPagination";
import { TableSkeleton } from "../TableSkeleton";
import type { Shift, ShiftPayload } from "./types";

const PAGE_SIZE = 10;

export function ShiftManagement() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Shift | "new" | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const deferredQuery = useDeferredValue(query);
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: loading,
    isFetching,
    error: queryError,
  } = useQuery<PaginatedShifts>({
    queryKey: [
      "shifts",
      { query: deferredQuery, status, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () =>
      getShifts({ query: deferredQuery, status, page, pageSize: PAGE_SIZE }),
    placeholderData: (previous) => previous,
  });
  const invalidateShifts = () =>
    void queryClient.invalidateQueries({ queryKey: ["shifts"] });
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: ShiftPayload }) =>
      id ? updateShift(id, payload) : createShift(payload),
    onSuccess: invalidateShifts,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onSuccess: invalidateShifts,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const shifts = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const stats = [
    data?.stats.total ?? 0,
    data?.stats.active ?? 0,
    data?.stats.inactive ?? 0,
    data?.stats.assignedSites ?? 0,
  ];
  const visibleError =
    error ||
    (queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Unable to load shifts."
        : "");
  const save = async (payload: ShiftPayload) => {
    try {
      await saveMutation.mutateAsync({
        id: form === "new" ? undefined : form?.id,
        payload,
      });
      setForm(null);
      setToast(
        form === "new"
          ? "Shift type created successfully."
          : "Shift type updated successfully.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save shift.",
      );
    }
  };
  const remove = async (shift: Shift) => {
    if (!window.confirm(`Delete ${shift.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(shift.id);
      setToast("Shift deleted successfully.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to delete shift.",
      );
    }
  };
  const exportCsv = () => {
    const rows = shifts.map((shift) =>
      [
        shift.name,
        shift.code,
        shift.category,
        shift.color,
        shift.startTime,
        shift.endTime,
        shift.durationHours,
        shift.status === "ACTIVE" ? "Active" : "Inactive",
        shift.description ?? "",
      ].join(","),
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(
        [
          [
            "Name,Code,Category,Color,Start,End,Duration Hours,Status,Description",
            ...rows,
          ].join("\n"),
        ],
        { type: "text/csv" },
      ),
    );
    link.download = "shifts-page.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="min-w-0 px-5 pb-5 pt-2 text-slate-800">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Shift Management</h1>
            <p className="text-sm text-slate-500">
              Create and manage working shifts
            </p>
          </div>
          <button
            onClick={() => setForm("new")}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white"
          >
            <Plus className="size-4" />
            Add Shift
          </button>
        </header>
        <ShiftStats values={stats} />
        <section className="flex min-h-160 flex-col rounded-xl border border-slate-200 bg-white py-6 shadow-sm">
          <header className="px-6">
            <h2 className="font-semibold">All Shifts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage shift schedules and site assignments
            </p>
          </header>
          <div className="flex flex-1 flex-col space-y-4 px-6 pt-4">
            {visibleError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {visibleError}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <label className="relative min-w-56 flex-1">
                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search shifts..."
                  className="h-9 w-full rounded-md border border-slate-200 py-1 pl-8 pr-3 text-sm outline-none focus:border-blue-400"
                />
              </label>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-44 rounded-md border border-slate-200 px-3 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <button
                onClick={exportCsv}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-medium"
              >
                <Download className="size-4" />
                Export
              </button>
            </div>
            {loading || isFetching ? (
              <TableSkeleton columns={7} className="min-h-115" />
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex-1">
                  <ShiftsTable
                    shifts={shifts}
                    onEdit={setForm}
                    onDelete={(shift) => void remove(shift)}
                  />
                </div>
                <UsersPagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </section>
      </div>
      {form && (
        <ShiftFormModal
          key={form === "new" ? "new" : form.id}
          shift={form}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      {toast && (
        <p
          role="status"
          className="fixed right-5 top-5 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </p>
      )}
    </section>
  );
}
