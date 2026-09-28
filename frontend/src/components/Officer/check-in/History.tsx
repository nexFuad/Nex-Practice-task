"use client";

import { Search } from "lucide-react";
import { Table, type TableColumn } from "@/components/Shared/Table";
import { AppSelect } from "@/components/Shared/AppSelect";
import type { OfficerRecord } from "@/Services/officerAttendance";
import { time } from "@/lib/officerAttendanceUtils";
import { Timing } from "./Timing";
import { PhotoButton } from "./PhotoButton";

export function History({
  records,
  total,
  page,
  query,
  type,
  date,
  setPage,
  setQuery,
  setType,
  setDate,
  onPreview,
  loading,
}: {
  records: OfficerRecord[];
  total: number;
  page: number;
  query: string;
  type: string;
  date: string;
  setPage: (n: number) => void;
  setQuery: (v: string) => void;
  setType: (v: string) => void;
  setDate: (v: string) => void;
  onPreview: (url: string) => void;
  loading: boolean;
}) {
  const columns: TableColumn<OfficerRecord>[] = [
    {
      id: "date",
      header: "Date",
      minWidth: "120px",
      cell: (record) => new Date(record.shiftDate).toLocaleDateString("en-GB"),
    },
    {
      id: "site",
      header: "Site / Post",
      minWidth: "150px",
      cell: (record) => record.siteName ?? "-",
    },
    {
      id: "shift",
      header: "Shift",
      minWidth: "160px",
      cell: (record) => (
        <>
          <p>{record.shiftType ?? "-"}</p>
          <span className="text-xs text-slate-500">
            {record.shiftStart} – {record.shiftEnd}
          </span>
        </>
      ),
    },
    {
      id: "check-in",
      header: "Check-In",
      minWidth: "150px",
      cell: (record) => (
        <>
          <p>{time(record.checkInAt)}</p>
          <Timing
            status={record.checkInTimingStatus}
            variance={record.checkInVarianceMinutes}
            action="in"
          />
        </>
      ),
    },
    {
      id: "check-out",
      header: "Check-Out",
      minWidth: "150px",
      cell: (record) => (
        <>
          <p>{time(record.checkOutAt)}</p>
          <Timing
            status={record.checkOutTimingStatus}
            variance={record.checkOutVarianceMinutes}
            action="out"
          />
        </>
      ),
    },
    {
      id: "in-photo",
      header: "Check-In Photo",
      minWidth: "150px",
      cell: (record) => (
        <PhotoButton url={record.checkInImageUrl} onPreview={onPreview} />
      ),
    },
    {
      id: "out-photo",
      header: "Check-Out Photo",
      minWidth: "150px",
      cell: (record) => (
        <PhotoButton url={record.checkOutImageUrl} onPreview={onPreview} />
      ),
    },
    {
      id: "status",
      header: "Status",
      minWidth: "150px",
      cell: (record) => (
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          {record.status.replaceAll("_", " ")}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location Validation",
      minWidth: "190px",
      cell: (record) => (
        <span className="text-xs text-emerald-700">
          {record.checkOutValidationStatus ??
            record.checkInValidationStatus ??
            "-"}
        </span>
      ),
    },
  ];
  return (
    <section className="mt-7 flex min-h-185 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="relative min-w-0 flex-1 sm:min-w-55">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Search site, shift or date"
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
          />
        </label>
        <AppSelect
          value={type}
          label="Filter attendance by type"
          onValueChange={(value) => {
            setPage(1);
            setType(value);
          }}
          className="h-10 w-full sm:w-auto"
          options={[{ value: "ALL", label: "All" }, { value: "CHECK_IN", label: "Check In" }, { value: "CHECK_OUT", label: "Check Out" }]}
        />
        <input
          type="date"
          value={date}
          onChange={(event) => {
            setPage(1);
            setDate(event.target.value);
          }}
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm sm:w-auto"
        />
      </div>
      <Table
        columns={columns}
        rows={records}
        getRowId={(record) => record.id}
        loading={loading}
        page={page}
        pageSize={10}
        totalItems={total}
        onPageChange={setPage}
        emptyMessage="No attendance records found."
        tableMinWidth="1520px"
        className="mt-4 flex-1 shadow-none"
      />
    </section>
  );
}
