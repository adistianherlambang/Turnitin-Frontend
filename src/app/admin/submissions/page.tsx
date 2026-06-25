"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/services/dbService";
import Table from "@/components/Table/Table";
import StatusBadge from "@/components/Badge/StatusBadge";
import SearchBar from "@/components/Table/SearchBar";
import Pagination from "@/components/Table/Pagination";
import EmptyState from "@/components/EmptyState/EmptyState";
import Loading from "@/components/Loading/Loading";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import UploadBox from "@/components/UploadBox/UploadBox";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";
import { getProxyUrl } from "@/lib/r2-client";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit / Status Modal states
  const [activeSubmission, setActiveSubmission] = useState<any>(null); // submission object
  const [newStatus, setNewStatus] = useState("waiting");
  const [adminNotes, setAdminNotes] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Listen to submissions
    const unsubSub = dbService.subscribeCollection("submissions", (data) => {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSubmissions(data);
    });

    // Listen to users
    const unsubUsers = dbService.subscribeCollection("users", (data) => {
      setUsers(data);
    });

    const timer = setTimeout(() => setLoading(false), 500);

    return () => {
      unsubSub();
      unsubUsers();
      clearTimeout(timer);
    };
  }, []);

  const getUserDetails = (userId) => {
    const u = users.find(user => user.id === userId);
    return u ? { name: u.name, email: u.email } : { name: "User Terhapus", email: "N/A" };
  };

  const handleOpenStatusModal = (sub) => {
    setActiveSubmission(sub);
    setNewStatus(sub.status);
    setAdminNotes(sub.notes || "");
    setResultFileUrl(sub.resultFile || "");
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;

    if (newStatus === "completed" && !resultFileUrl) {
      toast.error("Harap unggah berkas hasil penapisan Turnitin terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    try {
      const sub = activeSubmission;
      const userProfile = users.find(u => u.id === sub.userId);

      // Handle REDIRECT / REFUND if rejected
      if (newStatus === "rejected" && sub.status !== "rejected") {
        if (userProfile) {
          const beforeBalance = userProfile.credits || 0;
          const afterBalance = beforeBalance + sub.creditUsed;
          
          // Refund credits
          await dbService.updateDocument("users", sub.userId, {
            credits: afterBalance
          });

          // Create transaction log
          await dbService.addDocument("creditTransactions", {
            userId: sub.userId,
            type: "refund",
            amount: sub.creditUsed,
            beforeBalance,
            afterBalance,
            referenceId: sub.submissionId,
            description: `Refund Kredit: Cek Ditolak (${sub.submissionId})`
          });
          
          toast.success(`Kredit sebanyak ${sub.creditUsed} berhasil dikembalikan ke pengguna.`);
        }
      }

      // Update submission record
      await dbService.updateDocument("submissions", sub.id, {
        status: newStatus,
        notes: adminNotes,
        resultFile: newStatus === "completed" ? resultFileUrl : "",
        processedAt: newStatus === "completed" || newStatus === "rejected" ? new Date().toISOString() : null
      });

      toast.success(`Pengajuan ${sub.submissionId} berhasil diperbarui!`);
      setActiveSubmission(null);
    } catch (err: any) {
      toast.error("Gagal memperbarui status pengajuan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    const user = getUserDetails(sub.userId);
    const matchesSearch =
      sub.submissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.checkTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedItems = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Manajemen Pengajuan</h1>
        <p className={styles.subtitle}>
          Proses dokumen Turnitin yang diajukan oleh pengguna, ubah status antrean, dan unggah berkas hasil penapisan.
        </p>
      </div>

      {/* Filter and Search */}
      <SearchBar
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        placeholder="Cari ID Pengajuan, nama, email..."
        filterValue={statusFilter}
        onFilterChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        filterOptions={[
          { value: "all", label: "Semua Status" },
          { value: "waiting", label: "Menunggu Antrean" },
          { value: "processing", label: "Sedang Diproses" },
          { value: "completed", label: "Selesai" },
          { value: "rejected", label: "Ditolak" }
        ]}
      />

      {/* Main Table view */}
      {loading ? (
        <Loading />
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pengajuan"
          description="Tidak ada berkas pengajuan cek Turnitin yang ditemukan."
        />
      ) : (
        <div className={styles.tableWrapper}>
          <Table headers={["ID Pengajuan", "User", "Jenis Layanan", "Status", "Tanggal Diajukan", "Catatan Admin", "Dokumen Awal", "Aksi"]}>
            {paginatedItems.map((sub) => {
              const u = getUserDetails(sub.userId);
              return (
                <tr key={sub.id} className={styles.tableRow}>
                  <td className={styles.submissionIdCell}>
                    {sub.submissionId}
                  </td>
                  <td className={styles.userCell}>
                    <span className={styles.userName}>{u.name}</span>
                    <span className={styles.userEmail}>{u.email}</span>
                  </td>
                  <td className={styles.checkTypeCell} title={sub.checkTypeName}>
                    {sub.checkTypeName}
                  </td>
                  <td>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className={styles.notesCell} title={sub.notes}>
                    {sub.notes || <span className={styles.notesEmpty}>-</span>}
                  </td>
                  <td>
                    {sub.documentFile ? (
                      <a
                        href={getProxyUrl(sub.documentFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadButton}
                      >
                        <svg className={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh
                      </a>
                    ) : (
                      <span className={styles.noDocument}>-</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenStatusModal(sub)}
                      className={styles.editButton}
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>

          {/* Pagination controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Edit Status Modal */}
      <Modal
        isOpen={!!activeSubmission}
        onClose={() => setActiveSubmission(null)}
        title={`Ubah Status Pengajuan - ${activeSubmission?.submissionId}`}
        size="md"
      >
        {activeSubmission && (
          <form onSubmit={handleUpdateStatus} className={styles.modalForm}>
            {/* Status Select */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Pilih Status Baru
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.selectInput}
              >
                <option value="waiting" className={styles.selectOption}>Menunggu Antrean</option>
                <option value="processing" className={styles.selectOption}>Sedang Diproses</option>
                <option value="completed" className={styles.selectOption}>Selesai (Completed)</option>
                <option value="rejected" className={styles.selectOption}>Ditolak & Refund Kredit</option>
              </select>
            </div>

            {/* Results File Uploader (Only visible when marking Completed) */}
            {newStatus === "completed" && (
              <div className={styles.uploadSection}>
                <label className={styles.formLabel}>
                  Unggah Berkas Hasil Turnitin
                </label>
                <UploadBox
                  uploadType="results"
                  onUploadSuccess={(url) => setResultFileUrl(url)}
                  onUploadError={(err) => toast.error(err)}
                  allowedExtensions={[".pdf", ".zip"]}
                />
              </div>
            )}

            {/* Admin Notes Textarea */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Catatan / Umpan Balik Admin
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Masukkan persentase kecocokan plagiat atau alasan penolakan..."
                className={styles.textareaInput}
              />
            </div>

            {/* Actions buttons */}
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setActiveSubmission(null)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="glow-primary"
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
