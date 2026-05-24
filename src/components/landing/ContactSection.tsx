"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@entamarket.com";
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+234 800 000 0000";

const inputClass =
  "mt-1.5 block w-full min-h-[44px] rounded-xl border border-purple-200/70 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-[0_2px_12px_rgba(15,23,42,0.04)] placeholder:text-neutral-400 transition focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/20";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim() || "EntaLogistics inquiry";
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    const body = [
      `Name: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      "",
      trimmedMessage,
    ].join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(trimmedSubject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
      <div className="lg:col-span-2">
        <p className="text-sm font-bold uppercase tracking-widest text-[#81007f]">
          Contact us
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          We&apos;re here to help
        </h2>
        <p className="mt-4 text-neutral-600">
          Questions about shipping, partnerships, or rider onboarding? Reach out and
          our team will get back to you within one business day.
        </p>

        <ul className="mt-8 space-y-4">
          {[
            {
              label: "Email",
              value: CONTACT_EMAIL,
              href: `mailto:${CONTACT_EMAIL}`,
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              ),
            },
            {
              label: "Phone",
              value: CONTACT_PHONE,
              href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`,
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              ),
            },
            {
              label: "Office hours",
              value: "Mon – Fri, 8:00 AM – 6:00 PM (WAT)",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              label: "Location",
              value: "Lagos, Nigeria",
              icon: (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </>
              ),
            },
          ].map((item) => (
            <li key={item.label}>
              <div className="flex gap-4 rounded-2xl border border-purple-200/50 bg-white/80 p-4 shadow-[0_4px_20px_rgba(129,0,127,0.06)] transition hover:border-[#81007f]/25 hover:shadow-[0_8px_28px_rgba(129,0,127,0.1)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#81007f] to-fuchsia-500 text-white shadow-[0_4px_16px_rgba(129,0,127,0.3)]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    aria-hidden
                  >
                    {item.icon}
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-0.5 block truncate text-sm font-semibold text-[#81007f] transition hover:text-[#6a0068]"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold text-neutral-800">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-neutral-500">
          Already have an account?{" "}
          <a
            href="/dashboard/complaints"
            className="font-semibold text-[#81007f] underline-offset-2 hover:underline"
          >
            Open a complaint
          </a>{" "}
          from your dashboard for shipment issues.
        </p>
      </div>

      <div className="lg:col-span-3">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-purple-200/60 bg-white/95 p-6 shadow-[0_0_0_1px_rgba(129,0,127,0.1),0_16px_48px_rgba(129,0,127,0.1)] backdrop-blur-sm sm:p-8"
        >
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[#81007f] to-fuchsia-500 shadow-[0_0_12px_rgba(129,0,127,0.4)]" />

          <h3 className="mt-5 font-display text-xl font-bold text-neutral-900">
            Send us a message
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Your email app will open with your message ready to send.
          </p>

          {error && (
            <div
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {sent && !error && (
            <div
              className="mt-5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              role="status"
            >
              If your email app didn&apos;t open, write to us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
                {CONTACT_EMAIL}
              </a>
              .
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="contact-name" className="block text-sm font-semibold text-neutral-800">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="contact-email" className="block text-sm font-semibold text-neutral-800">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-subject" className="block text-sm font-semibold text-neutral-800">
                Subject <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="How can we help?"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-message" className="block text-sm font-semibold text-neutral-800">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className={`${inputClass} min-h-[120px] resize-y`}
                placeholder="Tell us about your shipment, partnership idea, or question..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-6 text-base font-semibold text-white shadow-[0_8px_28px_rgba(129,0,127,0.35)] ring-1 ring-white/20 transition hover:shadow-[0_12px_36px_rgba(129,0,127,0.45)] sm:w-auto sm:px-10"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
