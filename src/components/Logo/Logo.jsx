import React from "react";
import Link from "next/link";
import styles from "./Logo.module.css";

export const Logo = ({ className = "" }) => {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-xl tracking-tight text-white select-none ${className} ${styles.logoContainer}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary glow-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-400"></div>
        <svg className="w-5 h-5 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-sans tracking-wide">
        Turnitin<span className="text-primary font-extrabold font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 ml-1.5 align-middle">Checker</span>
      </span>
    </Link>
  );
};

export default Logo;
