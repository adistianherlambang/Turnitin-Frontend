"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dbService } from "@/services/dbService";
import Table from "@/components/Table/Table";
import StatusBadge from "@/components/Badge/StatusBadge";
import SearchBar from "@/components/Table/SearchBar";
import Pagination from "@/components/Table/Pagination";
import EmptyState from "@/components/EmptyState/EmptyState";
import Loading from "@/components/Loading/Loading";
import Button from "@/components/Button/Button";
import Link from "next/link";
import styles from "./page.module.css";

export default function UserHistory() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!user) return;
    const userId = user.uid || user.id;

    // Listen to real-time updates for submissions
    const unsub = dbService.subscribeCollection(
      "submissions",
      (data) => {
        // Sort by date descending
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSubmissions(data);
        setLoading(false);
      },
      [{ field: "userId", operator: "==", value: userId }]
    );

    return () => unsub();
  }, [user]);

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.submissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.checkTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.documentFile && sub.documentFile.toLowerCase().includes(searchQuery.toLowerCase()));
      
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
        <h1 className={styles.title}>Riwayat Pengajuan</h1>
        <p className={styles.subtitle}>
          Pantau status pengecekan naskah Turnitin Anda dan unduh laporan tingkat kemiripan resmi di sini.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <SearchBar
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1); // reset
        }}
        placeholder="Cari ID Pengajuan atau Layanan..."
        filterValue={statusFilter}
        onFilterChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1); // reset
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
          title="Tidak Ada Riwayat"
          description={
            searchQuery || statusFilter !== "all"
              ? "Tidak ada hasil pengajuan yang cocok dengan pencarian Anda."
              : "Anda belum pernah mengajukan pengecekan dokumen."
          }
          actionButton={
            !(searchQuery || statusFilter !== "all") && (
              <Link href="/dashboard/submit">
                <Button size="sm">Ajukan Cek Sekarang</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className={styles.tableWrapper}>
          <Table headers={["ID Pengajuan", "Layanan", "Status", "Tanggal Cek", "Catatan Admin", "Berkas Dokumen", "Hasil Laporan"]}>
            {paginatedItems.map((sub) => {
              // Extract filename from URL
              const getFileName = (url) => {
                if (!url) return "";
                const decoded = decodeURIComponent(url);
                return decoded.substring(decoded.lastIndexOf("/") + 1).split("-").slice(1).join("-") || "Dokumen";
              };

              return (
                <tr key={sub.id} className={styles.tableRow}>
                  <td className={styles.fontMono}>
                    {sub.submissionId}
                  </td>
                  <td className={styles.textWhiteTruncate} title={sub.checkTypeName}>
                    {sub.checkTypeName}
                  </td>
                  <td>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className={styles.textMuted}>
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className={styles.textMutedTruncate} title={sub.notes}>
                    {sub.notes || <span className="text-zinc-600">-</span>}
                  </td>
                  <td>
                    {sub.documentFile ? (
                      <a
                        href={sub.documentFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadLink}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh
                      </a>
                    ) : (
                      <span className={styles.textMuted}>-</span>
                    )}
                  </td>
                  <td>
                    {sub.status === "completed" && sub.resultFile ? (
                      <a
                        href={sub.resultFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.resultLink}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Hasil PDF
                      </a>
                    ) : sub.status === "rejected" ? (
                      <span className={`${styles.statusText} ${styles.statusRejected}`}>Ditolak</span>
                    ) : (
                      <span className={`${styles.statusText} ${styles.statusPending}`}>Menunggu</span>
                    )}
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
    </div>
  );
}
