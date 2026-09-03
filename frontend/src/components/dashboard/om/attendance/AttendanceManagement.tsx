"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceEmployees,
  getAttendanceSites,
  updateAttendance,
} from "./attendance.api";
import { getShiftOptions } from "@/components/dashboard/om/shifts/shifts.api";
import { AttendanceFormModal } from "./AttendanceFormModal";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceToolbar } from "./AttendanceToolbar";
import { UsersPagination } from "../users/UsersPagination";
import { TableSkeleton } from "../TableSkeleton";
import type { AttendanceFormValues, AttendanceRecord } from "./types";

const PAGE_SIZE = 10;
const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const shiftMonth = (month: string, amount: number) => {
  const [year, index] = month.split("-").map(Number);
  return monthKey(new Date(year, index - 1 + amount, 1));
};
const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(`${month}-01T00:00:00`),
  );

export function AttendanceManagement() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const [employeeId, setEmployeeId] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AttendanceRecord | null | "new">(null);
  const [toast, setToast] = useState("");
  const [mutationError, setMutationError] = useState("");
  const deferredQuery = useDeferredValue(query);
  const queryClient = useQueryClient();
  const attendanceQuery = useQuery({
    queryKey: [
      "attendance",
      { month, employeeId, query: deferredQuery, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () =>
      getAttendance(month, employeeId, deferredQuery, page, PAGE_SIZE),
    placeholderData: (previous) => previous,
  });
  const employeesQuery = useQuery({
    queryKey: ["attendance-employees", month],
    queryFn: () => getAttendanceEmployees(month),
  });
  const sitesQuery = useQuery({
    queryKey: ["attendance-site-options"],
    queryFn: getAttendanceSites,
  });
  const shiftsQuery = useQuery({
    queryKey: ["attendance-shift-options"],
    queryFn: () => getShiftOptions(),
  });
  const invalidateAttendance = () =>
    void queryClient.invalidateQueries({ queryKey: ["attendance"] });
  const saveMutation = useMutation({
    mutationFn: ({
      record,
      values,
    }: {
      record: AttendanceRecord | null;
      values: Partial<AttendanceFormValues>;
    }) =>
      record ? updateAttendance(record.id, values) : createAttendance(values),
    onSuccess: (_, { record }) => {
      setEditing(null);
      setToast(
        record ? "Attendance record updated." : "Attendance record added.",
      );
      invalidateAttendance();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      setToast("Attendance record deleted.");
      invalidateAttendance();
    },
  });
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const result = attendanceQuery.data;
  const records = result?.records ?? [];
  const stats = result?.stats ?? { total: 0, onDuty: 0, completed: 0 };
  const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const loadError =
    attendanceQuery.error instanceof Error
      ? attendanceQuery.error.message
      : attendanceQuery.error
        ? "Unable to load attendance."
        : "";
  const optionError =
    employeesQuery.error || sitesQuery.error || shiftsQuery.error
      ? "Unable to load attendance form options."
      : "";
  const exportRows = () => {
    const header =
      "Employee ID,Employee,Site,Date,Shift,Check In,Check Out,Status";
    const rows = records.map((record) =>
      [
        record.employeeId,
        record.employeeName,
        record.siteName ?? "",
        record.shiftDate.slice(0, 10),
        `${record.shiftStart}-${record.shiftEnd}`,
        record.checkInAt ?? "",
        record.checkOutAt ?? "",
        record.status,
      ]
        .map((value) => `\"${String(value).replaceAll('\"', '\"\"')}\"`)
        .join(","),
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([[header, ...rows].join("\n")], { type: "text/csv" }),
    );
    link.download = `attendance-${month}-page-${currentPage}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const save = async (values: Partial<AttendanceFormValues>) => {
    try {
      setMutationError("");
      await saveMutation.mutateAsync({
        record: editing === "new" ? null : editing,
        values,
      });
    } catch (cause) {
      setMutationError(
        cause instanceof Error ? cause.message : "Unable to save attendance.",
      );
    }
  };
  const remove = async (record: AttendanceRecord) => {
    if (!window.confirm(`Delete attendance for ${record.employeeName}?`))
      return;
    try {
      setMutationError("");
      await deleteMutation.mutateAsync(record.id);
    } catch (cause) {
      setMutationError(
        cause instanceof Error
          ? cause.message
          : "Unable to delete attendance record.",
      );
    }
  };

  return (
    <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
      <div className="min-w-0 px-5 pb-5 pt-2 text-slate-800">
        <div className="space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-slate-800">
                Attendance
              </h1>
              <p className="text-sm text-slate-500">
                Monthly attendance overview for officers and operations
                managers.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => {
                  setMonth((value) => shiftMonth(value, -1));
                  setPage(1);
                }}
                className="grid size-8 place-items-center rounded-md hover:bg-slate-100"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-30 text-center text-sm font-medium text-slate-900">
                {monthLabel(month)}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => {
                  setMonth((value) => shiftMonth(value, 1));
                  setPage(1);
                }}
                className="grid size-8 place-items-center rounded-md hover:bg-slate-100"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </header>
          <AttendanceStats {...stats} />
          <section className="space-y-4">
            <AttendanceToolbar
              employees={employeesQuery.data ?? []}
              employeeId={employeeId}
              query={query}
              busy={attendanceQuery.isFetching}
              onEmployee={(value) => {
                setEmployeeId(value);
                setPage(1);
              }}
              onQuery={(value) => {
                setQuery(value);
                setPage(1);
              }}
              onRefresh={() => void attendanceQuery.refetch()}
              onAdd={() => setEditing("new")}
              onExport={exportRows}
            />
            {(mutationError || loadError || optionError) && (
              <p
                role="alert"
                className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {mutationError || loadError || optionError}
              </p>
            )}
            <section className="flex min-h-160 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white py-6 shadow-sm">
              {attendanceQuery.isLoading ? (
                <TableSkeleton columns={10} className="min-h-140" />
              ) : (
                <>
                  <AttendanceTable
                    records={records}
                    onEdit={setEditing}
                    onDelete={(record) => void remove(record)}
                  />
                  <UsersPagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </section>
          </section>
        </div>
      </div>
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-5 z-60 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
      {editing && (
        <AttendanceFormModal
          key={editing === "new" ? "new" : editing.id}
          record={editing === "new" ? null : editing}
          employees={employeesQuery.data ?? []}
          sites={sitesQuery.data ?? []}
          shifts={shiftsQuery.data ?? []}
          onClose={() => setEditing(null)}
          onSave={save}
          onWarning={setToast}
        />
      )}
    </main>
  );
}
