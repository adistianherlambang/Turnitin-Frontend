import React from "react";
import styles from "./Card.module.css";

/**
 * @param {object} props
 * @param {any} props.children
 * @param {any} [props.title]
 * @param {any} [props.subtitle]
 * @param {string} [props.className]
 * @param {any} [props.footer]
 * @param {boolean} [props.hoverable]
 */
export const Card = ({
  children,
  title = undefined,
  subtitle = undefined,
  className = "",
  footer = undefined,
  hoverable = true,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-border/80 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all duration-300 ${
        hoverable ? "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="text-base font-bold text-white leading-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="text-sm text-zinc-100">{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">{footer}</div>}
    </div>
  );
};

export default Card;
