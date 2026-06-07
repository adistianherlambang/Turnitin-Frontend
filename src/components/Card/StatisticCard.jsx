import React from "react";
import styles from "./Card.module.css";

export const StatisticCard = ({
  title,
  value,
  icon,
  trend,
  trendDirection = "up", // up | down | neutral
  className = ""
}) => {
  return (
    <div className={`${styles.statCard} ${className}`}>
      <div className={styles.statLayout}>
        <div>
          <span className={styles.statLabel}>{title}</span>
          <h3 className={styles.statValue}>{value}</h3>
        </div>
        {icon && (
          <div className={styles.statIconContainer}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={styles.trendContainer}>
          <span className={`${styles.trendBadge} ${styles[`trend-${trendDirection}`]}`}>
            {trendDirection === "up" && (
              <svg className={styles.trendSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {trendDirection === "down" && (
              <svg className={styles.trendSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatisticCard;
