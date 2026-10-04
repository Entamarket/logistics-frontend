"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clientStatusNeonClass,
  formatAdminDate,
  getAdmins,
  getAdminUserDisplayName,
  type AdminUser,
} from "@/lib/admin-api";

export default function AdminAdminsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm text-white/70">
          Loading admins…
        </div>
      }
    >
      <AdminAdminsList />
    </Suspense>
  );
}

function AdminAdminsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const created = searchParams.get("created") === "1";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getAdmins();
    setLoading(false);
    if (res.success && res.data) {
      setAdmins(res.data);
      return;
    }
    if (res.message?.toLowerCase().includes("admin access") || res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Failed to load admins");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

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

      <div className="relative space-y-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90 shadow-[0_0_20px_rgba(232,121,249,0.25)]">
              Access
            </p>
            <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent">
                Admins
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/55">
              Create additional admin accounts. New admins can sign in immediately with the password you set.
            </p>
          </div>
          <Link
            href="/admin/admins/create"
            className="group inline-flex min-h-[48px] items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-[#81007f] to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(129,0,127,0.55),0_12px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/20 transition hover:shadow-[0_0_40px_rgba(217,70,239,0.65),0_16px_32px_-8px_rgba(0,0,0,0.55)] hover:ring-fuchsia-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-xs">+</span>
            Create admin
          </Link>
        </div>

        {created && (
          <div
            className="rounded-2xl border border-emerald-400/40 bg-emerald-950/40 px-4 py-4 text-sm text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.2)]"
            role="status"
          >
            Admin account created. A credentials email will be sent if mail is configured.
          </div>
        )}

        {loading && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70"
            role="status"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
            Loading admins…
          </div>
        )}

        {error && (
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-4 text-sm text-red-100"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && admins.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white/90">No admins found</p>
            <p className="mt-2 text-sm text-white/45">Create another admin to share dashboard access.</p>
            <Link
              href="/admin/admins/create"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-5 text-sm font-medium text-fuchsia-100"
            >
              Create admin
            </Link>
          </div>
        )}

        {!loading && !error && admins.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Name
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Email
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                      Phone
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Status
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 md:table-cell">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {admins.map((admin) => {
                    const name = getAdminUserDisplayName(admin);
                    return (
                      <tr key={admin.id} className="transition-colors hover:bg-white/[0.06]">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/35 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/20 font-mono text-sm font-bold text-fuchsia-100">
                              {name.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-white/95">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-white/55">{admin.email}</td>
                        <td className="hidden px-4 py-4 font-mono text-sm text-white/65 sm:table-cell">
                          {admin.phone || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={clientStatusNeonClass(admin.status)}>{admin.status}</span>
                        </td>
                        <td className="hidden px-4 py-4 text-sm text-white/45 md:table-cell">
                          {formatAdminDate(admin.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
