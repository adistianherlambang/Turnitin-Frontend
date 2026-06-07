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

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 w-full rounded-2xl border border-border/80 bg-zinc-950 p-0 text-white shadow-2xl backdrop-blur-md transition-all outline-none animate-slide-up ${sizeClasses[size]} ${styles.dialogContainer}`}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          {title}
        </h3>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modal Content */}
      <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
