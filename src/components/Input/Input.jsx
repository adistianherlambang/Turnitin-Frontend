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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-300 tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 text-sm bg-zinc-900 border ${
          error ? "border-danger focus:ring-danger" : "border-border focus:ring-primary"
        } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-danger animate-pulse pl-1">
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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-300 tracking-wide">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-2.5 text-sm bg-zinc-900 border ${
          error ? "border-danger focus:ring-danger" : "border-border focus:ring-primary"
        } rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-danger pl-1">
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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-300 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 text-sm bg-zinc-900 border ${
          error ? "border-danger focus:ring-danger" : "border-border focus:ring-primary"
        } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-danger pl-1">
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
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-3 select-none">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className="w-4 h-4 rounded border-border bg-zinc-900 text-primary focus:ring-primary focus:ring-offset-background"
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-zinc-300 cursor-pointer">
            {label}
          </label>
        )}
      </div>
      {error && (
        <span className="text-xs font-medium text-danger pl-7">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";
export default Input;
