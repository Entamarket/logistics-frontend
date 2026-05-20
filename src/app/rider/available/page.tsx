"use client";

import {
  RiderEmptyState,
  RiderPageHeader,
  RiderShell,
} from "@/components/rider/RiderUI";

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

export default function RiderAvailableDeliveriesPage() {
  return (
    <RiderShell className="max-w-2xl">
      <div className="space-y-6">
        <RiderPageHeader
          badge="Job board"
          title="Available deliveries"
          description="Shipments waiting for a rider appear here with pickup and drop-off summaries. Accept a job when you're ready to roll."
          icon={<PackageIcon className="h-6 w-6" />}
        />
        <RiderEmptyState
          icon={<PackageIcon className="h-7 w-7" />}
          title="No open jobs right now"
          description="Check back soon or turn on availability in Profile when you're on duty."
        />
      </div>
    </RiderShell>
  );
}
