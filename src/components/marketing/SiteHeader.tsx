import Link from "next/link";
import styles from "./Marketing.module.css";

type ActivePage = "home" | "about" | "services" | "contact";

type SiteHeaderProps = {
  activePage?: ActivePage;
};

function navClass(active: boolean) {
  return active ? `${styles.active}` : undefined;
}

export default function SiteHeader({ activePage }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.headerLogo}>
          <span>Entamarket Logistics</span>
        </Link>

        <nav className={styles.headerNav} aria-label="Main navigation">
          <Link
            href="/"
            className={navClass(activePage === "home")}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={navClass(activePage === "about")}
          >
            About Us
          </Link>
          <Link
            href="/services"
            className={navClass(activePage === "services")}
          >
            Our Services
          </Link>
          <Link
            href="/contact"
            className={navClass(activePage === "contact")}
          >
            Contact
          </Link>
        </nav>

        <div className={styles.headerActions}>
          <Link href="/auth/login" className={styles.headerBtnSecondary}>
            Log In
          </Link>
          <Link href="/auth/signup" className={styles.headerBtnPrimary}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
