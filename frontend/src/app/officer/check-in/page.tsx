"use client";
/* eslint-disable @next/next/no-img-element -- Attendance photos use stored external URLs. */

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { ErrorDisplay } from "@/components/error/ErrorDisplay";
import { activeAttendance, attendanceHistory, attendanceOptions } from "@/Services/officerAttendance";
import { AttendanceModal } from "@/components/Officer/check-in/AttendanceModal";
import { DailyDutyCard } from "@/components/Officer/check-in/DailyDutyCard";
import { History } from "@/components/Officer/check-in/History";

export default function OfficerCheckInPage() {
  const [page, setPage] = useState(1);
  const { query, debouncedQuery, setQuery } = useSearchBar();
  const [type, setType] = useState("ALL");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<"in" | "out" | null>(null);
  const [toast, setToast] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const optionsQuery = useQuery({
    queryKey: ["officer", "attendance", "options"],
    queryFn: attendanceOptions,
  });
  const activeQuery = useQuery({
    queryKey: ["officer", "attendance", "active"],
    queryFn: activeAttendance,
  });
  const historyQuery = useQuery({
    queryKey: [
      "officer",
      "attendance",
      "history",
      page,
      debouncedQuery,
      type,
      date,
    ],
    queryFn: () => attendanceHistory(page, debouncedQuery, type, date),
  });
  const sites = optionsQuery.data?.sites ?? [];
  const shifts = optionsQuery.data?.shifts ?? [];
  const active = activeQuery.data?.record ?? null;
  const todayRecord = activeQuery.data?.todayRecord ?? null;
  const records = historyQuery.data?.records ?? [];
  const total = historyQuery.data?.total ?? 0;
  const success = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4_000);
  };
  return (
    <section className="p-5 sm:p-7 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Record your check-in and check-out for your assigned duty.
          </p>
        </div>
      </div>
      {toast && (
        <p
          className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"
          role="status"
        >
          {toast}
        </p>
      )}
      {activeQuery.error && !activeQuery.data ? (
        <ErrorDisplay kind="unexpected" variant="inline" error={activeQuery.error} onRetry={() => void activeQuery.refetch()} />
      ) : <DailyDutyCard
        record={todayRecord}
        active={active}
        loading={activeQuery.isLoading}
        onAction={() => setMode(active ? "out" : "in")}
      />}
      {historyQuery.error && !historyQuery.data ? (
        <ErrorDisplay kind="unexpected" variant="inline" error={historyQuery.error} onRetry={() => void historyQuery.refetch()} />
      ) : <History
        records={records}
        total={total}
        page={page}
        query={query}
        type={type}
        date={date}
        setPage={setPage}
        setQuery={setQuery}
        setType={setType}
        setDate={setDate}
        onPreview={setPhotoPreview}
        loading={historyQuery.isLoading}
      />}
      {optionsQuery.error && !optionsQuery.data && (
        <ErrorDisplay kind="unexpected" variant="inline" error={optionsQuery.error} onRetry={() => void optionsQuery.refetch()} />
      )}
      {mode && (
        <AttendanceModal
          mode={mode}
          sites={sites}
          shifts={shifts}
          active={active}
          onClose={() => setMode(null)}
          onSaved={async (message) => {
            setMode(null);
            success(message);
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: ["officer", "attendance", "active"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["officer", "attendance", "history"],
              }),
            ]);
          }}
        />
      )}
      {photoPreview && (
        <div
          className="fixed inset-0 z-70 grid place-items-center bg-slate-950/60 p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <img
            src={photoPreview}
            alt="Attendance photo"
            className="max-h-[85vh] max-w-full rounded-lg bg-white object-contain shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
