import React from "react";
import styles from "./Badge.module.css";

export const Badge = ({
  children,
  variant = "neutral", // neutral | primary | success | danger | warning | info
  size = "sm", // sm | md
  className = ""
}) => {
  const variants = {
    neutral: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    primary: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-success/10 text-success border border-success/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    info: "bg-blue-400/10 text-blue-400 border border-blue-400/20"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-semibold rounded-full",
    md: "px-3 py-1 text-xs font-semibold rounded-full"
  };

  return (
    <span className={`inline-flex items-center gap-1 select-none ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
