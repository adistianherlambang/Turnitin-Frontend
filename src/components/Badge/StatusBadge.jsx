import React from "react";
import Badge from "./Badge";

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
      {/* Dynamic small status indicator dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
