import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ffffff] flex flex-col items-center justify-center safe-area-inset sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 sm:mb-8 text-lg sm:text-xl font-bold text-[#81007f] hover:underline tap-highlight-none"
      >
        Logistics
      </Link>
      <div className="w-full max-w-md px-0 sm:px-1">{children}</div>
    </div>
  );
}
