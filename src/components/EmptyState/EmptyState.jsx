import React from "react";
import styles from "./EmptyState.module.css";

/**
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {any} [props.icon]
 * @param {any} [props.actionButton]
 */
export const EmptyState = ({
  title = "Tidak Ada Data",
  description = "Belum ada data untuk ditampilkan saat ini.",
  icon,
  actionButton
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        {icon ? (
          icon
        ) : (
          <svg className={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m9-4h.01M9 16h.01" />
          </svg>
        )}
      </div>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {actionButton && <div className={styles.action}>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
