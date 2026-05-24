import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FaPlane,
  FaShip,
  FaTruck,
  FaWarehouse,
  FaClipboardList,
  FaMapMarkedAlt,
  FaShippingFast,
  FaHeadset,
  FaBoxOpen,
  FaGlobe,
} from "react-icons/fa";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import styles from "./Services.module.css";
import airFreight from "../../../public/images/air_freight.png";
import seaFreight from "../../../public/images/sea_freight.png";
import roadTransport from "../../../public/images/road_transport.png";

export const metadata: Metadata = {
  title: "Our Services | Entamarket Logistics",
  description:
    "Explore Entamarket Logistics services — air freight, road transport, sea freight, warehousing, tracking, and end-to-end shipment management.",
};

const processSteps = [
  {
    number: "01",
    title: "Consultation & Planning",
    description:
      "We assess your routes, volumes, and timelines to build a customized logistics plan that maximizes efficiency and reduces cost.",
  },
  {
    number: "02",
    title: "Inventory & Warehousing",
    description:
      "Secure storage solutions tailored to your products, with organized inventory management and ready-to-ship fulfillment.",
  },
  {
    number: "03",
    title: "Transportation & Delivery",
    description:
      "Coordinated air, road, and sea freight with professional handling and optimized routes for on-time delivery.",
  },
  {
    number: "04",
    title: "Tracking & Communication",
    description:
      "Real-time shipment visibility and proactive updates so you and your customers always know where cargo is.",
  },
];

const freightServices = [
  {
    icon: FaPlane,
    image: airFreight,
    title: "Air Freight",
    description:
      "Fast international and domestic air cargo for time-sensitive shipments, perishables, and high-value goods.",
    features: [
      "Express & standard air options",
      "Airport-to-door delivery",
      "Customs clearance support",
    ],
  },
  {
    icon: FaShip,
    image: seaFreight,
    title: "Sea Freight",
    description:
      "Cost-effective ocean shipping for bulk cargo, containers, and large-volume international trade.",
    features: [
      "FCL & LCL container options",
      "Port-to-port & door-to-door",
      "Global carrier partnerships",
    ],
  },
  {
    icon: FaTruck,
    image: roadTransport,
    title: "Road Transport",
    description:
      "Reliable overland freight across cities and borders with flexible fleet options for every load size.",
    features: [
      "Full & partial truckload",
      "Last-mile delivery",
      "Cross-border logistics",
    ],
  },
];

const additionalServices = [
  {
    icon: FaWarehouse,
    title: "Warehousing",
    description:
      "Short- and long-term storage with inventory control, pick-and-pack, and distribution support.",
  },
  {
    icon: FaMapMarkedAlt,
    title: "Shipment Tracking",
    description:
      "Live tracking from pickup to delivery via our platform — booking numbers and BOL lookup supported.",
  },
  {
    icon: FaClipboardList,
    title: "Customs & Documentation",
    description:
      "Export/import paperwork, compliance checks, and clearance coordination to avoid delays.",
  },
  {
    icon: FaBoxOpen,
    title: "Packaging & Handling",
    description:
      "Professional packing, labeling, and cargo handling to protect goods in transit.",
  },
  {
    icon: FaGlobe,
    title: "International Logistics",
    description:
      "End-to-end global shipping to 150+ countries with trusted partners at every stage.",
  },
  {
    icon: FaHeadset,
    title: "Dedicated Support",
    description:
      "24/7 assistance for active shipments, status updates, and account management.",
  },
];

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <SiteHeader activePage="services" />

      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            Our Services
          </p>
          <h1 className={styles.heroTitle}>
            Complete Logistics Solutions For Every Shipment
          </h1>
          <p className={styles.heroSubtitle}>
            From planning and warehousing to air, sea, and road freight — we
            manage your supply chain with speed, visibility, and care.
          </p>
        </div>
      </section>

      <section className={styles.intro}>
        <div className={styles.introInner}>
          <span className={styles.label}>What We Offer</span>
          <h2>End-To-End Services Built For Your Business</h2>
          <p>
            Entamarket Logistics delivers a full suite of shipping and supply
            chain services — whether you move pallets across town or containers
            across continents.
          </p>
        </div>
      </section>

      <section className={styles.process}>
        <div className={styles.processInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>How It Works</span>
            <h2>Our Four-Step Process</h2>
            <p>
              A clear workflow from first consultation to final delivery and
              ongoing support.
            </p>
          </div>
          <div className={styles.processGrid}>
            {processSteps.map((step) => (
              <article key={step.number} className={styles.processCard}>
                <span className={styles.processNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.freight}>
        <div className={styles.freightInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>Transportation</span>
            <h2>Fast, Reliable &amp; Secure Freight</h2>
            <p>
              Multi-modal shipping options to match your budget, timeline, and
              cargo requirements.
            </p>
          </div>

          <div className={styles.freightGrid}>
            {freightServices.map((service) => (
              <article key={service.title} className={styles.freightCard}>
                <div className={styles.freightImage}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className={styles.freightBody}>
                  <span className={styles.freightIcon}>
                    <service.icon />
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>
                    {service.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.allServices}>
        <div className={styles.allServicesInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>More Capabilities</span>
            <h2>Additional Services</h2>
            <p>
              Everything you need beyond transport — storage, tracking, customs,
              and expert support.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {additionalServices.map((service) => (
              <article key={service.title} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>
                  <service.icon />
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Need A Custom Logistics Plan?</h2>
        <p>
          Tell us about your routes and volumes — we&apos;ll recommend the right
          mix of services and provide a competitive quote.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/contact" className={styles.ctaPrimary}>
            Request A Quote
          </Link>
          <Link href="/auth/signup" className={styles.ctaSecondary}>
            Get Started
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
