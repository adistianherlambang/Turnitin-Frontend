import React from "react";
import Link from "next/link";
import styles from "./Logo.module.css";

export const Logo = ({ className = "" }) => {
  return (
    <Link href="/" className={`${styles.logoContainer} ${className}`}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconBg}></div>
        <svg className={styles.svgIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <span className={styles.text}>
        Turnitin<span className={styles.badge}>Checker</span>
      </span>
    </Link>
  );
};

export default Logo;
