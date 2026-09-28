"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppSelect } from "@/components/Shared/AppSelect";
import {
  allowanceOptions,
  deductionOptions,
  type Allowance,
  type Deduction,
} from "@/Types/payroll.config";

export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-blue-800">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-slate-700">{children}</p>;
}
export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${readOnly ? "bg-slate-50 text-slate-500" : ""}`}
      />
    </label>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
      <AppSelect
        value={value}
        required={required}
        label={label}
        placeholder={`Select ${label.toLowerCase()}`}
        onValueChange={onChange}
        className="mt-1.5 h-10 w-full"
        options={options.map((option) => ({
          value: option.replace(/ \(Added\)$/, ""),
          label: option,
          disabled: option.endsWith(" (Added)"),
        }))}
      />
    </label>
  );
}
export function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={label}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
export function RecordPanel({
  title,
  label,
  rows,
  draft,
  setDraft,
  editIndex,
  onAdd,
  onEdit,
  onRemove,
  allowance = false,
}: {
  title: string;
  label: string;
  rows: Allowance[] | Deduction[];
  draft: Allowance | Deduction;
  setDraft: (row: Allowance & Deduction) => void;
  editIndex: number | null;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  allowance?: boolean;
}) {
  const row = draft as Allowance & Deduction;
  return (
    <Panel title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={label}
          value={row.name}
          onChange={(value) => setDraft({ ...row, name: value })}
          options={allowance ? allowanceOptions : deductionOptions}
        />
        <Field
          label="Amount"
          type="number"
          value={row.amount}
          onChange={(value) => setDraft({ ...row, amount: value })}
          placeholder="Enter amount"
        />
        {allowance ? (
          <Select
            label="Calculation Rule (Optional)"
            value={row.calculationRule}
            onChange={(value) => setDraft({ ...row, calculationRule: value })}
            options={["Attendance-based", "Prorated", "Fixed amount"]}
          />
        ) : (
          <>
            <Field
              label="Account Number"
              value={row.accountNumber}
              onChange={(value) => setDraft({ ...row, accountNumber: value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={row.deductBeforeGross}
                onChange={(event) =>
                  setDraft({ ...row, deductBeforeGross: event.target.checked })
                }
              />
              Deduct Before Gross Pay?
            </label>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-neutral-950 px-5 text-sm font-medium text-white"
      >
        <Plus className="size-4" />
        {editIndex === null ? "Add" : "Update"}
      </button>
      <DataTable
        headers={
          allowance
            ? ["Allowance Type", "Amount", "Calculation Rule"]
            : [
                "Deduction Type",
                "Amount",
                "Account Number",
                "Deduct Before Gross Pay?",
              ]
        }
        rows={rows.map((item) =>
          allowance
            ? [
                item.name,
                item.amount,
                (item as Allowance).calculationRule || "—",
              ]
            : [
                item.name,
                item.amount,
                (item as Deduction).accountNumber,
                (item as Deduction).deductBeforeGross ? "Yes" : "No",
              ],
        )}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </Panel>
  );
}
export function DataTable({
  headers,
  rows,
  onEdit,
  onRemove,
}: {
  headers: string[];
  rows: string[][];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 font-semibold whitespace-nowrap"
              >
                {header}
              </th>
            ))}
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={`${row.join("-")}-${index}`}
                className="border-b last:border-0"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    {cell || "—"}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label="Edit record"
                      onClick={() => onEdit(index)}
                      className="text-blue-600"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete record"
                      onClick={() => onRemove(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-4 py-8 text-center text-slate-500"
              >
                No records to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export function Secondary({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
