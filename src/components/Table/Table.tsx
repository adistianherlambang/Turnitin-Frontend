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
    <div className={`${styles.tableWrapper} ${className}`}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={styles.th}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
