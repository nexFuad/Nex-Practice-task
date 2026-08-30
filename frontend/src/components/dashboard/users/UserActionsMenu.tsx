"use client";

import { CalendarDays, ClipboardList, Edit3, EllipsisVertical, KeyRound, MapPin, Shield, Trash2, UserRoundX, Waypoints } from "lucide-react";
import { useEffect, useRef } from "react";

const items = [[Edit3, "Edit User"], [MapPin, "View Assigned Sites"], [Waypoints, "Assign to Sites"], [CalendarDays, "View Schedule"], [ClipboardList, "Bio data"], [Shield, "Reset Password"], [UserRoundX, "Suspend User"], [KeyRound, "Resign User"]] as const;

export function UserActionsMenu({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) onClose(); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, [onClose]);
  return <div ref={rootRef} className="relative inline-flex"><button type="button" onClick={(event) => { event.stopPropagation(); onToggle(); }} className="grid size-8 place-items-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="User actions" aria-expanded={open}><EllipsisVertical className="size-5" /></button>{open && <div className="absolute right-0 top-9 z-30 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl">{items.map(([Icon, label]) => <button key={label} type="button" onClick={onClose} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"><Icon className="size-4 text-slate-500" />{label}</button>)}<div className="my-1 border-t border-slate-200" /><button type="button" onClick={onClose} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50"><Trash2 className="size-4" />Delete User</button></div>}</div>;
}
