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
import { login } from "@/Services/auth";
import { setSignedInUser } from "./auth.session";
import { SessionRedirect } from "../SessionRedirect";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await login({ employeeId, company, password, rememberMe });
      setSignedInUser(result.user);
      router.push(result.dashboardPath);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SessionRedirect>
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6">
        <section className="w-full max-w-md rounded-xl border-0 bg-white p-8 shadow-sm backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-blue-600 text-white">
              <ShieldCheck className="size-8" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to your account
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Employee ID
                </span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={employeeId}
                    onChange={(event) => setEmployeeId(event.target.value)}
                    required
                    placeholder="Enter your employee ID"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Company
                </span>
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  required
                  placeholder="Enter your company or tenant code"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 rounded border-slate-300 accent-blue-600"
                />
                <span>Remember me on this device</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
            {message && (
              <p className="text-center text-sm text-blue-600" role="status">
                {message}
              </p>
            )}
            <Link
              href="/"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  Available account roles
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["OM", "Officer", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                aria-disabled="true"
                className="h-8 cursor-default rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm"
              >
                {role}
              </button>
            ))}
          </div>
        </section>
      </main>
    </SessionRedirect>
  );
}
