import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import styles from "./Marketing.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              Entamarket Logistics
            </Link>
            <p>
              Reliable end-to-end logistics for businesses that need speed,
              visibility, and secure delivery worldwide.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/services">Our Services</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Services</h4>
            <ul>
              <li>
                <Link href="/services">Air Freight</Link>
              </li>
              <li>
                <Link href="/services">Road Transport</Link>
              </li>
              <li>
                <Link href="/services">Warehousing</Link>
              </li>
              <li>
                <Link href="/services">Shipment Tracking</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Account</h4>
            <ul>
              <li>
                <Link href="/auth/login">Log In</Link>
              </li>
              <li>
                <Link href="/auth/signup">Get Started</Link>
              </li>
              <li>
                <Link href="/dashboard">Client Dashboard</Link>
              </li>
              <li>
                <Link href="/rider">Rider Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            &copy; {new Date().getFullYear()} Entamarket Logistics. All rights
            reserved.
          </p>
          <div className={styles.footerLegal}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
