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
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { toast } from "react-hot-toast";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected payment for actions
  const [selectedProofUrl, setSelectedProofUrl] = useState<any>(null);
  const [paymentToApprove, setPaymentToApprove] = useState<any>(null);
  const [paymentToReject, setPaymentToReject] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Listen to payments
    const unsubPayments = dbService.subscribeCollection("payments", (data) => {
      // Sort payments by date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPayments(data);
    });

    // Listen to users for mapping userId to names/emails
    const unsubUsers = dbService.subscribeCollection("users", (data) => {
      setUsers(data);
    });

    const timer = setTimeout(() => setLoading(false), 500);

    return () => {
      unsubPayments();
      unsubUsers();
      clearTimeout(timer);
    };
  }, []);

  const getUserDetails = (userId) => {
    const u = users.find(user => user.id === userId);
    return u ? { name: u.name, email: u.email } : { name: "User Terhapus", email: "N/A" };
  };

  const handleApprove = async () => {
    if (!paymentToApprove) return;
    setSubmitting(true);
    
    try {
      const pay = paymentToApprove;
      const userProfile = users.find(u => u.id === pay.userId);
      
      if (!userProfile) {
        throw new Error("Profil pengguna tidak ditemukan.");
      }

      // 1. Add credit to user profile
      const beforeBalance = userProfile.credits || 0;
      const afterBalance = beforeBalance + pay.credits;
      
      await dbService.updateDocument("users", pay.userId, {
        credits: afterBalance
      });

      // 2. Create transaction record
      await dbService.addDocument("creditTransactions", {
        userId: pay.userId,
        type: "topup",
        amount: pay.credits,
        beforeBalance,
        afterBalance,
        referenceId: pay.paymentId,
        description: `Top-up Kredit Approved (${pay.paymentId})`
      });

      // 3. Set payment status to Approved
      await dbService.updateDocument("payments", pay.id, {
        status: "approved",
        verifiedAt: new Date().toISOString(),
        verifiedBy: "admin-user-id" // Admin who approved
      });

      toast.success(`Pembayaran ${pay.paymentId} berhasil disetujui!`);
      setPaymentToApprove(null);
    } catch (err: any) {
      toast.error("Gagal menyetujui pembayaran: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!paymentToReject) return;
    setSubmitting(true);
    
    try {
      const pay = paymentToReject;

      // Update payment status to Rejected
      await dbService.updateDocument("payments", pay.id, {
        status: "rejected",
        verifiedAt: new Date().toISOString(),
        verifiedBy: "admin-user-id"
      });

      toast.success(`Pembayaran ${pay.paymentId} ditolak.`);
      setPaymentToReject(null);
    } catch (err: any) {
      toast.error("Gagal menolak pembayaran: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredPayments = payments.filter((pay) => {
    const user = getUserDetails(pay.userId);
    const matchesSearch =
      pay.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || pay.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedItems = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Manajemen Pembayaran</h1>
        <p className="text-xs text-text-secondary mt-1">
          Verifikasi struk bukti transfer dan setujui penambahan saldo kredit pengguna.
        </p>
      </div>

      {/* Filter and Search */}
      <SearchBar
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        placeholder="Cari ID Pembayaran, nama, email..."
        filterValue={statusFilter}
        onFilterChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        filterOptions={[
          { value: "all", label: "Semua Status" },
          { value: "pending", label: "Menunggu Antrean" },
          { value: "approved", label: "Disetujui" },
          { value: "rejected", label: "Ditolak" }
        ]}
      />

      {/* Main Table view */}
      {loading ? (
        <Loading />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pembayaran"
          description="Tidak ada catatan pembayaran top-up kredit yang ditemukan."
        />
      ) : (
        <div className="space-y-4">
          <Table headers={["ID Pembayaran", "User", "Nominal Transfer", "Jumlah Kredit", "Status", "Bukti", "Tanggal Diajukan", "Aksi"]}>
            {paginatedItems.map((pay) => {
              const u = getUserDetails(pay.userId);
              return (
                <tr key={pay.id} className="hover:bg-zinc-900/30">
                  <td className="font-mono text-xs font-semibold text-zinc-300">
                    {pay.paymentId}
                  </td>
                  <td className="text-xs">
                    <span className="block font-bold text-white leading-tight">{u.name}</span>
                    <span className="block text-[10px] text-text-secondary mt-0.5">{u.email}</span>
                  </td>
                  <td className="font-mono text-xs text-white">
                    {formatCurrency(pay.amount)}
                  </td>
                  <td className="font-mono text-xs font-bold text-zinc-200">
                    {pay.credits}
                  </td>
                  <td>
                    <StatusBadge status={pay.status} />
                  </td>
                  <td>
                    {pay.proofFile ? (
                      <button
                        onClick={() => setSelectedProofUrl(pay.proofFile)}
                        className="text-xs font-semibold text-primary hover:text-blue-400"
                      >
                        Lihat Berkas
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="text-xs text-text-secondary">
                    {new Date(pay.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td>
                    {pay.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPaymentToReject(pay)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => setPaymentToApprove(pay)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-success bg-success/10 hover:bg-success/20 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">Selesai Diverifikasi</span>
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

      {/* Lightbox Modal for receipt proof */}
      <Modal
        isOpen={!!selectedProofUrl}
        onClose={() => setSelectedProofUrl(null)}
        title="Bukti Transfer Pembayaran"
        size="lg"
      >
        <div className="flex flex-col items-center justify-center bg-zinc-950 p-4 rounded-xl border border-border">
          {selectedProofUrl && (
            selectedProofUrl.endsWith(".pdf") ? (
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Unduh / Buka Dokumen PDF Struk
              </a>
            ) : (
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            )
          )}
        </div>
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!paymentToApprove}
        onClose={() => setPaymentToApprove(null)}
        onConfirm={handleApprove}
        title="Approve Pembayaran Top-up"
        message={`Apakah Anda yakin ingin menyetujui pembayaran ${paymentToApprove?.paymentId}? Tindakan ini akan menambahkan saldo kredit pengguna sebanyak ${paymentToApprove?.credits} kredit secara langsung.`}
        confirmText="Ya, Approve"
        variant="success"
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={!!paymentToReject}
        onClose={() => setPaymentToReject(null)}
        onConfirm={handleReject}
        title="Tolak Pembayaran Top-up"
        message={`Apakah Anda yakin ingin menolak pembayaran ${paymentToReject?.paymentId}? Saldo kredit pengguna tidak akan berubah.`}
        confirmText="Tolak Pembayaran"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
