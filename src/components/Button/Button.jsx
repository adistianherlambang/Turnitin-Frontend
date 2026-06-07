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
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[`variant-${variant}`]} ${styles[`size-${size}`]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
          <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
