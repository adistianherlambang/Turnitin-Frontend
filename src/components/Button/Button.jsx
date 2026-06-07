import React from "react";
import styles from "./Button.module.css";

/**
 * @param {object} props
 * @param {any} props.children
 * @param {"button"|"submit"|"reset"} [props.type]
 * @param {"primary"|"secondary"|"danger"|"outline"|"success"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {any} [props.onClick]
 */
export const Button = ({
  children,
  type = "button",
  variant = "primary", // primary | secondary | danger | outline | success
  size = "md", // sm | md | lg
  loading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-98";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-lg shadow-primary/20",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-700 border border-zinc-700",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-lg shadow-danger/20",
    success: "bg-success text-white hover:bg-green-600 focus:ring-success shadow-lg shadow-success/20",
    outline: "bg-transparent text-white border border-border hover:bg-zinc-900 focus:ring-zinc-800"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
