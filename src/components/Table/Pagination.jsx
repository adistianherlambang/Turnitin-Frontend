import React from "react";
import styles from "./Table.module.css";

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Mobile view pagination */}
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={styles.mobilePageBtn}
        >
          Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={styles.mobilePageBtnNext}
        >
          Berikutnya
        </button>
      </div>

      {/* Desktop view pagination */}
      <div className={styles.desktopContainer}>
        <div>
          <p className={styles.pageInfo}>
            Halaman <span className={styles.pageInfoHighlight}>{currentPage}</span> dari{" "}
            <span className={styles.pageInfoHighlight}>{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className={styles.btnGroup} aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={styles.arrowBtn}
            >
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Render page numbers */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isCurrent = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={isCurrent ? styles.pageNumBtnActive : styles.pageNumBtn}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={styles.arrowBtn}
            >
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
