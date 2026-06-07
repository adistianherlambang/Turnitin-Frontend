"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { dbService } from "@/services/dbService";
import CreditCard from "@/components/Card/CreditCard";
import StatisticCard from "@/components/Card/StatisticCard";
import NotificationCard from "@/components/Card/NotificationCard";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import StatusBadge from "@/components/Badge/StatusBadge";
import Button from "@/components/Button/Button";
import EmptyState from "@/components/EmptyState/EmptyState";
import Loading from "@/components/Loading/Loading";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function UserDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Subscribe to user's submissions
  useEffect(() => {
    if (!user) return;

    const userId = user.uid || user.id;
    const unsub = dbService.subscribeCollection(
      "submissions",
      (data) => {
        setSubmissions(data);
        setLoadingSubmissions(false);
      },
      [{ field: "userId", operator: "==", value: userId }]
    );

    return () => unsub();
  }, [user]);

  // Subscribe to global notifications announcements
  useEffect(() => {
    if (!user) return;
    const unsub = dbService.subscribeCollection(
      "notifications",
      (data) => {
        setNotifications(data);
        setLoadingSubmissions(false);
        setNotifications(data);
        setLoadingNotifications(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Fetch transactions for modal
  const openTransactionHistory = async () => {
    setIsTxnModalOpen(true);
    if (!user) return;
    try {
      const userId = user.uid || user.id;
      const data = await dbService.getDocuments("creditTransactions", [
        { field: "userId", operator: "==", value: userId }
      ]);
      // Sort by date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(data);
    } catch (err: any) {
      toast.error("Gagal memuat riwayat mutasi: " + err.message);
    }
  };

  // Calculations
  const totalSubmissions = submissions.length;
  const inProgress = submissions.filter(s => s.status === "processing" || s.status === "waiting").length;
  const completed = submissions.filter(s => s.status === "completed").length;

  const getRecentSubmissions = () => {
    return [...submissions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Top Banner - Welcome */}
      <div className={styles.banner}>
        <div>
          <h1 className={styles.bannerTitle}>
            Selamat Datang, {user?.name || "Pengguna"}!
          </h1>
          <p className={styles.bannerSubtitle}>
            Gunakan saldo kredit Anda untuk melakukan penapisan plagiasi dokumen akademik secara aman.
          </p>
        </div>
        <div className={styles.bannerActions}>
          <Link href="/dashboard/submit">
            <Button className={styles.newCheckBtn}>
              Ajukan Pengecekan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit balance card & stats indicators */}
      <div className={styles.gridCards}>
        {/* Credit Card component */}
        <div className={styles.cardColumn}>
          <CreditCard name={user?.name || ""} credits={user?.credits || 0} />

          <div className={styles.actionButtons}>
            <button
              onClick={() => {
                const buyBtn = document.querySelector('button[class*="creditsBuyBtn"]');
                if (buyBtn) (buyBtn as any).click();
              }}
              className={styles.actionBtn}
            >
              Isi Kredit
            </button>
            <button
              onClick={openTransactionHistory}
              className={styles.actionBtn}
            >
              Riwayat Mutasi
            </button>
          </div>
        </div>

        {/* Numeric stats indicator cards */}
        <div className={styles.statsColumn}>
          <StatisticCard
            title="Total Pengajuan Cek"
            value={totalSubmissions}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            trend="Total keseluruhan pengajuan"
            trendDirection="neutral"
          />
          <StatisticCard
            title="Sedang Diproses"
            value={inProgress}
            icon={
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend="Menunggu antrean & diproses"
            trendDirection="neutral"
          />
          <StatisticCard
            title="Selesai Diuji"
            value={completed}
            icon={
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend="Hasil laporan PDF terbit"
            trendDirection="neutral"
          />
        </div>
      </div>

      {/* Main Grid: Latest submissions and Notifications */}
      <div className={styles.mainContentGrid}>
        {/* Latest submissions list */}
        <div className={styles.submissionsWrapper}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Pengajuan Terbaru</h4>
            <Link href="/dashboard/history" className={styles.viewAllLink}>
              Lihat Semua
            </Link>
          </div>

          {loadingSubmissions ? (
            <Loading />
          ) : getRecentSubmissions().length === 0 ? (
            <EmptyState
              title="Belum Ada Pengajuan"
              description="Anda belum mengajukan berkas cek Turnitin apapun."
              actionButton={
                <Link href="/dashboard/submit">
                  <Button variant="outline" size="sm">Mulai Cek Dokumen</Button>
                </Link>
              }
            />
          ) : (
            <Table headers={["ID Pengajuan", "Layanan", "Status", "Tanggal", "Aksi"]}>
              {getRecentSubmissions().map((sub) => (
                <tr key={sub.id} className={styles.tableRow}>
                  <td className={styles.fontMono}>{sub.submissionId}</td>
                  <td className={styles.textWhiteTruncate}>{sub.checkTypeName}</td>
                  <td>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className={styles.textMuted}>
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td>
                    <Link
                      href="/dashboard/history"
                      className={styles.detailLink}
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>

        {/* Global Notifications Announcements */}
        <div className={styles.announcementsWrapper}>
          <h4 className={styles.sectionTitle}>Pengumuman Admin</h4>

          {loadingNotifications ? (
            <Loading />
          ) : notifications.length === 0 ? (
            <div className={styles.announcementEmpty}>
              Tidak ada pengumuman baru saat ini.
            </div>
          ) : (
            <div className={styles.announcementsList}>
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  title={notif.title}
                  message={notif.message}
                  createdAt={notif.createdAt}
                  createdBy={notif.createdBy}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POPUP RIWAYAT MUTASI KREDIT */}
      <Modal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        title="Riwayat Mutasi Kredit"
        size="lg"
      >
        {transactions.length === 0 ? (
          <EmptyState
            title="Tidak Ada Mutasi"
            description="Belum ada catatan mutasi penambahan atau pemotongan kredit pada akun Anda."
          />
        ) : (
          <div className={styles.modalContent}>
            <Table headers={["Kategori", "Jumlah Kredit", "Saldo Akhir", "Keterangan", "Tanggal"]}>
              {transactions.map((txn) => {
                const isAddition = txn.amount > 0;
                const typeLabels = {
                  topup: "Top-Up Pembelian",
                  usage: "Penggunaan Cek",
                  refund: "Refund Dana",
                  bonus: "Kredit Bonus",
                  manual_add: "Tambahan Manual",
                  manual_deduct: "Potongan Manual"
                };

                return (
                  <tr key={txn.id} className={styles.tableRow}>
                    <td className="text-xs">
                      <span className={`${styles.badgeTransaction} ${txn.type === "usage" || txn.type === "manual_deduct"
                          ? styles.badgeDeduct
                          : styles.badgeAdd
                        }`}>
                        {typeLabels[txn.type] || txn.type}
                      </span>
                    </td>
                    <td className={isAddition ? styles.amountAdd : styles.amountDeduct}>
                      {isAddition ? "+" : ""}{txn.amount}
                    </td>
                    <td className={styles.fontMono}>{txn.afterBalance}</td>
                    <td className={styles.textMuted} style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={txn.description}>
                      {txn.description}
                    </td>
                    <td className={styles.textMuted}>
                      {new Date(txn.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                  </tr>
                );
              })}
            </Table>
          </div>
        )}
      </Modal>
    </div>
  );
}
