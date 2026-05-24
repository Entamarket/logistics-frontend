import Link from "next/link";
import type { ReactNode } from "react";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@entamarket.com";
const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+234 800 000 0000";

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-neutral-400 transition hover:text-white"
    >
      {children}
    </Link>
  );
}

function FooterAnchor({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-neutral-400 transition hover:text-white"
    >
      {children}
    </a>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-neutral-300">
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-[#81007f]/60 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6a0068] to-[#81007f] text-sm font-bold text-white shadow-[0_4px_20px_rgba(129,0,127,0.5)] ring-1 ring-white/10">
                E
              </span>
              <span className="font-display text-xl font-bold text-white">
                Enta<span className="text-neutral-400">Logistics</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
              Smart logistics for Nigeria — instant rider matching, live tracking,
              and secure Paystack payments from quote to delivery.
            </p>
          </div>

          <div className="lg:col-span-2 lg:col-start-6">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Product
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterAnchor href="#features">Features</FooterAnchor>
              </li>
              <li>
                <FooterAnchor href="#how-it-works">How it works</FooterAnchor>
              </li>
              <li>
                <FooterAnchor href="#roles">For everyone</FooterAnchor>
              </li>
              <li>
                <FooterLink href="/auth/signup">Get started</FooterLink>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Account
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href="/auth/login">Log in</FooterLink>
              </li>
              <li>
                <FooterLink href="/auth/signup">Sign up</FooterLink>
              </li>
              <li>
                <FooterLink href="/dashboard">Client dashboard</FooterLink>
              </li>
              <li>
                <FooterLink href="/rider">Rider portal</FooterLink>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Contact
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-neutral-400 transition hover:text-fuchsia-400"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="text-sm text-neutral-400 transition hover:text-white"
                >
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>
                <FooterAnchor href="#contact">Send a message</FooterAnchor>
              </li>
              <li className="text-sm text-neutral-500">Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-500">
            © {year} EntaLogistics. All rights reserved.
          </p>
          <p className="text-sm text-neutral-600">
            Powered by{" "}
            <span className="font-semibold text-neutral-400">EntaMarket</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
