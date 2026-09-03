import { Pencil, Trash2 } from "lucide-react";
import type { Shift } from "./types";

export function ShiftsTable({
  shifts,
  onEdit,
  onDelete,
}: {
  shifts: Shift[];
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
}) {
  const headings = [
    "Name",
    "Code",
    "Color",
    "Time",
    "Duration",
    "Status",
    "Actions",
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-230 w-full text-sm">
        <thead className="border-b border-slate-200">
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                className="h-10 whitespace-nowrap px-2 text-left font-medium"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.length === 0 ? (
            <tr>
              <td
                colSpan={headings.length}
                className="h-64 text-center text-slate-500"
              >
                No shifts found.
              </td>
            </tr>
          ) : (
            shifts.map((shift) => (
              <tr
                key={shift.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="p-2 font-medium whitespace-nowrap">
                  {shift.name}
                </td>
                <td className="p-2 whitespace-nowrap">{shift.code}</td>
                <td className="p-2">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span
                      className="size-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: shift.color }}
                      aria-hidden="true"
                    />
                    {shift.color}
                  </span>
                </td>
                <td className="p-2 whitespace-nowrap">
                  {shift.startTime} – {shift.endTime}
                </td>
                <td className="p-2 whitespace-nowrap">
                  {shift.durationHours} hrs
                </td>
                <td className="p-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${shift.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
                  >
                    {shift.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(shift)}
                      className="grid size-8 place-items-center rounded-md text-blue-600 hover:bg-blue-50"
                      aria-label="Edit shift"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(shift)}
                      className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50"
                      aria-label="Delete shift"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
