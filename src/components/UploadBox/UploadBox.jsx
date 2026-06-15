"use client";

import React, { useState, useRef } from "react";
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

    const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      const msg = `Format berkas tidak didukung. Format yang diizinkan: ${allowedExtensions.join(", ")}`;
      setStatus("error");
      setErrorMsg(msg);
      if (onUploadError) onUploadError(msg);
      return false;
    }

    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      const msg = `Ukuran berkas melebihi batas maksimal ${maxSizeMB}MB.`;
      setStatus("error");
      setErrorMsg(msg);
      if (onUploadError) onUploadError(msg);
      return false;
    }

    return true;
  };

  const uploadFile = async (targetFile) => {
    setStatus("uploading");
    setProgress(0);

    try {
      // Step 1: Request a presigned PUT URL from our Next.js API
      const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: uploadType,
          filename: targetFile.name,
          contentType: targetFile.type || "application/octet-stream",
          size: targetFile.size,
        }),
      });

      const presignData = await presignRes.json();

      if (!presignRes.ok || !presignData.success) {
        throw new Error(presignData.error || "Gagal mendapatkan URL upload");
      }

      const { presignedUrl, publicUrl } = presignData;

      // Step 2: Upload directly to R2 using XMLHttpRequest (supports progress)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          // R2 presigned PUT returns 200 on success
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(null);
          } else {
            reject(new Error(`Upload gagal: server mengembalikan status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Koneksi terputus saat mengunggah berkas"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload dibatalkan"));
        });

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", targetFile.type || "application/octet-stream");
        xhr.send(targetFile);
      });

      // Step 3: Upload success
      setStatus("success");
      setFile(targetFile);
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl, targetFile.name);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah";
      setStatus("error");
      setErrorMsg(msg);
      if (onUploadError) {
        onUploadError(msg);
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
