"use client";

import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getUserPayroll, updateUserPayroll } from "@/Services/user";

type Profile = Record<string, string | string[]>;
type Allowance = { name: string; amount: string; calculationRule: string };
type Deduction = {
  name: string;
  amount: string;
  accountNumber: string;
  deductBeforeGross: boolean;
};
type Bank = {
  bank: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  bankCode: string;
  swiftCode: string;
};
type Toast = { kind: "success" | "error"; text: string } | null;

const emptyProfile: Profile = {
  workingDays: "5",
  restDaysPerMonth: "",
  workingHoursPerWeek: "",
  fixedRestDays: "",
  basicSalary: "",
  decimalPlaces: "2",
  dailyRate: "",
  hourlyRate: "",
  otHourlyRate: "",
  excessDailyRate: "",
  excessHourlyRate: "",
  fixedBasicSalary: "",
  fixedGrossSalary: "",
  basicHours: "8",
  breakTime: "1",
  maximumOtHours: "",
  advancePaymentType: "",
  calculationType: "Monthly Basic",
  cpfType: "",
  cpfEffectiveDate: "",
  levyType: "",
  employeeSkillType: "",
  selfHelpGroups: [],
  sdlCalculation: "",
  paymentMethod: "Bank Deposit",
  paymentRemarks: "",
};
const blankAllowance = (): Allowance => ({
  name: "",
  amount: "",
  calculationRule: "",
});
const blankDeduction = (): Deduction => ({
  name: "",
  amount: "",
  accountNumber: "",
  deductBeforeGross: false,
});
const blankBank = (): Bank => ({
  bank: "",
  accountName: "",
  accountNumber: "",
  branchCode: "",
  bankCode: "",
  swiftCode: "",
});
const banks = [
  { name: "DBS Bank Limited (DBS)", code: "7171", swift: "DBSSSGSGXXX" },
  { name: "POSB Bank", code: "7171", swift: "DBSSSGSGXXX" },
  {
    name: "Oversea-Chinese Banking Corporation Limited (OCBC)",
    code: "7339",
    swift: "OCBCSGSGXXX",
  },
  {
    name: "United Overseas Bank Limited (UOB)",
    code: "7375",
    swift: "UOVBSGSGXXX",
  },
  { name: "Standard Chartered Bank", code: "7144", swift: "SCBLSGSGXXX" },
];
const groupOptions = [
  "Chinese Development Assistance Council Fund",
  "Eurasian Community Fund",
  "Mosque Building and Mendaki Fund",
  "Singapore Indian Development Association Fund",
];
const allowanceOptions = [
  "AWS (ANNUAL WAGE SUPPLEMENT)",
  "PERFORMANCE INCENTIVE",
  "SITE ALLOWANCE",
  "TRANSPORT ALLOWANCE",
];
const deductionOptions = [
  "CPF CONTRIBUTION",
  "LOAN REPAYMENT",
  "INSURANCE",
  "UNIFORM DEDUCTION",
  "OTHER DEDUCTION",
];
const restDayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function PayrollForm({
  userId,
  onPrevious,
  onNext,
  onExit,
  onSaved,
}: {
  userId?: string;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
  onSaved?: () => void;
}) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Bank[]>([]);
  const [allowance, setAllowance] = useState(blankAllowance);
  const [deduction, setDeduction] = useState(blankDeduction);
  const [bank, setBank] = useState(blankBank);
  const [group, setGroup] = useState("");
  const [editingAllowance, setEditingAllowance] = useState<number | null>(null);
  const [editingDeduction, setEditingDeduction] = useState<number | null>(null);
  const [editingBank, setEditingBank] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const previousUserId = useRef(userId);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const keepNewEmployeeDraft = !previousUserId.current && Boolean(userId);
    previousUserId.current = userId;
    if (!userId || keepNewEmployeeDraft) return;
    let active = true;
    void getUserPayroll(userId)
      .then((data) => {
        if (!active) return;
        const rawProfile = data.profile ?? {};
        const nextProfile = Object.fromEntries(
          Object.entries({ ...emptyProfile, ...rawProfile }).map(
            ([key, value]) => [
              key,
              Array.isArray(value)
                ? value.map(String)
                : value == null
                  ? ""
                  : String(value),
            ],
          ),
        ) as Profile;
        setProfile(nextProfile);
        setAllowances(
          (data.earnings ?? []).map((row) => ({
            name: String(row.name ?? ""),
            amount: String(row.amount ?? ""),
            calculationRule: String(row.calculationRule ?? ""),
          })),
        );
        setDeductions(
          (data.deductions ?? []).map((row) => ({
            name: String(row.name ?? ""),
            amount: String(row.amount ?? ""),
            accountNumber: String(row.accountNumber ?? ""),
            deductBeforeGross:
              row.deductBeforeGross === true ||
              row.deductBeforeGross === "true",
          })),
        );
        setBankAccounts(
          (data.bankAccounts ?? []).map((row) => ({
            bank: String(row.bank ?? ""),
            accountName: String(row.accountName ?? ""),
            accountNumber: String(row.accountNumber ?? ""),
            branchCode: String(row.branchCode ?? ""),
            bankCode: String(row.bankCode ?? ""),
            swiftCode: String(row.swiftCode ?? ""),
          })),
        );
      })
      .catch((cause) => {
        if (active)
          setToast({
            kind: "error",
            text:
              cause instanceof Error
                ? cause.message
                : "Unable to load payroll settings.",
          });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);
  const set = (key: string, value: string | string[]) =>
    setProfile((current) => ({ ...current, [key]: value }));
  const setMessage = (kind: "success" | "error", text: string) =>
    setToast({ kind, text });
  const groups = Array.isArray(profile.selfHelpGroups)
    ? profile.selfHelpGroups
    : [];
  const calculate = () => {
    const salary = Number(profile.basicSalary || 0);
    const days = Number(profile.workingDays || 5);
    const hours = Number(profile.basicHours || 8);
    const places = Math.min(6, Math.max(0, Number(profile.decimalPlaces || 2)));
    if (
      !Number.isFinite(salary) ||
      salary < 0 ||
      !Number.isFinite(hours) ||
      hours <= 0
    )
      return setMessage(
        "error",
        "Enter a valid basic salary and basic hours before calculating.",
      );
    const monthlyDays = (days / 7) * 30.44;
    const daily = monthlyDays ? salary / monthlyDays : 0;
    const hourly = daily / hours;
    const format = (value: number) => value.toFixed(places);
    setProfile((current) => ({
      ...current,
      dailyRate: format(daily),
      hourlyRate: format(hourly),
      otHourlyRate: format(hourly * 1.5),
      excessDailyRate: format(daily),
      excessHourlyRate: format(hourly),
    }));
    setMessage("success", "Payroll rates calculated.");
  };
  const addGroup = () => {
    if (!group) return setMessage("error", "Select a self-help group first.");
    if (groups.includes(group))
      return setMessage(
        "error",
        "This self-help group has already been added.",
      );
    set("selfHelpGroups", [...groups, group]);
    setGroup("");
    setMessage("success", "Self-help group added successfully.");
  };
  const removeGroup = (value: string) => {
    if (!window.confirm(`Remove ${value}?`)) return;
    set(
      "selfHelpGroups",
      groups.filter((item) => item !== value),
    );
    setMessage("success", "Self-help group removed.");
  };
  const positive = (value: string) =>
    Number.isFinite(Number(value)) && Number(value) > 0;
  const addAllowance = () => {
    if (!allowance.name || !positive(allowance.amount))
      return setMessage(
        "error",
        "Choose an allowance type and enter a positive amount.",
      );
    if (
      allowances.some(
        (row, index) =>
          row.name === allowance.name && index !== editingAllowance,
      )
    )
      return setMessage("error", "This allowance type has already been added.");
    setAllowances((current) =>
      editingAllowance === null
        ? [...current, allowance]
        : current.map((row, index) =>
            index === editingAllowance ? allowance : row,
          ),
    );
    setAllowance(blankAllowance());
    setEditingAllowance(null);
    setMessage("success", "Fixed allowance saved.");
  };
  const addDeduction = () => {
    if (
      !deduction.name ||
      !deduction.accountNumber.trim() ||
      !positive(deduction.amount)
    )
      return setMessage(
        "error",
        "Choose a deduction type, account number, and positive amount.",
      );
    if (
      deductions.some(
        (row, index) =>
          row.name === deduction.name && index !== editingDeduction,
      )
    )
      return setMessage("error", "This deduction type has already been added.");
    setDeductions((current) =>
      editingDeduction === null
        ? [...current, deduction]
        : current.map((row, index) =>
            index === editingDeduction ? deduction : row,
          ),
    );
    setDeduction(blankDeduction());
    setEditingDeduction(null);
    setMessage("success", "Fixed deduction saved.");
  };
  const selectBank = (bankName: string) => {
    const selected = banks.find((item) => item.name === bankName);
    setBank((current) => ({
      ...current,
      bank: bankName,
      bankCode: selected?.code ?? "",
      swiftCode: selected?.swift ?? "",
    }));
  };
  const addBank = () => {
    if (
      !bank.bank ||
      !bank.accountName.trim() ||
      !bank.accountNumber.trim() ||
      !bank.branchCode.trim() ||
      !bank.bankCode ||
      !bank.swiftCode
    )
      return setMessage(
        "error",
        "Complete every required bank field before adding.",
      );
    if (
      bankAccounts.some(
        (row, index) =>
          row.bank === bank.bank &&
          row.accountNumber === bank.accountNumber &&
          index !== editingBank,
      )
    )
      return setMessage(
        "error",
        "This bank-account record has already been added.",
      );
    setBankAccounts((current) =>
      editingBank === null
        ? [...current, bank]
        : current.map((row, index) => (index === editingBank ? bank : row)),
    );
    setBank(blankBank());
    setEditingBank(null);
    setMessage("success", "Bank account saved.");
  };
  const save = async () => {
    if (!userId)
      return setMessage(
        "error",
        "Save Basic Information first, then return to save payroll settings.",
      );
    setSaving(true);
    try {
      await updateUserPayroll(userId, {
        profile,
        bankAccounts,
        earnings: allowances,
        deductions,
      });
      setMessage("success", "Payroll settings saved successfully.");
      onSaved?.();
    } catch (cause) {
      setMessage(
        "error",
        cause instanceof Error
          ? cause.message
          : "Unable to save payroll settings.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading payroll settings…
      </p>
    );
  return (
    <div className="space-y-5">
      <Panel title="Basic Settings">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <Label>Working Days</Label>
            <div className="mt-2 space-y-2 text-sm">
              {[
                ["5", "5 days per week"],
                ["5.5", "5.5 days per week"],
                ["6", "6 days per week"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="working-days"
                    checked={profile.workingDays === value}
                    onChange={() => set("workingDays", value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <Select
              label="Fixed Rest Day(s)"
              value={String(profile.fixedRestDays)}
              onChange={(value) => {
                if (value.includes(","))
                  return setMessage(
                    "error",
                    "Only one fixed rest-day option can be selected.",
                  );
                set("fixedRestDays", value);
              }}
              options={restDayOptions}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Others: Rest day(s) per month"
              type="number"
              value={String(profile.restDaysPerMonth)}
              onChange={(value) => set("restDaysPerMonth", value)}
              placeholder="e.g. 4"
            />
            <Field
              label="Others: Working hour(s) per week"
              type="number"
              value={String(profile.workingHoursPerWeek)}
              onChange={(value) => set("workingHoursPerWeek", value)}
              placeholder="e.g. 44"
            />
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field
            label="Basic Salary"
            type="number"
            value={String(profile.basicSalary)}
            onChange={(value) => set("basicSalary", value)}
            placeholder="Enter basic salary"
          />
          <Field
            label="Decimal Places"
            type="number"
            value={String(profile.decimalPlaces)}
            onChange={(value) => set("decimalPlaces", value)}
          />
          <button
            type="button"
            onClick={calculate}
            className="mt-6 h-10 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Calculate
          </button>
          <Field
            label="Daily Rate"
            type="number"
            value={String(profile.dailyRate)}
            onChange={(value) => set("dailyRate", value)}
          />
          <Field
            label="Hourly Rate"
            type="number"
            value={String(profile.hourlyRate)}
            onChange={(value) => set("hourlyRate", value)}
          />
          <Field
            label="OT Hourly Rate"
            type="number"
            value={String(profile.otHourlyRate)}
            onChange={(value) => set("otHourlyRate", value)}
          />
          <Field
            label="Excess Daily Rate"
            type="number"
            value={String(profile.excessDailyRate)}
            onChange={(value) => set("excessDailyRate", value)}
          />
          <Field
            label="Excess Hourly Rate"
            type="number"
            value={String(profile.excessHourlyRate)}
            onChange={(value) => set("excessHourlyRate", value)}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            label="Fixed Basic Salary"
            type="number"
            value={String(profile.fixedBasicSalary)}
            onChange={(value) => set("fixedBasicSalary", value)}
          />
          <Field
            label="Fixed Gross Salary"
            type="number"
            value={String(profile.fixedGrossSalary)}
            onChange={(value) => set("fixedGrossSalary", value)}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field
            label="Basic Hours"
            type="number"
            value={String(profile.basicHours)}
            onChange={(value) => set("basicHours", value)}
          />
          <Field
            label="Break Time"
            type="number"
            value={String(profile.breakTime)}
            onChange={(value) => set("breakTime", value)}
          />
          <Field
            label="Max. OT Hours"
            type="number"
            value={String(profile.maximumOtHours)}
            onChange={(value) => set("maximumOtHours", value)}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Select
            label="Advance Payment Type"
            value={String(profile.advancePaymentType)}
            onChange={(value) => set("advancePaymentType", value)}
            options={["No Advance", "With Advance"]}
          />
          <RadioGroup
            label="Calculation Type"
            value={String(profile.calculationType)}
            onChange={(value) => set("calculationType", value)}
            options={["Daily Basic", "Hourly Basic", "Monthly Basic"]}
          />
        </div>
      </Panel>
      <Panel title="CPF Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="CPF Type"
            value={String(profile.cpfType)}
            onChange={(value) => set("cpfType", value)}
            options={["Singapore Citizen (Private Sector)", "PR", "Foreigner"]}
          />
          <Field
            label="PR Effective Date"
            type="date"
            value={String(profile.cpfEffectiveDate)}
            onChange={(value) => set("cpfEffectiveDate", value)}
          />
        </div>
      </Panel>
      <Panel title="Levy Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Levy Type"
            value={String(profile.levyType)}
            onChange={(value) => set("levyType", value)}
            options={[
              "N.A.",
              "Malaysian / NAS Work Permit holders - Basic Tier",
              "Malaysian / NAS Work Permit holders - Tier 1",
              "PRC Work Permit holders - Basic Tier",
              "S Pass holders - Basic Tier",
            ]}
          />
          <Select
            label="Employee Skill Type"
            value={String(profile.employeeSkillType)}
            onChange={(value) => set("employeeSkillType", value)}
            options={["N.A.", "Basic", "Skilled"]}
          />
        </div>
      </Panel>
      <Panel title="Self Help Group Fund">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Select
              label="Self Help Group"
              value={group}
              onChange={setGroup}
              options={groupOptions.map((option) =>
                groups.includes(option) ? `${option} (Added)` : option,
              )}
            />
            <button
              type="button"
              onClick={addGroup}
              className="mt-4 h-10 w-full rounded-md bg-neutral-950 px-5 text-sm font-medium text-white"
            >
              Add Group
            </button>
          </div>
          <div>
            <Label>Added Groups ({groups.length})</Label>
            <div className="mt-1.5 space-y-2 rounded-lg border border-dashed border-slate-200 p-3">
              {groups.length ? (
                groups.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${item}`}
                      onClick={() => removeGroup(item)}
                      className="text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">
                  No self-help groups added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </Panel>
      <Panel title="SDL Calculation Settings">
        <Select
          label="With SDL Calculation"
          value={String(profile.sdlCalculation)}
          onChange={(value) => set("sdlCalculation", value)}
          options={["Yes", "No"]}
        />
      </Panel>
      <RecordPanel
        title="Fixed Allowance"
        label="Allowance Type"
        rows={allowances}
        draft={allowance}
        setDraft={setAllowance}
        editIndex={editingAllowance}
        onAdd={addAllowance}
        onEdit={(index) => {
          setAllowance(allowances[index]);
          setEditingAllowance(index);
        }}
        onRemove={(index) => {
          if (window.confirm("Remove this allowance?")) {
            setAllowances((rows) => rows.filter((_, row) => row !== index));
            setMessage("success", "Allowance removed.");
          }
        }}
        allowance
      />
      <RecordPanel
        title="Fixed Deduction"
        label="Deduction Type"
        rows={deductions}
        draft={deduction}
        setDraft={setDeduction}
        editIndex={editingDeduction}
        onAdd={addDeduction}
        onEdit={(index) => {
          setDeduction(deductions[index]);
          setEditingDeduction(index);
        }}
        onRemove={(index) => {
          if (window.confirm("Remove this deduction?")) {
            setDeductions((rows) => rows.filter((_, row) => row !== index));
            setMessage("success", "Deduction removed.");
          }
        }}
      />
      <Panel title="Default Payment Details">
        <RadioGroup
          label="Payment Method"
          value={String(profile.paymentMethod)}
          onChange={(value) => set("paymentMethod", value)}
          options={["Bank Deposit", "Cash", "Cheque"]}
        />
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Payment Remarks
          <textarea
            value={String(profile.paymentRemarks)}
            onChange={(event) => set("paymentRemarks", event.target.value)}
            className="mt-1.5 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
            placeholder="Enter any specific payment instructions or remarks"
          />
        </label>
      </Panel>
      <Panel title="Employee Payment and Bank Details">
        <div className="grid gap-4 md:grid-cols-4">
          <Select
            label="Bank"
            required
            value={bank.bank}
            onChange={selectBank}
            options={banks.map((item) => item.name)}
          />
          <Field
            label="Account Name"
            required
            value={bank.accountName}
            onChange={(value) =>
              setBank((current) => ({ ...current, accountName: value }))
            }
          />
          <Field
            label="Account Number"
            required
            value={bank.accountNumber}
            onChange={(value) =>
              setBank((current) => ({ ...current, accountNumber: value }))
            }
          />
          <Field
            label="Branch Code"
            required
            value={bank.branchCode}
            onChange={(value) =>
              setBank((current) => ({ ...current, branchCode: value }))
            }
          />
          <Field
            label="Bank Code"
            required
            value={bank.bankCode}
            readOnly
            onChange={() => undefined}
          />
          <Field
            label="Swift Code"
            required
            value={bank.swiftCode}
            readOnly
            onChange={() => undefined}
          />
        </div>
        <button
          type="button"
          onClick={addBank}
          className="mt-4 h-10 w-full max-w-xs rounded-md bg-neutral-950 px-5 text-sm font-medium text-white"
        >
          {editingBank === null ? "Add" : "Update"}
        </button>
        <DataTable
          headers={[
            "Account Name",
            "Account Number",
            "Bank Code",
            "Swift Code",
            "Branch Code",
            "Bank",
          ]}
          rows={bankAccounts.map((row) => [
            row.accountName,
            row.accountNumber,
            row.bankCode,
            row.swiftCode,
            row.branchCode,
            row.bank,
          ])}
          onEdit={(index) => {
            setBank(bankAccounts[index]);
            setEditingBank(index);
          }}
          onRemove={(index) => {
            if (window.confirm("Remove this bank account?")) {
              setBankAccounts((rows) => rows.filter((_, row) => row !== index));
              setMessage("success", "Bank account removed.");
            }
          }}
        />
      </Panel>
      {toast ? (
        <div
          role="status"
          className={`sticky bottom-4 z-10 rounded-md px-4 py-3 text-sm shadow-lg ${toast.kind === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
        >
          {toast.text}
        </div>
      ) : null}
      <footer className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <div className="flex gap-3">
          <Secondary onClick={onPrevious}>‹ Prev</Secondary>
          <Secondary onClick={onNext}>Next ›</Secondary>
        </div>
        <div className="flex gap-3">
          <Secondary onClick={onExit}>Exit</Secondary>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-neutral-950 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </footer>
    </div>
  );
}

function Panel({
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
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-slate-700">{children}</p>;
}
function Field({
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
function Select({
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
      <select
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value.replace(/ \(Added\)$/, ""))
        }
        className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option
            key={option}
            value={option.replace(/ \(Added\)$/, "")}
            disabled={option.endsWith(" (Added)")}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function RadioGroup({
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
function RecordPanel({
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
function DataTable({
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
function Secondary({
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
