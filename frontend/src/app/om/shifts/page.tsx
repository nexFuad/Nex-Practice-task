"use client";

import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createShift,
  deleteShift,
  getShifts,
  updateShift,
  type PaginatedShifts,
} from "@/Services/shift";
import { ShiftFormModal } from "./ShiftFormModal";
import { ShiftStats } from "./ShiftStats";
import { Table, type TableAction, type TableColumn } from "@/Shared/Table";
import type { Shift, ShiftPayload } from "@/Types/shiftTypes";
import { useSearchBar } from "@/Hooks/useSearchBar";

const PAGE_SIZE = 10;

export default function ShiftsPage() {
  const { query, debouncedQuery, setQuery } = useSearchBar();
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Shift | "new" | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: loading,
    isFetching,
    error: queryError,
  } = useQuery<PaginatedShifts>({
    queryKey: [
      "shifts",
      { query: debouncedQuery, status, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () =>
      getShifts({ query: debouncedQuery, status, page, pageSize: PAGE_SIZE }),
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

  const columns = useMemo<TableColumn<Shift>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        minWidth: "170px",
        cell: (shift) => <span className="font-medium">{shift.name}</span>,
      },
      {
        id: "code",
        header: "Code",
        minWidth: "150px",
        cell: (shift) => shift.code,
      },
      {
        id: "color",
        header: "Color",
        minWidth: "170px",
        cell: (shift) => (
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-full border border-slate-300"
              style={{ backgroundColor: shift.color }}
            />
            {shift.color}
          </span>
        ),
      },
      {
        id: "time",
        header: "Time",
        minWidth: "170px",
        cell: (shift) => `${shift.startTime} – ${shift.endTime}`,
      },
      {
        id: "duration",
        header: "Duration",
        minWidth: "120px",
        cell: (shift) => `${shift.durationHours} hrs`,
      },
      {
        id: "status",
        header: "Status",
        minWidth: "120px",
        cell: (shift) => (
          <span
            className={
              shift.status === "ACTIVE"
                ? "rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                : "rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            }
          >
            {shift.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );
  const actions: TableAction<Shift>[] = [
    { label: "Edit shift", icon: Pencil, onClick: setForm },
    {
      label: "Delete shift",
      icon: Trash2,
      danger: true,
      onClick: (shift) => void remove(shift),
    },
  ];
  return (
    <section className="min-w-0 px-5 pb-5 pt-2 text-slate-800">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Shift Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage shift schedules and site assignments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm("new")}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 sm:h-9"
          >
            <Plus className="size-4" />
            Add Shift
          </button>
        </header>
        <ShiftStats values={stats} />
        <section className="flex flex-col">
          <div className="flex flex-1 flex-col space-y-4 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  All Shifts
                </h1>
                <p className="text-sm text-slate-500">
                  Manage shift schedules and site assignments
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className="h-8 min-w-36 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
                >
                  <Download className="size-4" />
                  Export
                </button>
              </div>
            </div>
            {visibleError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {visibleError}
              </p>
            )}
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search shifts..."
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>
        <Table
          columns={columns}
          rows={shifts}
          getRowId={(shift) => shift.id}
          actions={actions}
          loading={loading || isFetching}
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={data?.total ?? 0}
          onPageChange={setPage}
          emptyMessage="No shifts found."
        />
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
