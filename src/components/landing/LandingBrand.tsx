import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/images/logo/logo.jpg";

export function LandingBrand({ variant = "header" }: { variant?: "header" | "footer" }) {
  const isFooter = variant === "footer";

  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <Image
        src={LOGO_SRC}
        alt="Entamarket Logistics"
        width={isFooter ? 40 : 36}
        height={isFooter ? 40 : 36}
        className={`shrink-0 rounded-xl object-cover ring-1 ring-white/20 transition group-hover:shadow-[0_6px_28px_rgba(129,0,127,0.5)] ${
          isFooter
            ? "h-10 w-10 shadow-[0_4px_20px_rgba(129,0,127,0.5)]"
            : "h-9 w-9 shadow-[0_4px_20px_rgba(129,0,127,0.4)]"
        }`}
        priority={!isFooter}
      />
      <span
        className={`font-display font-bold tracking-tight ${
          isFooter ? "text-xl text-white" : "text-lg text-[#81007f]"
        }`}
      >
        Entamarket{" "}
        <span className={isFooter ? "text-neutral-400" : "text-neutral-800"}>Logistics</span>
      </span>
    </Link>
  );
}
