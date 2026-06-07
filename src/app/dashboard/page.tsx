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
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner - Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Selamat Datang, {user?.name || "Pengguna"}!
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Gunakan saldo kredit Anda untuk melakukan penapisan plagiasi dokumen akademik secara aman.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/submit">
            <Button className="glow-primary text-xs font-bold px-4 py-2.5">
              Ajukan Pengecekan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit balance card & stats indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Card component */}
        <div className="lg:col-span-1 flex flex-col justify-between">
          <CreditCard name={user?.name || ""} credits={user?.credits || 0} />
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => {
                const buyBtn = document.querySelector('button[class*="active:scale-95"]');
                if (buyBtn) (buyBtn as any).click();
              }}
              className="py-3 px-4 rounded-xl bg-zinc-900 border border-border text-xs font-semibold text-white hover:bg-zinc-800 transition-colors text-center"
            >
              Isi Kredit
            </button>
            <button
              onClick={openTransactionHistory}
              className="py-3 px-4 rounded-xl bg-zinc-900 border border-border text-xs font-semibold text-white hover:bg-zinc-800 transition-colors text-center"
            >
              Riwayat Mutasi
            </button>
          </div>
        </div>

        {/* Numeric stats indicator cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest submissions list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">Pengajuan Terbaru</h4>
            <Link href="/dashboard/history" className="text-xs text-primary hover:underline">
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
                <tr key={sub.id} className="hover:bg-zinc-900/30">
                  <td className="font-mono text-xs text-zinc-300">{sub.submissionId}</td>
                  <td className="text-xs text-white max-w-[150px] truncate">{sub.checkTypeName}</td>
                  <td>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="text-xs text-text-secondary">
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td>
                    <Link
                      href="/dashboard/history"
                      className="text-xs font-semibold text-primary hover:text-blue-400"
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
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white tracking-wide uppercase">Pengumuman Admin</h4>
          
          {loadingNotifications ? (
            <Loading />
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-secondary bg-zinc-900/10 border border-border/60 rounded-2xl">
              Tidak ada pengumuman baru saat ini.
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
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
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
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
                  <tr key={txn.id} className="hover:bg-zinc-900/30">
                    <td className="text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        txn.type === "usage" || txn.type === "manual_deduct"
                          ? "bg-zinc-800 text-zinc-300"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {typeLabels[txn.type] || txn.type}
                      </span>
                    </td>
                    <td className={`font-mono text-xs font-bold ${isAddition ? "text-emerald-400" : "text-red-400"}`}>
                      {isAddition ? "+" : ""}{txn.amount}
                    </td>
                    <td className="font-mono text-xs text-white">{txn.afterBalance}</td>
                    <td className="text-xs text-text-secondary max-w-[180px] truncate" title={txn.description}>
                      {txn.description}
                    </td>
                    <td className="text-xs text-text-secondary">
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
