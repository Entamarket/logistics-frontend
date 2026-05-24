"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import styles from "@/app/styles/Home.module.css";

function LogoMark() {
  return (
    <svg
      className={styles.logoSvg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 889 226"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g
        transform="translate(0.000000,226.000000) scale(0.100000,-0.100000)"
        fill="#fff"
        stroke="none"
      >
        <path d="M1085 2076 c-315 -61 -570 -260 -707 -552 -67 -145 -82 -215 -82 -404 0 -138 4 -178 22 -243 46 -166 137 -324 256 -443 119 -119 277 -210 443 -256 113 -31 373 -31 486 0 286 79 513 271 639 538 58 124 79 218 85 369 4 105 1 148 -15 227 -47 224 -180 439 -357 575 -87 67 -245 145 -350 173 -103 28 -318 36 -420 16z m700 -502 c108 -131 120 -149 119 -183 -1 -46 -33 -94 -74 -113 l-30 -13 -2 -270 -3 -270 -490 0 -490 0 -5 267 -5 267 -35 23 c-42 29 -80 83 -80 114 0 16 44 76 126 174 l126 150 362 0 361 0 120 -146z" />
        <path d="M1027 1545 c-37 -74 -67 -145 -67 -156 0 -12 15 -36 34 -55 28 -28 41 -34 78 -34 46 0 81 18 98 51 8 14 60 296 60 324 0 3 -30 5 -68 5 l-67 0 -68 -135z" />
        <path d="M1400 1518 c26 -154 29 -163 59 -190 24 -21 41 -28 74 -28 51 0 84 21 103 66 14 33 13 37 -56 174 l-70 140 -68 0 -69 0 27 -162z" />
        <path d="M918 1282 l-38 -25 0 -119 0 -118 425 0 425 0 0 118 0 118 -41 27 -41 27 -30 -22 c-17 -11 -51 -23 -77 -26 -38 -3 -53 1 -84 22 l-38 26 -31 -21 c-17 -12 -51 -24 -77 -27 -37 -3 -53 1 -84 22 l-38 26 -30 -23 c-43 -31 -125 -31 -168 1 -16 12 -31 22 -33 21 -2 -1 -20 -13 -40 -27z" />
      </g>
    </svg>
  );
}

export default function HomeNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <LogoMark />
          <span>Entamarket Logistics</span>
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="home-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>

        <ul className={styles.navLinks}>
          <li className={styles.navLinkActive}>Home</li>
          <li>
            <Link href="/about" className={styles.navAnchor}>
              About Us
            </Link>
          </li>
          <li>
            <Link href="/services" className={styles.navAnchor}>
              Our Services
            </Link>
          </li>
          <li>
            <a href="#contact" className={styles.navAnchor}>
              Contact
            </a>
          </li>
        </ul>

        <div className={styles.navActions}>
          <Link href="/auth/login" className={styles.navButton2}>
            Log In
          </Link>
          <Link href="/auth/signup" className={styles.navButton}>
            Get Started
          </Link>
        </div>
      </nav>

      <div
        className={`${styles.mobileBackdrop} ${menuOpen ? styles.mobileBackdropOpen : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      <div
        id="home-mobile-menu"
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobilePanelHeader}>
          <span className={styles.mobilePanelTitle}>Menu</span>
          <button
            type="button"
            className={styles.mobileClose}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        <ul className={styles.mobileNavLinks}>
          <li className={styles.mobileNavActive}>
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={closeMenu}>
              About Us
            </Link>
          </li>
          <li>
            <Link href="/services" onClick={closeMenu}>
              Our Services
            </Link>
          </li>
          <li>
            <a href="#contact" onClick={closeMenu}>
              Contact
            </a>
          </li>
        </ul>

        <div className={styles.mobileNavActions}>
          <Link
            href="/auth/login"
            className={styles.mobileBtnSecondary}
            onClick={closeMenu}
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className={styles.mobileBtnPrimary}
            onClick={closeMenu}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
