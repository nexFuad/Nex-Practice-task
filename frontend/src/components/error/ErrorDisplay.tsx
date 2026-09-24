"use client";

import { ArrowLeft, RotateCcw, ShieldAlert } from "lucide-react";
import { useSyncExternalStore } from "react";

type ErrorDisplayProps = {
  kind: "not-found" | "unexpected";
  onRetry?: () => void;
  reference?: string;
  variant?: "page" | "inline";
  error?: unknown;
};

export function ErrorDisplay({
  kind,
  onRetry,
  reference,
  variant = "page",
  error,
}: ErrorDisplayProps) {
  const path = useSyncExternalStore(
    () => () => {},
    () => window.location.pathname,
    () => "",
  );
  const notFound = kind === "not-found";
  const networkError = error instanceof TypeError;
  const title = notFound ? "Page not found" : networkError ? "Connection problem" : "Something went wrong";
  const reason = notFound
    ? "No page matches this address. The link may be incorrect or the page may have moved."
    : networkError
      ? "Unable to connect to the server. Check your connection and try again."
      : "This part of the page could not load. Please try again.";

  if (variant === "inline") {
    return (
      <div role="alert" className="flex flex-col items-center py-10 text-center text-slate-800">
        <ShieldAlert className="size-7 text-blue-600" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">{reason}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#f4f7fc] px-6 py-8 text-slate-900 sm:px-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
      <header className="relative flex items-center justify-center gap-2 text-sm font-bold tracking-widest text-blue-700">
        <ShieldAlert className="size-6" aria-hidden="true" />
        GUARDLY
      </header>
      <section className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="flex size-18 items-center justify-center rounded-full border border-blue-200 bg-white/75 text-blue-600 shadow-sm">
          <ShieldAlert className="size-9" aria-hidden="true" />
        </div>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
          {notFound ? "Error 404" : "Application error"}
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          {notFound ? "We couldn't find the page you requested." : "We couldn't complete this page right now."}
        </p>
        <div className="mt-8 h-px w-16 bg-blue-300" aria-hidden="true" />
        <p className="mt-7 text-sm font-semibold text-slate-800">Why this happened</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">{reason}</p>
        {path && (
          <p className="mt-6 max-w-full break-all text-center text-xs text-slate-500 sm:text-sm">
            Requested path: <span className="font-mono text-slate-700">{path}</span>
          </p>
        )}
        {reference && (
          <p className="mt-2 max-w-full break-all font-mono text-xs text-slate-500">Error reference: {reference}</p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => window.history.back()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go back
          </button>
          {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </section>
      <footer className="relative text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        {notFound ? "Page not found" : "Unexpected error"} · Guardly
      </footer>
    </main>
  );
}
