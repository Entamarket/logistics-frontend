import Link from "next/link";
import type { ReactNode } from "react";
import { LandingBrand } from "./LandingBrand";

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
          <div className="lg:col-span-3">
            <LandingBrand variant="footer" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
              Smart logistics for Nigeria — instant rider matching, live tracking,
              and secure Paystack payments from quote to delivery.
            </p>
          </div>

          <div className="lg:col-span-2 lg:col-start-5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Product
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href="/#features">Features</FooterLink>
              </li>
              <li>
                <FooterLink href="/#how-it-works">How it works</FooterLink>
              </li>
              <li>
                <FooterLink href="/#roles">For everyone</FooterLink>
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

          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Legal
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink href="/terms">Terms of Service</FooterLink>
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
                <FooterLink href="/#contact">Send a message</FooterLink>
              </li>
              <li className="text-sm text-neutral-500">Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-500">
            © {year} Entamarket Logistics. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <p className="text-sm text-neutral-600">
              Powered by{" "}
              <span className="font-semibold text-neutral-400">EntaMarket</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
