"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatAdminDate } from "@/lib/admin-api";
import {
  getAdminMessageById,
  displayMessageSubject,
  messageReadNeonClass,
  type AdminContactMessage,
} from "@/lib/messages-api";

const backLinkClass =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.12)] transition hover:border-fuchsia-400/35 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(232,121,249,0.25)]";

const glassCard =
  "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6";

function NeonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-950 via-[#1a0a24] to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-20px_rgba(192,38,211,0.55),0_32px_64px_-24px_rgba(0,0,0,0.65)]">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(129,0,127,0.12)_0%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative p-6 sm:p-8">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white/95 sm:text-base">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">{children}</h2>
  );
}

export default function AdminMessageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [message, setMessage] = useState<AdminContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getAdminMessageById(id);
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) setMessage(res.data);
      else setError(res.message || "Message not found");
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <NeonShell>
        <div
          className="flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
          Loading message…
        </div>
      </NeonShell>
    );
  }

  if (error || !message) {
    return (
      <NeonShell>
        <div className="space-y-4">
          <Link href="/admin/messages" className={backLinkClass}>
            ← Back to messages
          </Link>
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-4 text-sm text-red-100"
            role="alert"
          >
            {error || "Message not found"}
          </div>
        </div>
      </NeonShell>
    );
  }

  const replyHref = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
    `Re: ${displayMessageSubject(message.subject)}`
  )}`;

  return (
    <NeonShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link href="/admin/messages" className={`${backLinkClass} w-fit`}>
              ← Back to messages
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {displayMessageSubject(message.subject)}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={messageReadNeonClass(message.readAt)}>
                {message.readAt ? "Read" : "Unread"}
              </span>
              <span className="text-sm text-white/45">Received {formatAdminDate(message.createdAt)}</span>
            </div>
          </div>
          <a
            href={replyHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#81007f] to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(129,0,127,0.45)] ring-1 ring-white/15 transition hover:shadow-[0_0_36px_rgba(217,70,239,0.5)]"
          >
            Reply by email
          </a>
        </div>

        <section className="space-y-3">
          <SectionTitle>Sender</SectionTitle>
          <div className={`${glassCard} grid gap-4 sm:grid-cols-2`}>
            <DetailRow label="Name" value={message.name} />
            <DetailRow
              label="Email"
              value={
                <a href={`mailto:${message.email}`} className="text-fuchsia-200 hover:underline">
                  {message.email}
                </a>
              }
            />
            <DetailRow
              label="Phone"
              value={
                <a href={`tel:${message.phone}`} className="text-fuchsia-200 hover:underline">
                  {message.phone}
                </a>
              }
            />
            <DetailRow
              label="Email delivery"
              value={
                <span className="capitalize text-white/80">
                  {message.emailDeliveryStatus.replace(/_/g, " ")}
                </span>
              }
            />
            {message.readAt ? (
              <DetailRow label="Opened" value={formatAdminDate(message.readAt)} />
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>Message</SectionTitle>
          <div className={glassCard}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90 sm:text-base">
              {message.message}
            </p>
          </div>
        </section>
      </div>
    </NeonShell>
  );
}
