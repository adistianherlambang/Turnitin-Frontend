"use client";

import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // sm | md | lg | xl
  showCloseButton = true
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Open modal in top layer
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = "hidden"; // Prevent scrolling behind
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = "";
      }
    }
  }, [isOpen]);

  // Fallback for browsers that don't support closedby="any" click backdrop to close
  const handleBackdropClick = (event) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Only close if user clicked the actual dialog backdrop (which matches the dialog element itself)
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );

    if (!isInside) {
      onClose();
    }
  };

  // Listen for native dialog cancel (Esc key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={`${styles.dialog} ${styles[`size-${size}`]}`}
    >
      {/* Modal Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          {title}
        </h3>
        {showCloseButton && (
          <button
            onClick={onClose}
            className={styles.closeBtn}
          >
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modal Content */}
      <div className={styles.content}>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
