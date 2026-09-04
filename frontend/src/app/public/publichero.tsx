import { ArrowRight, Play, ShieldCheck } from "lucide-react";

export function PublicHero() {
  return (
    <section
      id="platform"
      className="relative isolate overflow-hidden bg-slate-50 px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-10 lg:pt-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_18%,rgba(96,165,250,0.23),transparent_27%),radial-gradient(circle_at_13%_74%,rgba(186,230,253,0.34),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-45 bg-[linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)]" />
      <div className="mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-500 shadow-sm">
          <span className="rounded-full bg-blue-500 px-2 py-1 text-[10px] font-bold tracking-widest text-white">
            NEW
          </span>
          Real-time incident detection is live
        </div>
        <h1 className="mx-auto mt-8 max-w-5xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-8xl">
          Security operations,{" "}
          <span className="italic text-blue-500">reimagined</span> with
          intelligence.
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
          Guardly unifies guard management, live patrol tracking, and real-time
          incident detection into one command center — giving security companies
          and facility managers total transparency.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#how-it-works"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700"
          >
            Start Free Trial <ArrowRight className="size-4" />
          </a>
          <a
            href="#dashboard"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
          >
            <Play className="size-4 fill-current" /> Watch Demo
          </a>
        </div>
        <div className="mx-auto mt-14 max-w-5xl rounded-3xl border border-slate-200 bg-white/75 p-3 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-left sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3 text-white">
                <ShieldCheck className="size-5 text-emerald-400" />{" "}
                <span className="font-semibold">Guardly Command Center</span>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                All systems live
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["98%", "Checks completed"],
                ["24", "Guards on duty"],
                ["03", "Active incidents"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
