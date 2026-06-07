import React from "react";

export const StatisticCard = ({
  title,
  value,
  icon,
  trend,
  trendDirection = "up", // up | down | neutral
  className = ""
}) => {
  const trendColors = {
    up: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    down: "text-red-400 bg-red-500/10 border-red-500/20",
    neutral: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase">{title}</span>
          <h3 className="text-2xl font-extrabold text-white font-mono mt-1">{value}</h3>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-primary glow-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${trendColors[trendDirection]}`}>
            {trendDirection === "up" && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {trendDirection === "down" && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
