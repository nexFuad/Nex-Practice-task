import type { ReactNode } from "react";
import { OperationsSidebar } from "@/components/dashboard/OperationsSidebar";
export default function OmLayout({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-slate-50 lg:flex"><OperationsSidebar /><main className="min-w-0 flex-1">{children}</main></div>; }
