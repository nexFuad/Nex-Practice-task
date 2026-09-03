"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BasicEmployeeForm } from "./BasicEmployeeForm";
import { EmployeeTabs, type EmployeeTab } from "./EmployeeTabs";
import { Toast } from "../../sites/Toast";
import { EmploymentRecords } from "./employment/EmploymentRecords";
import { PayrollForm } from "./PayrollForm";
import { getUser, type EditableEmployee } from "../users.api";
import type { EmployeeFormValues } from "./types";

const formId = "edit-employee-form";

export function EditEmployeePage() {
  const router = useRouter();
  const params = useParams<{ employeeId: string }>();
  const userId = decodeURIComponent(params.employeeId ?? "");
  const [activeTab, setActiveTab] = useState<EmployeeTab>("Basic");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();
  const { data: employee = null, isLoading: loading, error: queryError } = useQuery<EditableEmployee>({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
  });
  const error = queryError instanceof Error ? queryError.message : queryError ? "Unable to load employee details." : "";
  const refreshEmployee = () => void queryClient.invalidateQueries({ queryKey: ["users", userId] });

  const heading: Record<EmployeeTab, string> = {
    Basic: "Configure basic details",
    Employment: "Configure employment records",
    Payroll: "Configure payroll records",
  };

  if (loading) return <section aria-busy="true" className="animate-pulse p-5 sm:p-7 lg:p-8"><div className="h-8 w-52 rounded bg-slate-200" /><div className="mt-3 h-5 w-80 max-w-full rounded bg-slate-100" /><div className="mt-7 min-h-[540px] rounded-2xl border border-slate-200 bg-white p-6"><div className="h-10 w-full rounded bg-slate-100" /><div className="mt-7 space-y-4">{[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-11 rounded bg-slate-100" />)}</div></div></section>;
  if (error || !employee) return <section className="p-8 text-sm text-red-700">{error || "Employee not found."}</section>;
  return (
    <section className="p-5 text-slate-800 sm:p-7 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.push("/om/users")}
            className="mt-0.5 grid size-10 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            aria-label="Back to users"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Employee</h1>
            <p className="mt-1 text-base text-slate-500">
              Update employee information and related records.
            </p>
          </div>
        </div>
        {activeTab === "Basic" ? (
          <button
            type="submit"
            form={formId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
          >
            <Save className="size-4" />
            Update Employee
          </button>
        ) : null}
      </header>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <EmployeeTabs activeTab={activeTab} onChange={setActiveTab} />
        <h2 className="mt-7 text-lg font-semibold text-blue-800">{heading[activeTab]}</h2>
        <div className="mt-5">
          {activeTab === "Basic" ? <BasicEmployeeForm key={userId} mode="edit" employeeId={userId} initialData={employee as EmployeeFormValues} formId={formId} onUpdated={() => { setSuccess("Basic profile updated successfully."); refreshEmployee(); }} /> : null}
          {activeTab === "Employment" ? <EmploymentRecords employeeId={String(employee.employeeId ?? "")} onPrevious={() => setActiveTab("Basic")} onNext={() => setActiveTab("Payroll")} /> : null}
          <div className={activeTab === "Payroll" ? "" : "hidden"}>
            <PayrollForm userId={userId} onPrevious={() => setActiveTab("Employment")} onNext={() => setActiveTab("Basic")} onExit={() => router.push("/om/users")} onSaved={() => { setSuccess("Payroll records updated successfully."); refreshEmployee(); }} />
          </div>
        </div>
      </section>
      {success && (
        <Toast
          message={success}
          onClose={() => setSuccess("")}
        />
      )}
    </section>
  );
}
