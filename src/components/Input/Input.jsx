import React, { forwardRef } from "react";
import styles from "./Input.module.css";

/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {any} [error]
 * @property {string} [type]
 * @property {string} [placeholder]
 * @property {string} [className]
 */

/**
 * @type {React.ForwardRefExoticComponent<InputProps & React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>}
 */
export const Input = forwardRef(({
  label,
  error,
  type = "text",
  placeholder = "",
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`${styles.inputField} ${
          error ? styles["border-error"] : styles["border-normal"]
        }`}
        {...props}
      />
      {error && (
        <span className={styles.errorText}>
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

/**
 * @typedef {Object} SelectOption
 * @property {string|number} value
 * @property {string} label
 */

/**
 * @typedef {Object} SelectProps
 * @property {string} [label]
 * @property {any} [error]
 * @property {SelectOption[]} [options]
 * @property {string} [className]
 */

/**
 * @type {React.ForwardRefExoticComponent<SelectProps & React.SelectHTMLAttributes<HTMLSelectElement> & React.RefAttributes<HTMLSelectElement>>}
 */
export const Select = forwardRef(({
  label,
  error,
  options = [],
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`${styles.selectField} ${
          error ? styles["border-error"] : styles["border-normal"]
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className={styles.selectOption}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className={styles.errorTextNoPulse}>
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Select.displayName = "Select";

/**
 * @typedef {Object} TextareaProps
 * @property {string} [label]
 * @property {any} [error]
 * @property {number} [rows]
 * @property {string} [placeholder]
 * @property {string} [className]
 */

/**
 * @type {React.ForwardRefExoticComponent<TextareaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>>}
 */
export const Textarea = forwardRef(({
  label,
  error,
  rows = 4,
  placeholder = "",
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={`${styles.textareaField} ${
          error ? styles["border-error"] : styles["border-normal"]
        }`}
        {...props}
      />
      {error && (
        <span className={styles.errorTextNoPulse}>
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

/**
 * @typedef {Object} CheckboxProps
 * @property {string} [label]
 * @property {any} [error]
 * @property {string} [id]
 * @property {string} [className]
 */

/**
 * @type {React.ForwardRefExoticComponent<CheckboxProps & React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>}
 */
export const Checkbox = forwardRef(({
  label,
  error,
  id,
  className = "",
  ...props
}, ref) => {
  return (
    <div className={`${styles.checkboxContainer} ${className}`}>
      <div className={styles.checkboxRow}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={styles.checkboxField}
          {...props}
        />
        {label && (
          <label htmlFor={id} className={styles.checkboxLabel}>
            {label}
          </label>
        )}
      </div>
      {error && (
        <span className={styles.checkboxErrorText}>
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";
export default Input;
