import Link from "next/link";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
} from "react-icons/fa";
import styles from "@/app/styles/Home.module.css";

type ContactSectionProps = {
  id?: string;
  showViewAllLink?: boolean;
};

export default function ContactSection({
  id = "contact",
  showViewAllLink = false,
}: ContactSectionProps) {
  return (
    <section id={id} className={styles.contactSection}>
      <div className={styles.contactInner}>
        <div className={styles.contactIntro}>
          <span className={styles.contactLabel}>Get In Touch</span>
          <h2 className={styles.contactHeading}>Contact Our Logistics Team</h2>
          <p className={styles.contactText}>
            Have questions about shipping, tracking, or partnerships? Reach out
            and our team will respond within one business day.
          </p>

          <ul className={styles.contactDetails}>
            <li>
              <span className={styles.contactDetailIcon}>
                <FaPhone />
              </span>
              <div>
                <strong>Phone</strong>
                <a href="tel:+2348000000000">+234 800 000 0000</a>
              </div>
            </li>
            <li>
              <span className={styles.contactDetailIcon}>
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
              <span className={styles.contactDetailIcon}>
                <FaMapMarkerAlt />
              </span>
              <div>
                <strong>Head Office</strong>
                <span>Lagos, Nigeria — Nationwide &amp; Global Delivery</span>
              </div>
            </li>
            <li>
              <span className={styles.contactDetailIcon}>
                <FaClock />
              </span>
              <div>
                <strong>Business Hours</strong>
                <span>Mon – Fri: 8:00 AM – 6:00 PM WAT</span>
              </div>
            </li>
            <li>
              <span className={styles.contactDetailIcon}>
                <FaHeadset />
              </span>
              <div>
                <strong>24/7 Shipment Support</strong>
                <span>
                  Active customers can reach us anytime for urgent updates
                </span>
              </div>
            </li>
          </ul>

          {showViewAllLink && (
            <Link href="/contact" className={styles.contactPageLink}>
              View full contact page →
            </Link>
          )}
        </div>

        <form className={styles.contactForm} action="#" method="post">
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

          <button type="submit" className={styles.contactSubmit}>
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
