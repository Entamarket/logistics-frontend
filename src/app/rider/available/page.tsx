export default function RiderAvailableDeliveriesPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Available deliveries</h1>
      <p className="mt-2 text-sm sm:text-base text-neutral-600">
        Shipments waiting for a rider will appear here. You will be able to see pickup and drop-off areas, package summary, and accept a job from this list.
      </p>
      <p className="mt-4 text-sm text-neutral-500">No open jobs to show yet.</p>
    </div>
  );
}
