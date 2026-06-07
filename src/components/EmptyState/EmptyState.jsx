import React from "react";

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
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-zinc-900/10 max-w-lg mx-auto my-6">
      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-text-secondary mb-4">
        {icon ? (
          icon
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m9-4h.01M9 16h.01" />
          </svg>
        )}
      </div>
      <h4 className="text-base font-bold text-white tracking-wide">{title}</h4>
      <p className="text-xs text-text-secondary mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
