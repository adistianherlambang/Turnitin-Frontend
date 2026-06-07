"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import styles from "./UploadBox.module.css";

export const UploadBox = ({
  uploadType = "documents", // payments | documents | results
  onUploadSuccess,
  onUploadError,
  allowedExtensions = [".pdf", ".doc", ".docx", ".txt"],
  maxSizeMB = 10
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

    try {
      // Send file to Node.js backend storage server
      const res = await axios.post(`${process.env.NEXT_PUBLIC_STORAGE_SERVER}/api/upload/${uploadType}`, formData, {
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
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={allowedExtensions.join(",")}
        className="hidden"
      />

      {status === "idle" && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/30"
          }`}
        >
          <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-text-secondary group-hover:text-white mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Drag & drop berkas Anda di sini</span>
          <span className="text-xs text-text-secondary mt-1">atau klik untuk menelusuri folder</span>
          <span className="text-[10px] text-zinc-500 mt-4 uppercase font-semibold tracking-wider">
            Format: {allowedExtensions.join(", ")} (Maks. {maxSizeMB}MB)
          </span>
        </div>
      )}

      {status === "uploading" && (
        <div className="border border-border bg-zinc-900/20 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            {/* Spinning Circle */}
            <svg className="animate-spin w-16 h-16 text-primary" viewBox="0 0 36 36">
              <circle className="text-zinc-800" strokeWidth="3" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
            </svg>
            <span className="absolute text-xs font-bold text-white font-mono">{progress}%</span>
          </div>
          <span className="text-sm font-semibold text-white">Mengunggah Berkas...</span>
          <span className="text-xs text-text-secondary mt-1">Mohon tunggu hingga proses selesai</span>
        </div>
      )}

      {status === "success" && file && (
        <div className="border border-success/30 bg-success/5 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-success/10 border border-success/20 text-success mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white truncate max-w-xs">{file.name}</span>
          <span className="text-xs text-success mt-1">Berkas berhasil diunggah!</span>
          <button
            onClick={resetUpload}
            className="mt-4 text-xs font-semibold text-text-secondary hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-border transition-colors"
          >
            Ganti Berkas
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="border border-danger/30 bg-danger/5 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-danger/10 border border-danger/20 text-danger mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Gagal Mengunggah</span>
          <span className="text-xs text-danger mt-1.5 max-w-xs leading-relaxed">{errorMsg}</span>
          <button
            onClick={resetUpload}
            className="mt-4 text-xs font-semibold text-text-secondary hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-border transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
