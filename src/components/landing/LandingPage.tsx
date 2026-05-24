"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ContactSection } from "./ContactSection";

const BRAND = "#81007f";

function RevealSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`landing-reveal ${className}`}>
      {children}
    </section>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-neutral-600 transition hover:text-[#81007f]"
    >
      {children}
    </a>
  );
}

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#81007f] to-fuchsia-500 text-white shadow-[0_8px_24px_rgba(129,0,127,0.35)] ring-1 ring-white/25">
      {children}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="landing-animate-glow pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-fuchsia-400/30 via-[#81007f]/20 to-violet-300/25 blur-3xl"
        aria-hidden
      />

      <div className="landing-animate-float relative overflow-hidden rounded-3xl border border-purple-200/60 bg-white/90 p-6 shadow-[0_0_0_1px_rgba(129,0,127,0.12),0_24px_64px_rgba(129,0,127,0.18),0_0_80px_rgba(168,85,247,0.12)] backdrop-blur-sm sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Live tracking
            </span>
          </div>
          <span className="rounded-full bg-[#81007f]/10 px-3 py-1 text-xs font-bold text-[#81007f]">
            Instant delivery
          </span>
        </div>

        <svg
          viewBox="0 0 400 220"
          className="w-full"
          aria-hidden
          role="img"
        >
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9d33a0" />
              <stop offset="50%" stopColor="#81007f" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="400" height="220" rx="16" fill="#faf8fb" />

          <path
            d="M40 160 Q120 80 200 120 T360 90"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            className="landing-route-line"
          />

          <circle cx="40" cy="160" r="10" fill="#81007f" opacity="0.2" />
          <circle cx="40" cy="160" r="5" fill="#81007f" />

          <circle cx="200" cy="120" r="8" fill="#f59e0b" opacity="0.25" />
          <circle cx="200" cy="120" r="4" fill="#f59e0b" />

          <circle cx="360" cy="90" r="10" fill="#10b981" opacity="0.2" />
          <circle cx="360" cy="90" r="5" fill="#10b981" />

          <g className="landing-animate-float-delayed" transform="translate(168, 95)">
            <rect x="0" y="8" width="48" height="28" rx="6" fill="#81007f" />
            <rect x="36" y="4" width="20" height="20" rx="4" fill="#6a0068" />
            <circle cx="12" cy="40" r="6" fill="#374151" />
            <circle cx="40" cy="40" r="6" fill="#374151" />
          </g>
        </svg>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Pickup", value: "12:04", sub: "Lagos" },
            { label: "In transit", value: "24 min", sub: "En route" },
            { label: "Drop-off", value: "12:38", sub: "Abuja" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-purple-100/80 bg-gradient-to-b from-white to-fuchsia-50/40 px-3 py-2.5 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#81007f]">{item.value}</p>
              <p className="text-[10px] text-neutral-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="landing-animate-float-delayed absolute -left-4 top-8 hidden rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(129,0,127,0.15)] sm:block lg:-left-8"
        aria-hidden
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Avg. match time
        </p>
        <p className="text-xl font-bold text-[#81007f]">&lt; 3 min</p>
      </div>

      <div
        className="landing-animate-float absolute -right-2 bottom-12 hidden rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(129,0,127,0.15)] sm:block lg:-right-6"
        aria-hidden
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Secure pay
        </p>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Paystack
        </p>
      </div>
    </div>
  );
}

const MARQUEE_ITEMS = [
  "Instant rider matching",
  "Live GPS tracking",
  "Paystack checkout",
  "Scheduled pickups",
  "Volume-based pricing",
  "Complaints & support",
  "Rider dashboard",
  "Admin operations",
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf8fb] text-neutral-900">
      {/* Background mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="landing-animate-gradient absolute -left-1/4 -top-1/4 h-[70vh] w-[70vh] rounded-full bg-gradient-to-br from-fuchsia-300/40 via-[#81007f]/15 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-[50vh] w-[50vh] rounded-full bg-gradient-to-bl from-violet-300/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[40vh] w-[40vh] rounded-full bg-gradient-to-t from-purple-200/40 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(129,0,127,0.07) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-purple-100/60 bg-white/75 backdrop-blur-xl safe-area-inset">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6a0068] to-[#81007f] text-sm font-bold text-white shadow-[0_4px_20px_rgba(129,0,127,0.4)] ring-1 ring-white/20 transition group-hover:shadow-[0_6px_28px_rgba(129,0,127,0.5)]">
              E
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[#81007f]">
              Enta<span className="text-neutral-800">Logistics</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#roles">For everyone</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#81007f] transition hover:bg-[#81007f]/5 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(129,0,127,0.4)] ring-1 ring-white/20 transition hover:shadow-[0_8px_32px_rgba(129,0,127,0.5)] sm:px-5"
            >
              <span className="relative z-10">Get started</span>
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
                style={{ animation: "landing-shimmer 3s ease-in-out infinite" }}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="landing-animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#81007f] shadow-[0_0_20px_rgba(129,0,127,0.12)] lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#81007f] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#81007f]" />
              </span>
              Nigeria&apos;s smart logistics platform
            </p>

            <h1 className="landing-animate-fade-up-delay-1 mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.25rem]">
              Deliver faster.{" "}
              <span
                className="bg-gradient-to-r from-[#6a0068] via-[#81007f] to-fuchsia-500 bg-clip-text text-transparent"
                style={{ backgroundSize: "200% auto" }}
              >
                Track every mile.
              </span>
            </h1>

            <p className="landing-animate-fade-up-delay-2 mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg lg:mx-0">
              Book instant or scheduled shipments, pay securely with Paystack, and watch
              your package move in real time—from pickup to proof of delivery.
            </p>

            <div className="landing-animate-fade-up-delay-3 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/auth/signup"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-8 text-base font-semibold text-white shadow-[0_8px_32px_rgba(129,0,127,0.4)] ring-1 ring-white/25 transition hover:shadow-[0_12px_40px_rgba(129,0,127,0.5)] sm:w-auto"
              >
                Ship your first package
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-[#81007f]/40 bg-white/80 px-8 text-base font-semibold text-[#81007f] shadow-[0_4px_20px_rgba(129,0,127,0.08)] backdrop-blur-sm transition hover:border-[#81007f] hover:bg-white sm:w-auto"
              >
                Sign in to dashboard
              </Link>
            </div>

            <dl className="landing-animate-fade-up-delay-3 mt-10 grid grid-cols-3 gap-4 border-t border-purple-100/80 pt-8 sm:gap-6">
              {[
                { stat: "Instant", label: "Rider matching" },
                { stat: "Live", label: "GPS tracking" },
                { stat: "Secure", label: "Paystack payments" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-lg font-bold text-[#81007f] sm:text-xl">{item.stat}</dt>
                  <dd className="mt-0.5 text-xs text-neutral-500 sm:text-sm">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-purple-100/60 bg-white/60 py-4 backdrop-blur-sm">
        <div className="overflow-hidden">
          <div className="landing-marquee-track flex w-max gap-8 whitespace-nowrap px-4">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#81007f]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <RevealSection id="features" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#81007f]">
              Features
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Everything you need to move goods with confidence
            </h2>
            <p className="mt-4 text-neutral-600">
              Built for businesses and individuals who expect transparency, speed, and
              control at every step.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Instant & scheduled delivery",
                desc: "Match the nearest rider in minutes or book a pickup window up to seven days ahead.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Smart pricing",
                desc: "Transparent quotes from distance, weight, and package volume—see the breakdown before you pay.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: "Live maps & tracking",
                desc: "Follow your shipment on an interactive map with turn-by-turn context for riders and clients.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: "Secure Paystack checkout",
                desc: "Pay before dispatch with encrypted checkout—retry safely if you need another attempt.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              {
                title: "Rider operations",
                desc: "Dedicated rider app for offers, active jobs, history, and address book management.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: "Admin & support",
                desc: "Operations dashboard, financial reports, complaints handling, and fleet oversight in one place.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-purple-200/50 bg-white/90 p-6 shadow-[0_4px_24px_rgba(129,0,127,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#81007f]/30 hover:shadow-[0_12px_40px_rgba(129,0,127,0.12)]"
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <h3 className="mt-4 text-lg font-bold text-neutral-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* How it works */}
      <RevealSection
        id="how-it-works"
        className="bg-gradient-to-b from-white via-[#faf8fb] to-fuchsia-50/30 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#81007f]">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Three steps from quote to delivery
            </h2>
          </div>

          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create & get a quote",
                desc: "Enter pickup and drop-off details, dimensions, and weight. Our calculator shows a fair price instantly.",
              },
              {
                step: "02",
                title: "Pay & dispatch",
                desc: "Complete checkout with Paystack. Once paid, instant shipments are matched to the nearest available rider.",
              },
              {
                step: "03",
                title: "Track to delivery",
                desc: "Monitor progress on the map, get notifications, and confirm when your package arrives.",
              },
            ].map((item, index) => (
              <li key={item.step} className="relative">
                {index < 2 && (
                  <div
                    className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-[#81007f]/40 to-transparent md:block"
                    aria-hidden
                  />
                )}
                <div className="relative rounded-2xl border border-purple-200/50 bg-white p-8 text-center shadow-[0_8px_32px_rgba(129,0,127,0.08)]">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#81007f] to-fuchsia-500 font-display text-xl font-bold text-white shadow-[0_8px_24px_rgba(129,0,127,0.35)]">
                    {item.step}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-neutral-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </RevealSection>

      {/* Roles */}
      <RevealSection id="roles" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-purple-200/60 bg-gradient-to-br from-[#6a0068] via-[#81007f] to-fuchsia-600 p-8 text-white shadow-[0_24px_80px_rgba(129,0,127,0.35)] sm:p-12 lg:p-16">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Built for clients, riders, and operators
                </h2>
                <p className="mt-4 text-lg text-white/85">
                  Whether you&apos;re sending a parcel, earning on deliveries, or running
                  logistics at scale—EntaLogistics gives each role the tools they need.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/auth/signup"
                    className="inline-flex min-h-[44px] items-center rounded-xl bg-white px-6 text-sm font-bold text-[#81007f] shadow-lg transition hover:bg-fuchsia-50"
                  >
                    Create client account
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Rider or admin login
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { role: "Clients", desc: "Book, pay, track, and manage shipments" },
                  { role: "Riders", desc: "Accept jobs, navigate, and complete deliveries" },
                  { role: "Admins", desc: "Oversee fleet, reports, and support" },
                ].map((card) => (
                  <div
                    key={card.role}
                    className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition hover:bg-white/15"
                  >
                    <p className="font-display text-lg font-bold">{card.role}</p>
                    <p className="mt-1 text-sm text-white/80">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Contact */}
      <RevealSection
        id="contact"
        className="bg-gradient-to-b from-fuchsia-50/40 via-white to-[#faf8fb] px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <ContactSection />
        </div>
      </RevealSection>

      {/* CTA */}
      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-purple-200/60 bg-white px-6 py-12 text-center shadow-[0_16px_48px_rgba(129,0,127,0.1)] sm:px-12">
          <h2 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
            Ready to move your next shipment?
          </h2>
          <p className="mt-3 text-neutral-600">
            Join EntaLogistics and experience delivery that keeps you in the loop.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl px-8 text-base font-semibold text-white shadow-[0_8px_32px_rgba(129,0,127,0.4)] transition hover:shadow-[0_12px_40px_rgba(129,0,127,0.5)]"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #d946ef)` }}
          >
            Get started — it&apos;s free to sign up
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100/80 bg-white/80 px-4 py-10 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#81007f] text-xs font-bold text-white">
              E
            </span>
            <span className="text-sm font-semibold text-neutral-700">
              EntaLogistics © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
            <Link href="/auth/login" className="transition hover:text-[#81007f]">
              Log in
            </Link>
            <Link href="/auth/signup" className="transition hover:text-[#81007f]">
              Sign up
            </Link>
            <a href="#features" className="transition hover:text-[#81007f]">
              Features
            </a>
            <a href="#contact" className="transition hover:text-[#81007f]">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
