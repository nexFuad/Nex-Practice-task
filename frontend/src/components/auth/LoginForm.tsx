"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type DemoAccount = {
  label: string;
  employeeId: string;
  company: string;
};

const demoAccounts: DemoAccount[] = [
  { label: "OM Demo", employeeId: "OM001", company: "Azovis" },
  {
    label: "Officer Demo",
    employeeId: "officer-demo",
    company: "Guardly Security",
  },
  { label: "Admin Demo", employeeId: "admin-demo", company: "Guardly Admin" },
];

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const applyDemoAccount = (account: DemoAccount) => {
    setEmployeeId(account.employeeId);
    setCompany(account.company);
    setPassword(account.label === "OM Demo" ? "om12345" : "demo-password");
    setMessage(`${account.label} credentials are ready.`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isOmDemo =
      employeeId.trim().toLowerCase() === "om001" &&
      company.trim().toLowerCase() === "azovis" &&
      password === "om12345";

    if (isOmDemo) {
      router.push("/om/dashboard");
      return;
    }

    setMessage("Use the OM demo credentials below to access the dashboard.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
        <div className="text-center">
          <div className="mx-auto grid size-18 place-items-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck
              className="size-9"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
            Welcome Back
          </h1>
          <p className="mt-2 text-lg text-slate-500">Sign in to your account</p>
        </div>

        <form className="mt-10" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-base font-medium text-slate-600">
                Employee ID
              </span>
              <span className="relative block">
                <UserRound
                  className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  required
                  placeholder="Enter your employee ID"
                  className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-14 pr-5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-base font-medium text-slate-600">
                Company
              </span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
                placeholder="Enter your company or tenant code"
                className="h-14 w-full rounded-xl border border-slate-300 bg-white px-5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-base font-medium text-slate-600">
                Password
              </span>
              <span className="relative block">
                <LockKeyhole
                  className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-14 pr-14 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-6" />
                  ) : (
                    <Eye className="size-6" />
                  )}
                </button>
              </span>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 text-sm sm:text-base">
            <label className="flex cursor-pointer items-center gap-3 text-slate-500">
              <input
                type="checkbox"
                className="size-5 rounded border-slate-400 accent-blue-600"
              />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="mt-6 h-12 w-full rounded-xl bg-linear-to-r from-blue-500 to-blue-700 text-base font-medium text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Sign In
          </button>
          {message && (
            <p className="mt-3 text-center text-sm text-blue-600" role="status">
              {message}
            </p>
          )}
        </form>

        <Link
          href="/"
          className="mx-auto mt-7 flex w-fit items-center gap-3 text-base text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          Back to Home
        </Link>

        <div className="my-10 flex items-center gap-3 text-center text-sm text-slate-500 sm:text-base">
          <span className="h-px flex-1 bg-slate-300" />
          <span className="shrink-0">Or continue with demo account</span>
          <span className="h-px flex-1 bg-slate-300" />
        </div>
        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-blue-700">OM Demo:</span> ID{" "}
          <span className="font-medium">OM001</span> · Company{" "}
          <span className="font-medium">Azovis</span> · Password{" "}
          <span className="font-medium">om12345</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => (
            <button
              key={account.label}
              type="button"
              onClick={() => applyDemoAccount(account)}
              className="h-11 rounded-xl border border-blue-200 bg-white text-base font-medium text-blue-600 transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {account.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
