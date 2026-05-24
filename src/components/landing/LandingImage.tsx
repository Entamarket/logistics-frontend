"use client";

import Image from "next/image";
import { useState } from "react";
import type { LandingImageMeta } from "./landing-images";

const ASPECT = {
  hero: "aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4]",
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
  card: "aspect-[4/3]",
} as const;

type Aspect = keyof typeof ASPECT;

export function LandingImage({
  image,
  aspect = "card",
  priority = false,
  className = "",
  rounded = "rounded-2xl",
  variant = "light",
  animate = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  fill = false,
}: {
  image: LandingImageMeta;
  aspect?: Aspect;
  priority?: boolean;
  className?: string;
  rounded?: string;
  variant?: "light" | "dark";
  animate?: boolean;
  sizes?: string;
  /** Fill the parent container (parent must have a defined height). */
  fill?: boolean;
}) {
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const isDark = variant === "dark";
  const sizeClass = fill ? "h-full min-h-full w-full" : ASPECT[aspect];

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${sizeClass} ${animate ? "landing-animate-float" : ""} ${className}`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover transition-opacity duration-500 ${showPlaceholder ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setShowPlaceholder(false)}
        onError={() => setShowPlaceholder(true)}
      />

      {showPlaceholder && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${
            isDark
              ? "border border-white/15 bg-neutral-900/80"
              : "border border-purple-200/60 bg-gradient-to-br from-[#faf8fb] via-white to-fuchsia-50/80"
          }`}
        >
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 12px,
                ${isDark ? "rgba(255,255,255,0.04)" : "rgba(129,0,127,0.06)"} 12px,
                ${isDark ? "rgba(255,255,255,0.04)" : "rgba(129,0,127,0.06)"} 24px
              )`,
            }}
            aria-hidden
          />

          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${
              isDark
                ? "bg-white/10 text-white/70 ring-1 ring-white/20"
                : "bg-[#81007f]/10 text-[#81007f] ring-1 ring-[#81007f]/20"
            }`}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <p
            className={`relative mt-4 text-sm font-semibold ${
              isDark ? "text-white" : "text-neutral-800"
            }`}
          >
            {image.label}
          </p>
          <p
            className={`relative mt-2 max-w-[220px] font-mono text-[10px] leading-relaxed ${
              isDark ? "text-white/50" : "text-neutral-500"
            }`}
          >
            Add{" "}
            <span className={isDark ? "text-fuchsia-300/90" : "text-[#81007f]"}>
              public/images/landing/{image.filename}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
