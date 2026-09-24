"use client";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ContactRound,
  WalletCards,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BasicEmployeeForm } from "@/components/OM/Users/BasicEmployeeForm";
import { Suspense, useState } from "react";
import { EmploymentRecords } from "@/components/OM/Users/Employment/EmploymentRecords";
import { PayrollForm } from "@/components/OM/Users/PayrollForm";
import { tabs } from "@/components/OM/Users/constants";

type EmployeeTab = "Basic" | "Employment" | "Payroll";
const employeeTabIcons = [ContactRound, BriefcaseBusiness, WalletCards];

function CreateNewEmployeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employeeId, setEmployeeId] = useState(
    searchParams.get("employeeId") ?? "",
  );
  const requestedTab =
    searchParams.get("tab") === "employment"
      ? "Employment"
      : searchParams.get("tab") === "payroll"
        ? "Payroll"
        : "Basic";
  const [activeTab, setActiveTab] = useState<EmployeeTab>(requestedTab);
  const changeTab = (tab: EmployeeTab) => setActiveTab(tab);
  const heading =
    activeTab === "Employment"
      ? "Configure employment records"
      : activeTab === "Payroll"
        ? "Configure payroll records"
        : "Configure basic details";
  const basicSaved = (savedEmployeeId: string) => {
    setEmployeeId(savedEmployeeId);
    setActiveTab("Employment");
    router.replace(
      `/om/users/create-new-employee?employeeId=${encodeURIComponent(savedEmployeeId)}&tab=employment`,
    );
  };
  return (
    <section className="p-5 text-slate-800 sm:p-7 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employee Registration Form</h1>
          <p className="mt-1 text-base text-slate-500">
            Create new employee with basic, employment, and payroll details
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/om/users")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Users
        </button>
      </header>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <nav className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-3">
          {tabs.map((tab, index) => {
            const current = tab as EmployeeTab;
            const Icon = employeeTabIcons[index];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => changeTab(current)}
                className={`flex h-10 items-center justify-center gap-2 rounded-md text-xs font-semibold uppercase tracking-wide ${activeTab === current ? "bg-neutral-950 text-white shadow" : "text-slate-600 hover:bg-white"}`}
              >
                <Icon className="size-4" />
                {tab}
              </button>
            );
          })}
        </nav>
        <h2 className="mt-7 text-lg font-semibold text-blue-800">{heading}</h2>
        <div className="mt-5">
          {activeTab === "Basic" && <BasicEmployeeForm onSaved={basicSaved} />}
          {activeTab === "Employment" && (
            <EmploymentRecords
              employeeId={employeeId}
              onPrevious={() => changeTab("Basic")}
              onNext={() => changeTab("Payroll")}
            />
          )}
          <div className={activeTab === "Payroll" ? "" : "hidden"}>
            <PayrollForm
              userId={employeeId || undefined}
              onPrevious={() => changeTab("Employment")}
              onNext={() => changeTab("Basic")}
              onExit={() => router.push("/om/users")}
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default function CreateNewEmployeePage() {
  return (
    <Suspense fallback={<div className="p-5 text-slate-500">Loading employee form...</div>}>
      <CreateNewEmployeeForm />
    </Suspense>
  );
}
