import Link from "next/link";
import type { ReactNode } from "react";
import { LandingBrand } from "./LandingBrand";
import { LandingFooter } from "./LandingFooter";

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf8fb] text-neutral-900">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vh] rounded-full bg-gradient-to-br from-fuchsia-300/40 via-[#81007f]/15 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-[50vh] w-[50vh] rounded-full bg-gradient-to-bl from-violet-300/30 to-transparent blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-purple-100/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <LandingBrand />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#81007f] transition hover:bg-[#81007f]/5 sm:inline-flex"
            >
              Home
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(129,0,127,0.4)] ring-1 ring-white/20"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-[#81007f]">Legal</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: {lastUpdated}</p>
        <div className="legal-prose mt-10 space-y-8 text-[15px] leading-relaxed text-neutral-700">
          {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}
