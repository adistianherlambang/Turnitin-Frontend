import React from "react";
import styles from "./Loading.module.css";

// 1. Loading Spinner / Overlay
export const Loading = ({ fullPage = false, size = "md", className = "" }) => {
  const spinner = (
    <div
      className={`${styles.spinnerBase} ${styles[`size-${size}`]} ${className}`}
      role="status"
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPageContainer}>
        {spinner}
      </div>
    );
  }

  return (
    <div className={styles.inlineContainer}>
      {spinner}
    </div>
  );
};

// 2. Skeleton Box Placeholder
export const Skeleton = ({ variant = "rect", width = "100%", height = "1rem", className = "" }) => {
  return (
    <div
      className={`${styles.skeleton} ${styles[`shape-${variant}`]} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Loading;
