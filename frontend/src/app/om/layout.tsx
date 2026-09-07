import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/Shared/DashboardSidebar";

export default function OmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
