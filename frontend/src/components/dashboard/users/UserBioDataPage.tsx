"use client";
/* eslint-disable @next/next/no-img-element -- Officer photos are loaded from stored external URLs. */

import { ArrowLeft, Download, Printer, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { downloadOfficerParticularsPdf, type OfficerParticularsPdfSection } from "./officerParticularsPdf";
import { getUser, type EditableEmployee } from "./users.api";

type Employment = { dateJoin?: string; dateLeft?: string; status?: string; confirmationDate?: string; remarks?: string };
type PwmHistory = { role?: string; roleStartDate?: string };
type Site = { id?: string; name?: string };
const fallbackCompany = { name: "Azovis", address: "-", telephone: "-", fax: "-", website: "-", email: "-" };
const display = (item: unknown) => typeof item === "string" && item.trim() ? item.trim() : "-";
const formatDate = (item: unknown) => {
  if (typeof item !== "string" || !item.trim()) return "-";
  const parsed = new Date(item);
  return Number.isNaN(parsed.getTime()) ? item : parsed.toLocaleDateString("en-GB");
};
const calculateAge = (item: unknown) => {
  if (typeof item !== "string" || !item) return "-";
  const birth = new Date(item); if (Number.isNaN(birth.getTime())) return "-";
  const today = new Date(); let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : "-";
};

export function UserBioDataPage() {
  const router = useRouter(); const params = useParams<{ employeeId: string }>();
  const userId = decodeURIComponent(params.employeeId ?? "");
  const { data: employee = null, error: queryError } = useQuery<EditableEmployee>({
    queryKey: ["users", userId, "bio-data"],
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
  });
  const error = queryError instanceof Error ? queryError.message : queryError ? "Unable to load officer particulars." : "";
  const employment = useMemo(() => ((employee?.employmentRecords as Employment[] | undefined) ?? []), [employee]);
  const pwmHistory = useMemo(() => ((employee?.pwmEmploymentHistory as PwmHistory[] | undefined) ?? []), [employee]);
  const sites = useMemo(() => ((employee?.siteAssignments as Site[] | undefined) ?? []), [employee]);
  const courses = useMemo(() => {
    const record = employee as Record<string, unknown> | null;
    const values = record?.certifications ?? record?.securityCourses;
    return Array.isArray(values) ? values.map((course) => typeof course === "string" ? course : display((course as { name?: string; title?: string }).name ?? (course as { title?: string }).title)).filter((course) => course !== "-") : [];
  }, [employee]);
  if (!userId || error) return <section className="p-8"><p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Employee not found."}</p><button type="button" onClick={() => router.push("/om/users")} className="mt-4 text-sm font-medium underline">Back to users</button></section>;
  if (!employee) return <p className="p-8 text-sm text-slate-500">Loading officer particulars…</p>;

  const company = { ...fallbackCompany, name: display(employee.company) === "-" ? fallbackCompany.name : display(employee.company) };
  const deploymentSite = sites.find((site) => site.id === employee.deploymentSiteId)?.name ?? sites[0]?.name;
  const latestEmployment = employment[0];
  const personalLeft: [string, string][] = [["PWM Grade", display(pwmHistory[0]?.role ?? employee.role)], ["Full Name", display(employee.fullName)], ["Date of Birth", formatDate(employee.dateOfBirth)], ["Nationality", display(employee.nationality)], ["Race", display(employee.race)], ["Marital Status", display(employee.maritalStatus)], ["Deployment Site", display(deploymentSite)]];
  const personalRight: [string, string][] = [["Deployment Grade", display(employee.role)], ["NRIC/FIN No.", display(employee.nric)], ["Age", calculateAge(employee.dateOfBirth)], ["Handphone No.", display(employee.phone)], ["PRD License Validity", "-"], ["Religion", display(employee.religion)], ["Commencement Date", formatDate(latestEmployment?.dateJoin)], ["Probation End Date", formatDate(latestEmployment?.confirmationDate)]];
  const employmentLines = employment.length ? employment.map((entry, index) => `${index + 1}) ${display(entry.status)} — ${formatDate(entry.dateJoin)}${entry.dateLeft ? ` to ${formatDate(entry.dateLeft)}` : ""}${entry.remarks ? ` — ${entry.remarks}` : ""}`) : ["-"];
  const pdfSections: OfficerParticularsPdfSection[] = [
    { title: "Personal Details", lines: [...personalLeft, ...personalRight, ["Address", display(employee.address)], ["Education Details", "-"]].map(([label, item]) => `${label}: ${item}`) },
    { title: "Employment Details", lines: employmentLines },
    { title: "Security Courses Attended", lines: courses.length ? courses.map((course, index) => `${index + 1}) ${course}`) : ["-"] },
    { title: "DISCLAIMER", lines: ["To safeguard your personal data from unauthorised access, collection, use, disclosure, copying, modification, disposal or similar risks, we have introduced appropriate administrative, physical and technical measures such as up-to-date antivirus protection, encryption and the use of privacy filters.", "You should be aware, however, that no method of transmission over the Internet or method of electronic storage is completely secure. While security cannot be guaranteed, we strive to protect the security of your information and are constantly reviewing and enhancing our information security measures.", `Website: ${company.website}`, `Contact Email: ${company.email}`] },
  ];
  const printReport = () => { const oldTitle = document.title; document.title = `Officer-Particulars-${display(employee.fullName)}`; window.print(); window.setTimeout(() => { document.title = oldTitle; }, 0); };
  return <section className="bio-data-page min-h-full bg-slate-50 p-4 sm:p-7 lg:p-8"><style jsx global>{`@page { size: A4 portrait; margin: 0; } @media print { html, body { background: #fff !important; } body * { visibility: hidden !important; } .bio-report, .bio-report * { visibility: visible !important; } .bio-report { position: absolute !important; inset: 0 !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 16mm !important; box-shadow: none !important; } }`}</style><header className="mb-6 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => router.push("/om/users")} className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-slate-100"><ArrowLeft className="size-5" />Back to users</button><div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap"><button type="button" onClick={printReport} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm hover:bg-slate-50"><Printer className="size-5" />Print / Save PDF</button><button type="button" onClick={() => downloadOfficerParticularsPdf({ employeeName: display(employee.fullName), companyName: company.name, sections: pdfSections })} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"><Download className="size-5" />Download PDF</button></div></header><article className="bio-report mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-[7mm] text-black shadow-sm sm:p-[16mm]"><header className="grid gap-5 border-b-2 border-black pb-6 sm:grid-cols-[1fr_auto] sm:gap-6 sm:pb-8"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-xl bg-blue-600 text-white sm:size-16"><ShieldCheck className="size-7 sm:size-9" /></span><span className="text-lg font-bold text-slate-800 sm:text-xl">{company.name}</span></div><div className="max-w-[78mm] text-sm leading-6"><h1 className="text-xl font-bold">{company.name}</h1><p>{company.address}</p><div className="flex flex-wrap gap-x-8"><p>Tel: {company.telephone}</p><p>Fax: {company.fax}</p></div></div></header><h2 className="my-7 text-center text-2xl font-bold sm:my-10 sm:text-3xl">Officer Particulars</h2><section><h3 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">Personal Details</h3><div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_34mm] sm:gap-7"><div className="grid gap-x-10 gap-y-6 md:grid-cols-2"><DetailList rows={personalLeft} /><DetailList rows={personalRight} /></div><div className="justify-self-center sm:justify-self-auto"><Photo imageUrl={employee.profileImageUrl} name={display(employee.fullName)} /></div></div><div className="mt-8 max-w-[138mm] space-y-3 text-sm"><Field label="Address" value={display(employee.address)} /><Field label="Education Details" value="-" /></div></section><section className="mt-12"><h3 className="text-lg font-bold">Employment Details</h3>{employment.length ? <ol className="mt-4 list-none space-y-2 text-sm">{employment.map((entry, index) => <li key={`${entry.dateJoin}-${index}`} className="break-words">{index + 1}) <span className="font-medium">{display(entry.status)}</span> — {formatDate(entry.dateJoin)}{entry.dateLeft ? ` to ${formatDate(entry.dateLeft)}` : ""}{entry.remarks ? ` — ${entry.remarks}` : ""}</li>)}</ol> : <p className="mt-4 text-sm">-</p>}</section><section className="mt-8"><h3 className="text-lg font-bold">Security Courses Attended:</h3>{courses.length ? <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">{courses.map((course) => <li key={course}>{course}</li>)}</ol> : <p className="mt-4 text-sm">-</p>}</section><footer className="mt-16 break-inside-avoid text-xs italic leading-5 text-slate-600 sm:mt-20"><p className="font-bold not-italic text-orange-500">DISCLAIMER</p><p className="mt-1">To safeguard your personal data from unauthorised access, collection, use, disclosure, copying, modification, disposal or similar risks, we have introduced appropriate administrative, physical and technical measures such as up-to-date antivirus protection, encryption and the use of privacy filters.</p><p className="mt-4">You should be aware, however, that no method of transmission over the Internet or method of electronic storage is completely secure. While security cannot be guaranteed, we strive to protect the security of your information and are constantly reviewing and enhancing our information security measures.</p><div className="mt-5 flex flex-col gap-2 not-italic text-sm text-black sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-8"><span>Website: {company.website}</span><span>Contact Email: {company.email}</span></div></footer></article></section>;
}
function DetailList({ rows }: { rows: [string, string][] }) { return <dl className="space-y-3 text-sm">{rows.map(([label, value]) => <Field key={label} label={label} value={value} />)}</dl>; }
function Field({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[minmax(105px,1fr)_minmax(0,1.35fr)] gap-2"><dt className="font-bold">{label}</dt><dd className="break-words">: {value}</dd></div>; }
function Photo({ imageUrl, name }: { imageUrl?: string; name: string }) { return <div className="flex h-[48mm] w-[34mm] items-center justify-center overflow-hidden border border-slate-300 bg-slate-100 text-center text-xs text-slate-500">{imageUrl ? <img src={imageUrl} alt={`${name} profile`} className="h-full w-full object-cover" /> : "No Photo"}</div>; }
