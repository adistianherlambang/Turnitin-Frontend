import React from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import styles from "./ConfirmDialog.module.css";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini? Proses ini tidak dapat dibatalkan.",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger", // danger | primary | warning
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={!loading}>
      <div className={styles.container}>
        <p className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
