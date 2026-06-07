import React from "react";
import styles from "./Card.module.css";

export const CreditCard = ({
  name = "John Doe",
  credits = 0,
  creditPrice = 5000,
  className = ""
}) => {
  const rupiahValue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(credits * creditPrice);

  return (
    <div className={`relative w-full h-48 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-zinc-950 p-6 text-white overflow-hidden shadow-2xl border border-white/10 glow-primary select-none ${className}`}>
      {/* Glow highlight */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

      {/* Card Header */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-blue-200 font-semibold font-mono">Turnitin Premium Member</span>
          <h4 className="text-sm font-bold text-white tracking-wide mt-0.5">PLATINUM ACCREDIT</h4>
        </div>
        {/* Contactless symbol & Chip SVG */}
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="w-9 h-7 rounded bg-amber-400/80 border border-amber-300/40 relative flex items-center justify-center">
            <div className="absolute w-5 h-4 border border-zinc-800/40 rounded-sm"></div>
            <div className="absolute w-2 h-7 border-l border-zinc-800/40"></div>
          </div>
        </div>
      </div>

      {/* Credit Balance Area */}
      <div className="mt-4 relative z-10">
        <span className="text-[9px] uppercase tracking-wider text-blue-200">Saldo Kredit</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{credits}</span>
          <span className="text-xs text-blue-200">Kredit</span>
        </div>
      </div>

      {/* Card Footer: Name and Rupiah Value */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end relative z-10">
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-blue-200 font-semibold">Card Holder</span>
          <span className="text-sm font-semibold tracking-wide truncate max-w-[150px] block">{name}</span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] uppercase tracking-wider text-blue-200 font-semibold">Rupiah Equivalent</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{rupiahValue}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
