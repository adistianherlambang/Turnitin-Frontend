import React from "react";
import Badge from "./Badge";
import styles from "./Badge.module.css";

export const StatusBadge = ({ status, className = "" }) => {
  // Map raw status keys to localized text and badge variants
  const statusConfig = {
    // Payment status
    pending: { label: "Menunggu Verifikasi", variant: "warning" },
    approved: { label: "Disetujui", variant: "success" },
    rejected: { label: "Ditolak", variant: "danger" },

    // Submission status
    waiting: { label: "Menunggu Antrean", variant: "info" },
    processing: { label: "Sedang Diproses", variant: "warning" },
    completed: { label: "Selesai", variant: "success" },

    // User status
    active: { label: "Aktif", variant: "success" },
    suspended: { label: "Ditangguhkan", variant: "danger" }
  };

  const config = statusConfig[status] || { label: status, variant: "neutral" };

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {/* Dynamic small status indicator dot using CSS Modules class */}
      <span className={styles.statusDot}></span>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
