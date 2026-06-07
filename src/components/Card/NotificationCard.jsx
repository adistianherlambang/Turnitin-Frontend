import React from "react";

export const NotificationCard = ({
  title,
  message,
  createdAt,
  createdBy,
  className = ""
}) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  return (
    <div className={`p-5 rounded-2xl border border-border bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 relative overflow-hidden ${className}`}>
      {/* Visual Accent */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary glow-primary"></div>
      
      <div className="pl-3">
        <div className="flex justify-between items-start gap-4">
          <h5 className="text-sm font-bold text-white leading-tight">{title}</h5>
          {formattedDate && (
            <span className="text-[10px] text-text-secondary font-mono flex-shrink-0">
              {formattedDate}
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-2 leading-relaxed">
          {message}
        </p>
        {createdBy && (
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-text-secondary">
            <span>Oleh:</span>
            <span className="font-semibold text-zinc-300">{createdBy}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
