const STEPS = [
  "Pending payment",
  "Awaiting rider",
  "Rider assigned",
  "Picked up",
  "In transit",
  "Delivered",
] as const;

function stepIndex(status: string, paymentStatus: string): number {
  switch (status) {
    case "pending":
    case "scheduled":
      return paymentStatus === "paid" ? 1 : 0;
    case "searching_rider":
    case "awaiting_rider_response":
      return 1;
    case "rider_assigned":
      return 2;
    case "picked_up":
      return 3;
    case "in_transit":
      return 4;
    case "delivered":
      return 5;
    default:
      return 0;
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ShipmentProgressTracker({
  status,
  paymentStatus,
}: {
  status: string;
  paymentStatus: string;
}) {
  if (status === "cancelled") {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm"
        role="status"
      >
        This shipment was cancelled.
      </div>
    );
  }

  const current = stepIndex(status, paymentStatus);
  const isComplete = status === "delivered";
  const progress = (current / (STEPS.length - 1)) * 100;

  return (
    <section className="rounded-2xl border border-purple-100/90 bg-white p-5 shadow-lg shadow-purple-500/10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-neutral-900">{STEPS[current]}</h2>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#81007f] ring-1 ring-purple-100">
          Step {current + 1} of {STEPS.length}
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6a0068] to-[#81007f] transition-all duration-500"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>

      <ol className="mt-5 grid grid-cols-6">
        {STEPS.map((label, i) => {
          const done = i < current || (isComplete && i === current);
          const active = i === current && !isComplete;
          return (
            <li
              key={label}
              className="relative flex flex-col items-center px-0.5 text-center"
              aria-current={active ? "step" : undefined}
            >
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2 transition-colors duration-500 ${
                    i < current ? "bg-[#81007f]" : "bg-neutral-200"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                  done
                    ? "border-[#81007f] bg-[#81007f] text-white"
                    : active
                      ? "border-[#81007f] bg-white shadow-[0_0_0_4px_rgba(129,0,127,0.12)]"
                      : "border-neutral-200 bg-white"
                }`}
              >
                {done ? (
                  <CheckIcon className="h-4 w-4" />
                ) : active ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#81007f]" />
                ) : null}
              </span>
              <span
                className={`mt-2 text-[11px] leading-tight sm:text-xs ${
                  active
                    ? "font-bold text-[#81007f]"
                    : done
                      ? "font-medium text-neutral-700"
                      : "text-neutral-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
