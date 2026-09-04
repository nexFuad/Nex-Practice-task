import { Pencil, Trash2 } from "lucide-react";
import type { EmploymentRecord, PwmHistory } from "@/Services/employment";
const date = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en-GB").format(new Date(value)) : "—";
export function EmploymentTable({
  records,
  loading,
  onEdit,
  onDelete,
}: {
  records: EmploymentRecord[];
  loading: boolean;
  onEdit: (item: EmploymentRecord) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const headers = [
    "Date Join",
    "Date Left",
    "Status",
    "Remarks",
    "Probation Period",
    "Notice Period",
    "Notification Date",
    "Confirmation Date",
    "Insert Date",
    "Action",
  ];
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[980px] w-full text-left text-xs">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10} className="px-3 py-7 text-center text-slate-500">
                Loading employment records…
              </td>
            </tr>
          ) : records.length ? (
            records.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-200 bg-slate-50/70"
              >
                <td className="px-3 py-3">{date(item.dateJoin)}</td>
                <td className="px-3 py-3">{date(item.dateLeft)}</td>
                <td className="px-3 py-3">{item.status}</td>
                <td className="px-3 py-3">{item.remarks ?? "—"}</td>
                <td className="px-3 py-3">{item.probationPeriod ?? "—"}</td>
                <td className="px-3 py-3">{item.noticePeriod ?? "—"}</td>
                <td className="px-3 py-3">{date(item.notificationDate)}</td>
                <td className="px-3 py-3">{date(item.confirmationDate)}</td>
                <td className="px-3 py-3">{date(item.createdAt)}</td>
                <td className="px-3 py-3">
                  <Buttons item={item} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="px-3 py-7 text-center text-slate-500">
                No employment records added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export function PwmHistoryTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: {
  rows: PwmHistory[];
  loading: boolean;
  onEdit: (item: PwmHistory) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[540px] w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Role Start Date</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="px-4 py-7 text-center text-slate-500">
                Loading PWM history…
              </td>
            </tr>
          ) : rows.length ? (
            rows.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-200 bg-slate-50/70"
              >
                <td className="px-4 py-3">{item.role}</td>
                <td className="px-4 py-3">{date(item.roleStartDate)}</td>
                <td className="px-4 py-3">
                  <Buttons item={item} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-4 py-7 text-center text-slate-500">
                No PWM employment history added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function Buttons<T extends { id: string }>({
  item,
  onEdit,
  onDelete,
}: {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button onClick={() => onEdit(item)} className="text-blue-600">
        <Pencil className="size-4" />
      </button>
      <button onClick={() => void onDelete(item.id)} className="text-red-500">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
