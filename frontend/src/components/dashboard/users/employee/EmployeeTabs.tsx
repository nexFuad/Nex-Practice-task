import { BriefcaseBusiness, ContactRound, WalletCards } from "lucide-react";
import { tabs } from "./constants";
const icons = [ContactRound, BriefcaseBusiness, WalletCards];
export type EmployeeTab = "Basic" | "Employment" | "Payroll";
export function EmployeeTabs({ activeTab, onChange }: { activeTab: EmployeeTab; onChange: (tab: EmployeeTab) => void }) { return <nav className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-3">{tabs.map((tab, index) => { const current = tab as EmployeeTab; const Icon = icons[index]; return <button key={tab} type="button" onClick={() => onChange(current)} className={`flex h-10 items-center justify-center gap-2 rounded-md text-xs font-semibold uppercase tracking-wide ${activeTab === current ? "bg-neutral-950 text-white shadow" : "text-slate-600 hover:bg-white"}`}><Icon className="size-4" />{tab}</button>; })}</nav>; }
