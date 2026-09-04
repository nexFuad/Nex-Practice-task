"use client";

/* eslint-disable @next/next/no-img-element -- Attendance thumbnails use stored photo URLs. */
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceActiveEmployees,
  getAttendanceEmployees,
  getAttendanceSites,
  updateAttendance,
} from "@/Services/attendance";
import { getShiftOptions } from "@/Services/shift";
import { AttendanceFormModal } from "./AttendanceFormModal";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceToolbar } from "./AttendanceToolbar";
import type {
  AttendanceFormValues,
  AttendanceRecord,
} from "@/Types/attendanceTypes";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { Table, type TableAction, type TableColumn } from "@/Shared/Table";

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
const dateText = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
const timeText = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
const mapUrl = (lat: number | null, lng: number | null) =>
  lat !== null && lng !== null
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : undefined;
function AttendancePhoto({
  url,
  label,
}: {
  url: string | null;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {url ? (
        <img
          src={url}
          alt={`${label} attendance`}
          className="size-12 rounded-md border border-slate-200 object-cover"
        />
      ) : (
        <span className="grid size-12 place-items-center rounded-md border border-dashed border-slate-200 text-slate-400">
          <ImageOff className="size-4" />
        </span>
      )}
      <span className="text-[10px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

export default function AttendancePage() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const [employeeId, setEmployeeId] = useState("");
  const { query, debouncedQuery, setQuery } = useSearchBar();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AttendanceRecord | null | "new">(null);
  const [toast, setToast] = useState("");
  const [mutationError, setMutationError] = useState("");
  const queryClient = useQueryClient();
  const attendanceQuery = useQuery({
    queryKey: [
      "attendance",
      { month, employeeId, query: debouncedQuery, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () =>
      getAttendance(month, employeeId, debouncedQuery, page, PAGE_SIZE),
    placeholderData: (previous) => previous,
  });
  const employeesQuery = useQuery({
    queryKey: ["attendance-employees", month],
    queryFn: () => getAttendanceEmployees(month),
  });
  const activeEmployeesQuery = useQuery({
    queryKey: ["attendance-active-employees"],
    queryFn: getAttendanceActiveEmployees,
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
  const loadError =
    attendanceQuery.error instanceof Error
      ? attendanceQuery.error.message
      : attendanceQuery.error
        ? "Unable to load attendance."
        : "";
  const optionError =
    employeesQuery.error ||
    activeEmployeesQuery.error ||
    sitesQuery.error ||
    shiftsQuery.error
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
    link.download = `attendance-${month}-page-${page}.csv`;
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

  const columns = useMemo<TableColumn<AttendanceRecord>[]>(
    () => [
      {
        id: "employee",
        header: "OM/Officer",
        minWidth: "220px",
        cell: (record) => (
          <div>
            <p className="font-medium">{record.employeeName}</p>
            <p className="text-xs text-slate-500">ID: {record.employeeId}</p>
          </div>
        ),
      },
      {
        id: "site",
        header: "Site / Post",
        minWidth: "190px",
        cell: (record) => (
          <div>
            <p className="font-medium">{record.siteName ?? "Unassigned"}</p>
            <p className="text-xs text-slate-500">
              Code: {record.siteCode ?? "—"}
            </p>
          </div>
        ),
      },
      {
        id: "shift",
        header: "Shift",
        minWidth: "180px",
        cell: (record) => (
          <div>
            <p className="font-medium">
              {record.shiftStart} – {record.shiftEnd}
            </p>
            <p className="text-xs text-slate-500">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(record.shiftDate))}
            </p>
          </div>
        ),
      },
      {
        id: "type",
        header: "Shift Type",
        minWidth: "150px",
        cell: (record) => (
          <span className="font-medium">{record.shiftType ?? "—"}</span>
        ),
      },
      {
        id: "photos",
        header: "Photos",
        minWidth: "190px",
        cell: (record) => (
          <div className="flex gap-4">
            <AttendancePhoto url={record.checkInImageUrl} label="Check-in" />
            <AttendancePhoto url={record.checkOutImageUrl} label="Check-out" />
          </div>
        ),
      },
      {
        id: "checkin",
        header: "Check-in",
        minWidth: "150px",
        cell: (record) => (
          <div>
            <p className="font-medium">{timeText(record.checkInAt)}</p>
            <p className="text-xs text-slate-500">
              {record.checkInAt ? dateText(record.checkInAt) : "—"}
            </p>
          </div>
        ),
      },
      {
        id: "checkout",
        header: "Check-out",
        minWidth: "150px",
        cell: (record) => (
          <div>
            <p className="font-medium">{timeText(record.checkOutAt)}</p>
            <p className="text-xs text-slate-500">
              {record.checkOutAt ? dateText(record.checkOutAt) : "—"}
            </p>
          </div>
        ),
      },
      {
        id: "gps",
        header: "GPS Location",
        minWidth: "180px",
        cell: (record) => (
          <div className="space-y-2">
            {[
              [
                "Check-in",
                mapUrl(record.checkInLatitude, record.checkInLongitude),
              ],
              [
                "Check-out",
                mapUrl(record.checkOutLatitude, record.checkOutLongitude),
              ],
            ].map(([label, url]) => (
              <div key={String(label)} className="flex items-center gap-2">
                <MapPin className="size-3.5 text-blue-600" />
                {url ? (
                  <a
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium hover:text-blue-600"
                  >
                    {label}: View map
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">{label}: —</span>
                )}
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        minWidth: "150px",
        cell: (record) => (
          <span
            className={
              record.status === "COMPLETED"
                ? "rounded-md bg-blue-600 px-2 py-0.5 text-xs font-medium text-white"
                : record.status === "ON_DUTY"
                  ? "rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                  : "rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            }
          >
            {record.status === "COMPLETED"
              ? "Completed Shift"
              : record.status === "ON_DUTY"
                ? "On Duty"
                : "Absent"}
          </span>
        ),
      },
    ],
    [],
  );
  const actions: TableAction<AttendanceRecord>[] = [
    { label: "Edit attendance", icon: Pencil, onClick: setEditing },
    {
      label: "Delete attendance",
      icon: Trash2,
      danger: true,
      onClick: (record) => void remove(record),
    },
  ];
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
            <Table
              columns={columns}
              rows={records}
              getRowId={(record) => record.id}
              actions={actions}
              loading={attendanceQuery.isLoading || attendanceQuery.isFetching}
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={result?.total ?? 0}
              onPageChange={setPage}
              emptyMessage="No attendance records found for this month."
            />
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
          employees={activeEmployeesQuery.data ?? []}
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
