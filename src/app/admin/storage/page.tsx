"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Table from "@/components/Table/Table";
import Button from "@/components/Button/Button";
import Loading from "@/components/Loading/Loading";
import EmptyState from "@/components/EmptyState/EmptyState";
import styles from "./page.module.css";

interface StorageFile {
  name: string;
  folder: string;
  size: number;
  url: string;
  createdAt: string;
}

interface StorageData {
  totalSize: number;
  totalSizeMB: number;
  limit: number;
  limitMB: number;
  isFull: boolean;
  files: StorageFile[];
}

export default function AdminStorage() {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");

  const fetchStorageInfo = async () => {
    try {
      const res = await axios.get(`/api/r2/storage`);
      if (res.data && res.data.success) {
        setStorageData(res.data.storage);
      }
    } catch (err: any) {
      console.error("Gagal memuat status penyimpanan:", err);
      toast.error("Gagal membaca storage Cloudflare R2.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter Logic
  const getFilteredFiles = () => {
    if (!storageData) return [];
    return storageData.files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = folderFilter === "all" || file.folder === folderFilter;
      return matchesSearch && matchesFolder;
    });
  };

  const filteredFiles = getFilteredFiles();

  // Selection Logic
  const handleSelectRow = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const handleSelectAll = () => {
    const visibleUrls = filteredFiles.map((f) => f.url);
    const allVisibleSelected = visibleUrls.every((url) => selectedUrls.includes(url));

    if (allVisibleSelected) {
      // Deselect all visible
      setSelectedUrls((prev) => prev.filter((url) => !visibleUrls.includes(url)));
    } else {
      // Select all visible
      setSelectedUrls((prev) => {
        const union = new Set([...prev, ...visibleUrls]);
        return Array.from(union);
      });
    }
  };

  // Deletion Logic
  const handleDeleteBulk = async () => {
    if (selectedUrls.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedUrls.length} berkas terpilih? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await axios.post(`/api/r2/delete`, { urls: selectedUrls });
      if (res.data && res.data.success) {
        toast.success(`Berhasil menghapus ${res.data.deleted.length} berkas dari R2!`);
        setStorageData(res.data.storage);
        setSelectedUrls([]);
      } else {
        toast.error("Gagal menghapus berkas.");
      }
    } catch (err: any) {
      toast.error("Kesalahan saat menghapus berkas: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (url: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas ini?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await axios.post(`/api/r2/delete`, { urls: [url] });
      if (res.data && res.data.success) {
        toast.success("Berkas berhasil dihapus dari R2!");
        setStorageData(res.data.storage);
        setSelectedUrls((prev) => prev.filter((item) => item !== url));
      } else {
        toast.error("Gagal menghapus berkas.");
      }
    } catch (err: any) {
      toast.error("Kesalahan saat menghapus: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Helper for folder tag
  const getFolderLabel = (folder: string) => {
    switch (folder) {
      case "payments":
        return { text: "Bukti Bayar", className: styles.badgePayments };
      case "documents":
        return { text: "Dokumen Cek", className: styles.badgeDocuments };
      case "results":
        return { text: "Laporan Cek", className: styles.badgeResults };
      default:
        return { text: folder, className: styles.badgeDefault };
    }
  };

  if (loading) {
    return <Loading fullPage={true} />;
  }

  const percentUsed = storageData ? Math.min(100, (storageData.totalSize / storageData.limit) * 100) : 0;
  const isFull = storageData?.isFull || false;

  // Visual meter color
  const getMeterColorClass = () => {
    if (percentUsed >= 90) return styles.meterDanger;
    if (percentUsed >= 70) return styles.meterWarning;
    return styles.meterPrimary;
  };

  const allVisibleSelected = filteredFiles.length > 0 && filteredFiles.every((f) => selectedUrls.includes(f.url));

  return (
    <div className={styles.container}>
      {/* Page Title */}
      <div>
        <h1 className={styles.title}>Manajemen Penyimpanan (Cloudflare R2)</h1>
        <p className={styles.subtitle}>
          Monitor penggunaan storage Cloudflare R2 dan bersihkan berkas-berkas usang untuk menjaga kapasitas.
        </p>
      </div>

      {/* Storage Meter Visual Card */}
      {storageData && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardLabel}>Penggunaan Ruang Disk</span>
              <span className={styles.cardValueBig}>
                {storageData.totalSizeMB} MB <span className={styles.cardValueUnit}>/ {storageData.limitMB >= 1024 ? `${(storageData.limitMB / 1024).toFixed(0)} GB` : `${storageData.limitMB} MB`} ({percentUsed.toFixed(1)}%)</span>
              </span>
            </div>
            <span className={`${styles.statusBadge} ${isFull ? styles.statusBadgeFull : styles.statusBadgeNormal}`}>
              {isFull ? "⚠️ PENYIMPANAN PENUH" : "NORMAL"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressBar} ${getMeterColorClass()}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <span className={styles.cardFootnote}>
            *Batas maksimal penyimpanan disk untuk mengunggah dokumen adalah {storageData.limitMB >= 1024 ? `${(storageData.limitMB / 1024).toFixed(0)} GB` : `${storageData.limitMB} MB`}. Jika kapasitas penuh, sistem akan otomatis memblokir unggahan dokumen user dan pengiriman bukti transfer pembayaran.
          </span>
        </div>
      )}

      {/* Control Bar Filters & Search */}
      <div className={styles.controlBar}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama berkas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          className={styles.filterDropdown}
        >
          <option value="all">Semua Folder</option>
          <option value="documents">Folder Dokumen Cek (documents)</option>
          <option value="results">Folder Laporan Cek (results)</option>
          <option value="payments">Folder Bukti Bayar (payments)</option>
        </select>
      </div>

      {/* Selected Action Floating Bar */}
      {selectedUrls.length > 0 && (
        <div className={styles.bulkActionBar}>
          <span className={styles.bulkActionText}>
            Selected <strong>{selectedUrls.length}</strong> files
          </span>
          <Button
            onClick={handleDeleteBulk}
            loading={deleting}
            className={styles.bulkDeleteBtn}
          >
            Hapus Terpilih
          </Button>
        </div>
      )}

      {/* Files Table List */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          title="Tidak Ada Berkas"
          description={
            searchQuery || folderFilter !== "all"
              ? "Tidak ada berkas yang sesuai dengan kriteria filter pencarian Anda."
              : "Direktori penyimpanan uploads saat ini kosong."
          }
        />
      ) : (
        <div className={styles.tableWrapper}>
          <Table
            headers={[
              <input
                key="select-all"
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAll}
                className={styles.checkbox}
              />,
              "Nama Berkas",
              "Folder/Tipe",
              "Ukuran",
              "Tanggal Unggah",
              "Aksi"
            ]}
          >
            {filteredFiles.map((file) => {
              const isSelected = selectedUrls.includes(file.url);
              const folderInfo = getFolderLabel(file.folder);
              return (
                <tr
                  key={file.url}
                  className={`${styles.tableRow} ${isSelected ? styles.rowSelected : ""}`}
                >
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(file.url)}
                      className={styles.checkbox}
                    />
                  </td>
                  <td className={styles.filenameCell} title={file.name}>
                    {file.name}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${folderInfo.className}`}>
                      {folderInfo.text}
                    </span>
                  </td>
                  <td className={styles.sizeCell}>
                    {formatBytes(file.size)}
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(file.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionLink}
                      >
                        Buka
                      </a>
                      <button
                        onClick={() => handleDeleteSingle(file.url)}
                        disabled={deleting}
                        className={styles.deleteLinkBtn}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      )}
    </div>
  );
}
