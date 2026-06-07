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
      className={`${styles.card} ${
        hoverable ? styles["card-hoverable"] : ""
      } ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h4 className={styles.title}>{title}</h4>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

export default Card;
