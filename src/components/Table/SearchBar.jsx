import React from "react";

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
    <div className={`flex flex-col sm:flex-row gap-3 w-full justify-between items-center ${className}`}>
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-900 border border-border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Filter Select Dropdown */}
      {filterOptions.length > 0 && onFilterChange && (
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-text-secondary whitespace-nowrap font-medium">Filter Status:</span>
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-sm bg-zinc-900 border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
