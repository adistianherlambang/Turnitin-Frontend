"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../Logo/Logo";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.inner}>
          {/* Logo */}
          <div className={styles.logoWrapper}>
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className={styles.navLinks}>
            <a href="#fitur" className={styles.navLink}>
              Fitur
            </a>
            <a href="#cara-kerja" className={styles.navLink}>
              Cara Kerja
            </a>
            <a href="#pricing" className={styles.navLink}>
              Harga
            </a>
            <a href="#faq" className={styles.navLink}>
              FAQ
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className={styles.desktopAuth}>
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className={styles.dashboardBtn}
              >
                Dashboard
                <svg className={styles.dashboardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={styles.loginLink}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className={styles.registerBtn}
                >
                  Mulai Cek
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className={styles.mobileMenuBtnWrapper}>
            <button
              onClick={toggleMobileMenu}
              type="button"
              className={styles.mobileMenuBtn}
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className={styles.mobileMenuIcon} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className={styles.mobileMenuIcon} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu} id="mobile-menu">
          <a
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileNavLink}
          >
            Fitur
          </a>
          <a
            href="#cara-kerja"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileNavLink}
          >
            Cara Kerja
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileNavLink}
          >
            Harga
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileNavLink}
          >
            FAQ
          </a>
          <div className={styles.mobileAuthSection}>
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className={styles.mobileDashboardBtn}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.mobileLoginLink}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.mobileRegisterBtn}
                >
                  Mulai Cek
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
