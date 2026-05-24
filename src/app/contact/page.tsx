import type { Metadata } from "next";
import Link from "next/link";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
} from "react-icons/fa";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import styles from "./Contact.module.css";

export const metadata: Metadata = {
  title: "Contact Us | Entamarket Logistics",
  description:
    "Get in touch with Entamarket Logistics for shipping quotes, tracking support, and partnership inquiries.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <SiteHeader activePage="contact" />

      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            Contact Us
          </p>
          <h1 className={styles.heroTitle}>We&apos;re Here To Help You Ship</h1>
          <p className={styles.heroSubtitle}>
            Reach our logistics team for quotes, tracking updates, account
            support, or partnership opportunities. We typically respond within
            one business day.
          </p>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.mainInner}>
          <div className={styles.intro}>
            <span className={styles.label}>Get In Touch</span>
            <h2>Contact Our Logistics Team</h2>
            <p>
              Whether you need a custom freight quote or help with an active
              shipment, our specialists are ready to assist by phone, email, or
              the form on this page.
            </p>

            <ul className={styles.contactDetails}>
              <li>
                <span className={styles.detailIcon}>
                  <FaPhone />
                </span>
                <div>
                  <strong>Phone</strong>
                  <a href="tel:+2348000000000">+234 800 000 0000</a>
                </div>
              </li>
              <li>
                <span className={styles.detailIcon}>
                  <FaEnvelope />
                </span>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:support@entamarket.com">
                    support@entamarket.com
                  </a>
                </div>
              </li>
              <li>
                <span className={styles.detailIcon}>
                  <FaMapMarkerAlt />
                </span>
                <div>
                  <strong>Head Office</strong>
                  <span>Lagos, Nigeria — Nationwide &amp; Global Delivery</span>
                </div>
              </li>
              <li>
                <span className={styles.detailIcon}>
                  <FaClock />
                </span>
                <div>
                  <strong>Business Hours</strong>
                  <span>Mon – Fri: 8:00 AM – 6:00 PM WAT</span>
                </div>
              </li>
              <li>
                <span className={styles.detailIcon}>
                  <FaHeadset />
                </span>
                <div>
                  <strong>24/7 Shipment Support</strong>
                  <span>Active customers can reach us anytime for urgent updates</span>
                </div>
              </li>
            </ul>

            <div className={styles.quickTopics}>
              <h3>Common inquiries</h3>
              <ul>
                <li>Request a freight or delivery quote</li>
                <li>Track an existing shipment</li>
                <li>Partner or carrier onboarding</li>
                <li>Billing and invoice questions</li>
              </ul>
            </div>
          </div>

          <form className={styles.formCard} action="#" method="post">
            <h3>Send us a message</h3>
            <p className={styles.formHint}>
              Fill out the form and we&apos;ll get back to you shortly.
            </p>

            <div className={styles.formRow}>
              <label className={styles.formField}>
                <span>Full Name</span>
                <input type="text" name="name" placeholder="John Doe" required />
              </label>
              <label className={styles.formField}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  required
                />
              </label>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formField}>
                <span>Phone (optional)</span>
                <input type="tel" name="phone" placeholder="+234..." />
              </label>
              <label className={styles.formField}>
                <span>Inquiry Type</span>
                <select name="inquiry" defaultValue="quote" required>
                  <option value="quote">Quote Request</option>
                  <option value="tracking">Tracking Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <label className={styles.formField}>
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                placeholder="Shipment inquiry"
                required
              />
            </label>

            <label className={styles.formField}>
              <span>Message</span>
              <textarea
                name="message"
                rows={5}
                placeholder="Tell us about your logistics needs..."
                required
              />
            </label>

            <button type="submit" className={styles.submitBtn}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      <section className={styles.offices}>
        <div className={styles.officesInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>Our Locations</span>
            <h2>Regional Offices</h2>
            <p>
              Local teams across key hubs to support pickups, customs, and
              last-mile delivery.
            </p>
          </div>

          <div className={styles.officeGrid}>
            <article className={styles.officeCard}>
              <h3>Lagos (HQ)</h3>
              <p>
                Main operations hub for air freight, warehousing, and
                nationwide distribution.
              </p>
              <a href="mailto:lagos@entamarket.com">lagos@entamarket.com</a>
            </article>
            <article className={styles.officeCard}>
              <h3>Abuja</h3>
              <p>
                Government and enterprise logistics, secure document and cargo
                handling.
              </p>
              <a href="mailto:abuja@entamarket.com">abuja@entamarket.com</a>
            </article>
            <article className={styles.officeCard}>
              <h3>Port Harcourt</h3>
              <p>
                Oil &amp; gas sector shipments, port logistics, and industrial
                supply routes.
              </p>
              <a href="mailto:ph@entamarket.com">ph@entamarket.com</a>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.faqInner}>
          <div className={styles.sectionHead}>
            <span className={styles.label}>FAQ</span>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers before you reach out.</p>
          </div>

          <div className={styles.faqList}>
            <article className={styles.faqItem}>
              <h3>How fast will I receive a quote?</h3>
              <p>
                Standard quote requests are answered within 24 hours on business
                days. Urgent shipments can be escalated by phone.
              </p>
            </article>
            <article className={styles.faqItem}>
              <h3>Can I track my shipment without an account?</h3>
              <p>
                Yes — use the tracking tool on our homepage with your booking or
                bill of lading number. Account holders get full dashboard access.
              </p>
            </article>
            <article className={styles.faqItem}>
              <h3>Do you handle international freight?</h3>
              <p>
                We coordinate air, road, and sea freight to 150+ countries through
                trusted carrier partners worldwide.
              </p>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
