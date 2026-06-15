"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import styles from "./UploadBox.module.css";

export const UploadBox = ({
  uploadType = "documents", // payments | documents | results
  onUploadSuccess,
  onUploadError,
  allowedExtensions = [".pdf", ".doc", ".docx", ".txt"],
  maxSizeMB = 10,
  disabled = false
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // Check extension
    const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setStatus("error");
      setErrorMsg(`Format berkas tidak didukung. Format yang diizinkan: ${allowedExtensions.join(", ")}`);
      if (onUploadError) onUploadError(errorMsg);
      return false;
    }

    // Check size
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setStatus("error");
      setErrorMsg(`Ukuran berkas melebihi batas maksimal ${maxSizeMB}MB.`);
      if (onUploadError) onUploadError(errorMsg);
      return false;
    }

    return true;
  };

  const uploadFile = async (targetFile) => {
    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", targetFile);
    formData.append("type", uploadType);

    try {
      const res = await axios.post(`/api/r2/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      if (res.data && res.data.success) {
        setStatus("success");
        setFile(targetFile);
        if (onUploadSuccess) {
          onUploadSuccess(res.data.url, targetFile.name);
        }
      } else {
        throw new Error(res.data.error || "Gagal mengunggah berkas");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.error || err.message || "Terjadi kesalahan saat mengunggah");
      if (onUploadError) {
        onUploadError(err.response?.data?.error || err.message || "Gagal mengunggah");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        uploadFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        uploadFile(selectedFile);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className={styles.wrapper}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={allowedExtensions.join(",")}
        className={styles.hiddenInput}
      />

      {status === "idle" && (
        <div
          onDragEnter={disabled ? undefined : handleDrag}
          onDragOver={disabled ? undefined : handleDrag}
          onDragLeave={disabled ? undefined : handleDrag}
          onDrop={disabled ? undefined : handleDrop}
          onClick={disabled ? undefined : triggerFileInput}
          className={`${styles.idleDropzone} ${
            isDragActive ? styles.isDragActive : styles.isDragInactive
          } ${disabled ? styles.disabled : ""}`}
        >
          <div className={styles.iconContainer}>
            <svg className={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className={styles.titleText}>
            {disabled ? "Unggah berkas dinonaktifkan" : "Drag & drop berkas Anda di sini"}
          </span>
          <span className={styles.descText}>
            {disabled ? "Penyimpanan server penuh" : "atau klik untuk menelusuri folder"}
          </span>
          <span className={styles.infoText}>
            Format: {allowedExtensions.join(", ")} (Maks. {maxSizeMB}MB)
          </span>
        </div>
      )}

      {status === "uploading" && (
        <div className={styles.uploadingContainer}>
          <div className={styles.progressCircleWrapper}>
            {/* Spinning Circle */}
            <svg className={styles.progressSvg} viewBox="0 0 36 36">
              <circle className={styles.progressBgCircle} strokeWidth="3" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
            </svg>
            <span className={styles.progressValue}>{progress}%</span>
          </div>
          <span className={styles.uploadingTitle}>Mengunggah Berkas...</span>
          <span className={styles.uploadingDesc}>Mohon tunggu hingga proses selesai</span>
        </div>
      )}

      {status === "success" && file && (
        <div className={styles.successContainer}>
          <div className={styles.successIconContainer}>
            <svg className={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.successText}>Berkas berhasil diunggah!</span>
          <button
            onClick={resetUpload}
            className={styles.actionButton}
          >
            Ganti Berkas
          </button>
        </div>
      )}

      {status === "error" && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIconContainer}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className={styles.errorTitle}>Gagal Mengunggah</span>
          <span className={styles.errorText}>{errorMsg}</span>
          <button
            onClick={resetUpload}
            className={styles.actionButton}
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
