import type { ReactNode } from "react";
import { FieldLabel, Input, Select } from "../FormField";

export function DateField({ label, required, value, onChange }: { label: string; required?: boolean; value: string; onChange: (value: string) => void }) { return <div><FieldLabel required={required}>{label}</FieldLabel><Input type="date" value={value} required={required} onChange={(event) => onChange(event.target.value)} /></div>; }
export function Choice({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder: string }) { return <div><FieldLabel>{label}</FieldLabel><Select value={value} onChange={(event) => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map((item) => <option key={item}>{item}</option>)}</Select></div>; }
export function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className="h-10 min-w-40 rounded-md bg-neutral-900 px-5 text-sm font-medium text-white">{children}</button>; }
export function CancelButton({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm">{children}</button>; }
