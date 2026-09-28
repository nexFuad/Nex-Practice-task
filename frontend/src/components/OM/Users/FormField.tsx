import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
const labelStyle = "mb-1.5 block text-xs font-medium text-slate-800";
export function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className={labelStyle}>
      {children}
      {required && <span className="ml-2 text-red-500">*</span>}
    </label>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-md border border-slate-200 px-3 py-1 text-sm outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${props.className ?? ""}`}
    />
  );
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-16 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${props.className ?? ""}`}
    />
  );
}
