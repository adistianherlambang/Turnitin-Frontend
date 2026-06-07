import React from "react";
import styles from "./Table.module.css";

/**
 * @typedef {Object} SearchBarFilterOption
 * @property {string} value
 * @property {string} label
 */

/**
 * @param {object} props
 * @param {string} props.value
 * @param {any} props.onChange
 * @param {string} [props.placeholder]
 * @param {SearchBarFilterOption[]} [props.filterOptions]
 * @param {string} [props.filterValue]
 * @param {any} [props.onFilterChange]
 * @param {string} [props.className]
 */
export const SearchBar = ({
  value,
  onChange,
  placeholder = "Cari data...",
  filterOptions = [], // { value, label }
  filterValue,
  onFilterChange,
  className = ""
}) => {
  return (
    <div className={`${styles.searchBarContainer} ${className}`}>
      {/* Search Input */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.searchInput}
        />
      </div>

      {/* Filter Select Dropdown */}
      {filterOptions.length > 0 && onFilterChange && (
        <div className={styles.filterWrapper}>
          <span className={styles.filterLabel}>Filter Status:</span>
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className={styles.filterSelect}
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
