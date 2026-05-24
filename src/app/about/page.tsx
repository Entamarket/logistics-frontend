import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FaBullseye,
  FaEye,
  FaHandshake,
} from "react-icons/fa";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import styles from "./About.module.css";
import teamImage from "../../../public/images/img.jpg";

export const metadata: Metadata = {
  title: "About Us | Entamarket Logistics",
  description:
    "Learn about Entamarket Logistics — our mission, values, and commitment to reliable global shipping.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <SiteHeader activePage="about" />

      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            About Us
          </p>
          <h1 className={styles.heroTitle}>
            Moving Businesses Forward With Trusted Logistics
          </h1>
          <p className={styles.heroSubtitle}>
            Entamarket Logistics connects shippers, carriers, and customers
            through smart planning, real-time tracking, and dependable delivery
            across local and international routes.
          </p>
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.storyInner}>
          <div className={styles.storyImage}>
            <Image
              src={teamImage}
              alt="Entamarket logistics team"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className={styles.storyText}>
            <span className={styles.label}>Our Story</span>
            <h2>Built For Speed, Visibility, And Scale</h2>
            <p>
              Entamarket Logistics was founded to solve a simple problem:
              businesses needed a partner who could handle the full shipment
              lifecycle — from pickup to final delivery — without losing
              visibility or control along the way.
            </p>
            <p>
              Today we support clients with air freight, road transport,
              warehousing, and end-to-end shipment management through our
              digital platform. Our team combines operational expertise with
              technology so every package is tracked, every route is optimized,
              and every customer stays informed.
            </p>
            <p>
              Whether you are shipping across town or across borders, we treat
              your cargo with the same care and accountability we would our own.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.mvv}>
        <div className={styles.mvvInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>What Drives Us</span>
            <h2>Mission, Vision &amp; Values</h2>
            <p>
              The principles that guide how we plan routes, serve customers,
              and grow as a logistics partner.
            </p>
          </div>

          <div className={styles.mvvGrid}>
            <article className={styles.mvvCard}>
              <div className={styles.mvvIcon}>
                <FaBullseye />
              </div>
              <h3>Our Mission</h3>
              <p>
                To deliver reliable, transparent logistics solutions that help
                businesses move goods faster, safer, and at lower total cost.
              </p>
            </article>

            <article className={styles.mvvCard}>
              <div className={styles.mvvIcon}>
                <FaEye />
              </div>
              <h3>Our Vision</h3>
              <p>
                To become the most trusted logistics platform in Africa and
                beyond — known for innovation, accountability, and customer
                success.
              </p>
            </article>

            <article className={styles.mvvCard}>
              <div className={styles.mvvIcon}>
                <FaHandshake />
              </div>
              <h3>Our Values</h3>
              <p>
                Integrity in every handoff, precision in every route, and
                partnership in every relationship — from first quote to final
                delivery.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statsInner}>
          <div className={styles.statItem}>
            <h3>10+</h3>
            <p>Years of combined logistics experience</p>
          </div>
          <div className={styles.statItem}>
            <h3>1M+</h3>
            <p>Shipments coordinated and delivered</p>
          </div>
          <div className={styles.statItem}>
            <h3>150+</h3>
            <p>Countries and regions served</p>
          </div>
          <div className={styles.statItem}>
            <h3>98%</h3>
            <p>On-time delivery performance</p>
          </div>
        </div>
      </section>

      <section className={styles.timeline}>
        <div className={styles.timelineInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>How We Work</span>
            <h2>Your Shipment, Handled End To End</h2>
            <p>
              A clear process from consultation to delivery — so you always know
              what happens next.
            </p>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>01</span>
              <h3>Consult &amp; Plan</h3>
              <p>
                We assess your routes, timelines, and budget to build a tailored
                logistics plan.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>02</span>
              <h3>Pickup &amp; Store</h3>
              <p>
                Secure collection and warehousing keep inventory organized and
                ready to move.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>03</span>
              <h3>Ship &amp; Track</h3>
              <p>
                Real-time tracking across air, road, and sea with proactive
                status updates.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>04</span>
              <h3>Deliver &amp; Support</h3>
              <p>
                Final-mile delivery with 24/7 support for changes, claims, and
                follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready To Ship With Entamarket?</h2>
        <p>
          Create an account to book shipments, track deliveries, and manage your
          logistics from one dashboard.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/auth/signup" className={styles.ctaPrimary}>
            Get Started
          </Link>
          <Link href="/contact" className={styles.ctaSecondary}>
            Contact Us
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
