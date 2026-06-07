import React from "react";
import styles from "./Badge.module.css";

export const Badge = ({
  children,
  variant = "neutral", // neutral | primary | success | danger | warning | info
  size = "sm", // sm | md
  className = ""
}) => {
  const badgeClass = `${styles.badge} ${styles[`size-${size}`]} ${styles[`variant-${variant}`]} ${className}`;

  return (
    <span className={badgeClass}>
      {children}
    </span>
  );
};

export default Badge;
