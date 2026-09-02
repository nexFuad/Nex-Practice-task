"use client";

import { AlertCircle, Building2, Mail, MapPin, Phone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSites } from "../sites/sites.api";
import type { DemoUser } from "./types";
import type { UserMenuAction } from "./UserActionsMenu";
import {
  deleteUser,
  activateUser,
  getUser,
  getUserSchedule,
  resetUserPassword,
  resignUser,
  saveUserSites,
  setUserStatus,
  type EditableEmployee,
  type UserScheduleRecord,
} from "./users.api";

type Props = {
  user: DemoUser;
  action: UserMenuAction;
  onClose: () => void;
  onChanged: () => void;
  onDeleted: (databaseId: string) => void;
  onToast?: (message: string) => void;
};

const title: Record<UserMenuAction, string> = {
  "View Assigned Sites": "Assigned Sites",
  "Assign to Sites": "Assign Sites",
  "View Schedule": "Employee Schedule",
  "Bio data": "Employee Bio Data",
  "Reset Password": "Reset Password",
  "Suspend User": "Suspend User",
  "Resign User": "Resign User",
  "Activate User": "Activate User",
  "Delete User": "Delete User",
};

export function UserActionDialog({
  user,
  action,
  onClose,
  onChanged,
  onDeleted,
  onToast,
}: Props) {
  const [employee, setEmployee] = useState<EditableEmployee | null>(null);
  const [schedule, setSchedule] = useState<UserScheduleRecord[]>([]);
  const [sites, setSites] = useState<
    { id: string; name: string; code: string; address: string }[]
  >([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastWorkingDay, setLastWorkingDay] = useState("");

  useEffect(() => {
    getUser(user.databaseId)
      .then((data) => {
        setEmployee(data);
        setSelectedSites((data.siteIds as string[]) ?? []);
      })
      .catch((cause) =>
        setMessage(
          cause instanceof Error ? cause.message : "Unable to load employee.",
        ),
      );
    if (action === "View Schedule") {
      getUserSchedule(user.databaseId)
        .then(setSchedule)
        .catch((cause) =>
          setMessage(
            cause instanceof Error ? cause.message : "Unable to load schedule.",
          ),
        );
    }
    if (action === "Assign to Sites") {
      getSites("ACTIVE")
        .then((items) =>
          setSites(items.map(({ id, name, code, address }) => ({ id, name, code, address }))),
        )
        .catch((cause) =>
          setMessage(
            cause instanceof Error ? cause.message : "Unable to load sites.",
          ),
        );
    }
  }, [action, user.databaseId]);

  const assignedSites = useMemo(
    () =>
      (employee?.siteAssignments as
        | { id: string; name: string; code: string; address?: string; status?: string }[]
        | undefined) ?? [],
    [employee],
  );
  const employmentRecords = (employee?.employmentRecords as { id: string; dateJoin?: string }[] | undefined) ?? [];
  const employmentRecord = employmentRecords.find((record) => Boolean(record.dateJoin));
  const toggleSite = (siteId: string) =>
    setSelectedSites((current) =>
      current.includes(siteId)
        ? current.filter((id) => id !== siteId)
        : [...current, siteId],
    );
  const finish = (text: string) => {
    setMessage(text);
    onChanged();
  };
  const submit = async () => {
    setMessage("");
    setSaving(true);
    try {
      if (action === "Assign to Sites") {
        await saveUserSites(user.databaseId, selectedSites);
        finish("Site assignments saved.");
      } else if (action === "Reset Password") {
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters.");
        if (password !== confirmPassword)
          throw new Error("Passwords do not match.");
        await resetUserPassword(user.databaseId, password);
        finish("Password reset successfully.");
      } else if (action === "Suspend User") {
        await setUserStatus(
          user.databaseId,
          "SUSPENDED",
        );
        onChanged();
        onToast?.(`${user.name} was suspended.`);
        onClose();
      } else if (action === "Resign User") {
        if (!employmentRecord) throw new Error("No employment record found. Add a Date Join before marking this user as resigned.");
        if (!lastWorkingDay) throw new Error("Please select the last working date.");
        await resignUser(user.databaseId, lastWorkingDay);
        onChanged();
        onToast?.(`${user.name} was marked as resigned.`);
        onClose();
      } else if (action === "Activate User") {
        await activateUser(user.databaseId);
        onChanged();
        onToast?.(`${user.name} is active again.`);
        onClose();
      } else if (action === "Delete User") {
        await deleteUser(user.databaseId);
        onDeleted(user.databaseId);
        onClose();
      }
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Unable to complete this action.",
      );
    } finally {
      setSaving(false);
    }
  };

  const hasSubmit = [
    "Assign to Sites",
    "Reset Password",
    "Suspend User",
    "Resign User",
    "Activate User",
    "Delete User",
  ].includes(action);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title[action]}
        onMouseDown={(event) => event.stopPropagation()}
        className={`w-full rounded-lg border bg-white shadow-2xl ${action === "View Assigned Sites" ? "max-w-[calc(100%-2rem)] p-6 sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" : action === "Assign to Sites" ? "max-w-2xl p-5" : "max-w-lg p-5"}`}
      >
        <header className={`flex items-center justify-between ${action === "View Assigned Sites" ? "shrink-0" : "border-b border-slate-100 pb-3"}`}>
          <div><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">{action === "Assign to Sites" && <Building2 className="size-5" />}{action === "View Assigned Sites" ? "User Site Assignments" : action === "Assign to Sites" ? `Assign Sites to ${user.name}` : title[action]}</h2>{action === "View Assigned Sites" && <p className="mt-2 text-sm text-slate-500">View and manage site assignments for {user.name}</p>}{action === "Assign to Sites" && <p className="mt-2 text-sm text-slate-500">Select which sites this user can access and work at.</p>}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className={`${action === "View Assigned Sites" ? "flex-1 overflow-y-auto pt-5 text-sm text-slate-700" : "max-h-[60vh] overflow-y-auto py-4 text-sm text-slate-700"}`}>
          {action === "View Assigned Sites" && (
            <SiteAssignments user={user} sites={assignedSites} loading={!employee} />
          )}
          {action === "Assign to Sites" && (
            <SitePicker
              sites={sites}
              selected={selectedSites}
              onToggle={toggleSite}
            />
          )}
          {action === "View Schedule" && (
            <ScheduleList rows={schedule} loading={!employee} />
          )}
          {action === "Bio data" && <BioData employee={employee} />}
          {action === "Reset Password" && (
            <PasswordFields
              password={password}
              confirmPassword={confirmPassword}
              onPassword={setPassword}
              onConfirm={setConfirmPassword}
            />
          )}
          {action === "Resign User" && (
            <div className="space-y-4">
              <p>Are you sure you want to mark <b>{user.name}</b> as resigned? Please specify their last working date.</p>
              {employmentRecord ? (
                <label className="block text-sm font-semibold uppercase tracking-wide text-slate-600">Resignation Date (Last Working Date) <span className="text-red-500">*</span><input type="date" value={lastWorkingDay} min={new Date(employmentRecord.dateJoin ?? "").toISOString().slice(0, 10)} onChange={(event) => setLastWorkingDay(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" required /></label>
              ) : (
                <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">No Employment Record Found</p><p className="mt-1">This user does not have a Date Join in their employment profile. Update employment details before marking them as resigned.</p></div></div>
              )}
            </div>
          )}
          {["Suspend User", "Delete User", "Activate User"].includes(action) && (
            <p>
              Are you sure you want to{" "}
              {action === "Delete User"
                ? "permanently delete"
                : action === "Suspend User"
                  ? "suspend"
                  : "activate"}{" "}
              <b>{user.name}</b>?
            </p>
          )}
          {message && (
            <p
              className={`mt-3 rounded-md px-3 py-2 ${message.includes("success") || message.includes("saved") || message.includes("suspended") || message.includes("resigned") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
            >
              {message}
            </p>
          )}
        </div>
        {action !== "View Assigned Sites" && <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-slate-200 px-4 text-sm"
          >
            {action === "Assign to Sites" ? "Cancel" : "Close"}
          </button>
          {hasSubmit && (
            <button
              type="button"
              disabled={saving || (action === "Resign User" && !employmentRecord)}
              onClick={() => void submit()}
              className={`h-9 rounded-md px-4 text-sm font-medium text-white disabled:opacity-50 ${action === "Delete User" || action === "Resign User" ? "bg-red-600 hover:bg-red-700" : "bg-neutral-900 hover:bg-neutral-800"}`}
            >
              {saving
                ? "Saving..."
                : action === "Assign to Sites"
                  ? "Update Site Assignments"
                  : action === "Reset Password"
                    ? "Reset Password"
                    : action === "Delete User"
                      ? "Delete User"
                      : action === "Resign User"
                        ? "Mark as Resigned"
                        : action === "Activate User"
                          ? "Activate User"
                          : "Confirm"}
            </button>
          )}
        </footer>}
      </section>
    </div>
  );
}

function SiteAssignments({ user, sites, loading }: { user: DemoUser; sites: { id: string; name: string; code: string; address?: string; status?: string }[]; loading: boolean }) {
  const roleLabel = user.role === "OM" ? "Operations Manager" : "Officer";
  const statusClass = user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : user.status === "SUSPENDED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
  return <div className="space-y-5">
    <section className="rounded-xl border border-slate-200 py-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4 px-6"><div className="flex items-center gap-3"><span className="grid size-14 shrink-0 place-items-center rounded-full bg-blue-600 text-lg font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span><div><p className="text-lg font-semibold text-slate-900">{user.name}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500"><span className={`rounded-md border px-2 py-0.5 font-medium ${user.role === "OM" ? "border-blue-200 bg-blue-100 text-blue-700" : "border-emerald-200 bg-emerald-100 text-emerald-700"}`}>{roleLabel}</span><span>{user.id}</span></div></div></div><span className={`rounded-md px-3 py-1 text-sm font-medium ${statusClass}`}>{user.status}</span></div><div className="mt-5 grid gap-3 px-6 text-sm text-slate-500 sm:grid-cols-2"><p className="flex items-center gap-2"><Mail className="size-4 text-slate-400" />{user.email || "N/A"}</p><p className="flex items-center gap-2"><Phone className="size-4 text-slate-400" />{user.phone || "N/A"}</p></div></section>
    <section><div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-2 text-base font-semibold text-slate-700"><MapPin className="size-4" />Assigned Sites</h3><span className="text-sm text-slate-500">{loading ? "…" : `${sites.length} ${sites.length === 1 ? "Site" : "Sites"}`}</span></div>{loading ? <div className="rounded-lg border px-4 py-10 text-center text-slate-500">Loading assigned sites…</div> : sites.length ? <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full text-left"><thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-4 font-medium">Site Name</th><th className="px-4 py-4 font-medium">Address</th><th className="px-4 py-4 font-medium">Site Code</th><th className="px-4 py-4 font-medium">Status</th></tr></thead><tbody>{sites.map((site) => <tr key={site.id} className="border-b border-slate-200 last:border-0"><td className="px-4 py-4 font-medium text-slate-800">{site.name}</td><td className="max-w-sm truncate px-4 py-4 text-slate-500" title={site.address}>{site.address || "—"}</td><td className="px-4 py-4 text-slate-600">{site.code}</td><td className="px-4 py-4"><span className="rounded-md bg-emerald-100 px-2.5 py-1 text-sm font-medium text-emerald-700">{site.status || "ACTIVE"}</span></td></tr>)}</tbody></table></div> : <div className="flex min-h-64 items-center justify-center rounded-lg border p-8 text-center md:max-h-[30vh]"><div><MapPin className="mx-auto mb-3 size-12 text-slate-400" /><h4 className="mb-1 text-lg font-medium text-slate-900">No Sites Assigned</h4><p className="text-slate-500">This user has not been assigned to any sites yet.</p></div></div>}</section>
  </div>;
}
function SitePicker({
  sites,
  selected,
  onToggle,
}: {
  sites: { id: string; name: string; code: string; address: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return <div><h3 className="mb-4 text-base font-semibold text-slate-800">Available Sites ({sites.length})</h3>{sites.length ? <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1">{sites.map((site) => <label key={site.id} className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"><input type="checkbox" checked={selected.includes(site.id)} onChange={() => onToggle(site.id)} className="size-5 rounded border-slate-300 text-slate-900 focus:ring-slate-700" /><MapPin className="size-5 shrink-0 text-slate-500" /><span className="min-w-0"><b className="block text-base text-slate-900">{site.name}</b><span className="mt-1 block truncate text-sm text-slate-500">{site.code} · {site.address}</span></span></label>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-slate-500">No active sites are available.</div>}<p className="mt-5 text-sm text-slate-500">Selected: {selected.length} of {sites.length} sites</p></div>;
}
function ScheduleList({
  rows,
  loading,
}: {
  rows: UserScheduleRecord[];
  loading: boolean;
}) {
  if (loading) return <p>Loading schedule…</p>;
  return rows.length ? (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="rounded-lg border border-slate-200 px-3 py-2"
        >
          <b>{new Date(row.shiftDate).toLocaleDateString()}</b> ·{" "}
          {row.shiftStart}–{row.shiftEnd}
          <span className="ml-2 text-slate-500">
            {row.siteName ?? "No site"} · {row.status}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-slate-500">
      No attendance schedule is available for this user.
    </p>
  );
}
function BioData({ employee }: { employee: EditableEmployee | null }) {
  if (!employee) return <p>Loading bio data…</p>;
  const rows: [string, string][] = [
    ["Full name", String(employee.fullName ?? "")],
    ["Employee ID", String(employee.employeeId ?? "")],
    ["Email", String(employee.email ?? "")],
    ["Phone", String(employee.phone ?? "")],
    ["Nationality", String(employee.nationality ?? "")],
    ["Address", String(employee.address ?? "")],
  ];
  return (
    <dl className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-3 gap-3">
          <dt className="font-medium text-slate-500">{label}</dt>
          <dd className="col-span-2 break-words text-slate-900">
            {value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
function PasswordFields({
  password,
  confirmPassword,
  onPassword,
  onConfirm,
}: {
  password: string;
  confirmPassword: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block font-medium">New password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => onPassword(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3"
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-medium">Confirm password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirm(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3"
        />
      </label>
    </div>
  );
}
