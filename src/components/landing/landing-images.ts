/** Drop your photos into `public/images/landing/` using these exact filenames. */

export type LandingImageKey =
  | "hero"
  | "galleryDelivery"
  | "galleryTracking"
  | "galleryRider"
  | "galleryWarehouse"
  | "stepQuote"
  | "stepPay"
  | "stepTrack"
  | "rolesTeam"
  | "ctaBackground";

export interface LandingImageMeta {
  src: string;
  alt: string;
  label: string;
  filename: string;
}

export const LANDING_IMAGES: Record<LandingImageKey, LandingImageMeta> = {
  hero: {
    src: "/images/landing/hero.png",
    alt: "EntaLogistics rider delivering a package in Lagos",
    label: "Hero — delivery in action",
    filename: "hero.png",
  },
  galleryDelivery: {
    src: "/images/landing/gallery-delivery.jpg",
    alt: "Courier handing a package to a customer",
    label: "Package handoff",
    filename: "gallery-delivery.jpg",
  },
  galleryTracking: {
    src: "/images/landing/gallery-tracking.jpg",
    alt: "Customer tracking a shipment on their phone",
    label: "Live tracking on mobile",
    filename: "gallery-tracking.jpg",
  },
  galleryRider: {
    src: "/images/landing/gallery-rider.jpg",
    alt: "Rider on a motorcycle with delivery bag",
    label: "Rider on the road",
    filename: "gallery-rider.jpg",
  },
  galleryWarehouse: {
    src: "/images/landing/gallery-warehouse.jpg",
    alt: "Packages organized at a logistics hub",
    label: "Logistics hub",
    filename: "gallery-warehouse.jpg",
  },
  stepQuote: {
    src: "/images/landing/step-quote.png",
    alt: "Person entering shipment details on a laptop",
    label: "Step 1 — create shipment",
    filename: "step-quote.png",
  },
  stepPay: {
    src: "/images/landing/step-pay.png",
    alt: "Secure mobile payment for a delivery",
    label: "Step 2 — pay with Paystack",
    filename: "step-pay.png",
  },
  stepTrack: {
    src: "/images/landing/step-track.png",
    alt: "Map showing an active delivery route",
    label: "Step 3 — track delivery",
    filename: "step-track.png",
  },
  rolesTeam: {
    src: "/images/landing/roles-team.jpg",
    alt: "Logistics team coordinating deliveries",
    label: "Clients, riders & operators",
    filename: "roles-team.jpg",
  },
  ctaBackground: {
    src: "/images/landing/cta-background.jpg",
    alt: "Fleet of delivery vehicles ready to dispatch",
    label: "CTA background",
    filename: "cta-background.jpg",
  },
};
