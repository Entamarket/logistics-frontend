export default function RiderOverviewPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Overview</h1>
      <p className="mt-2 text-sm sm:text-base text-neutral-600">
        Welcome to the rider dashboard. Check available deliveries to accept new jobs, use active delivery while you are on a route, and review your history when you are done.
      </p>
      <p className="mt-4 text-sm text-neutral-500">
        Summary stats and quick actions can be wired here once rider-specific shipment APIs are available.
      </p>
    </div>
  );
}
