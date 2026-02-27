import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-[#ffffff] safe-area-inset sm:px-6">
      <main className="flex flex-col items-center gap-6 sm:gap-8 text-center w-full max-w-sm mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#81007f]">Logistics</h1>
        <p className="max-w-md text-sm sm:text-base text-neutral-600">
          Sign in or create an account to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto rounded-lg bg-[#81007f] px-6 py-3.5 font-medium text-white transition hover:bg-[#6a0068] active:bg-[#5a0058] min-h-[44px] flex items-center justify-center"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto rounded-lg border-2 border-[#81007f] px-6 py-3.5 font-medium text-[#81007f] transition hover:bg-[#81007f] hover:text-white active:bg-[#6a0068] min-h-[44px] flex items-center justify-center"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
