import React, { ReactNode } from "react";
import styles from "./Table.module.css";

interface TableProps {
  headers?: string[];
  children: ReactNode;
  className?: string;
}

export const Table = ({
  headers = [],
  children,
  className = ""
}: TableProps) => {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-border bg-zinc-950/40 backdrop-blur-sm ${className}`}>
      <table className="min-w-full divide-y divide-border/60 text-left border-collapse">
        <thead className="bg-zinc-900/80">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4.5 text-xs font-bold text-text-secondary tracking-wider uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 bg-transparent">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
