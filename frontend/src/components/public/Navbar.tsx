"use client";

import { ArrowRight, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  ["Platform", "#platform"],
  ["How It Works", "#how-it-works"],
  ["Dashboard", "#dashboard"],
  ["For Facilities", "#facilities"],
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        aria-label="Main navigation"
      >
        <a href="#platform" className="flex items-center gap-3" onClick={closeMenu}>
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">Guardly</span>
        </a>

        <div className="hidden items-center gap-9 lg:flex">
          {navigation.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-500 transition hover:text-slate-950">
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/login" className="text-sm font-semibold text-slate-900 transition hover:text-blue-700">
            Login
          </Link>
          <a href="#platform" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            Start Free Trial <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg text-slate-900 transition hover:bg-slate-200 lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-slate-50 px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
                {label}
              </a>
            ))}
            <Link href="/login" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200">
              Login
            </Link>
            <a href="#platform" onClick={closeMenu} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
              Start Free Trial <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
