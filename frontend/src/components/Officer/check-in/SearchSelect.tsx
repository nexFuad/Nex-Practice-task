"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SearchSelect({
  label,
  placeholder,
  value,
  query,
  setQuery,
  options,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string;
  query: string;
  setQuery: (value: string) => void;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.id === value);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={root} className="relative">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm shadow-sm outline-none hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
      >
        <span
          className={
            selected ? "truncate text-slate-900" : "truncate text-slate-400"
          }
        >
          {selected?.label ?? `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="mt-2 max-h-48 overflow-y-auto pr-1">
            {options.length ? (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-100 ${value === option.id ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-slate-500">No matching options.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
