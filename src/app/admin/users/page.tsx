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
import Input from "@/components/Input/Input";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected states for actions
  const [activeUser, setActiveUser] = useState<any>(null); // user object
  const [creditAmount, setCreditAmount] = useState(5);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAction, setCreditAction] = useState("add"); // add | deduct
  
  const [userToToggleStatus, setUserToToggleStatus] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Listen to users collection
    const unsub = dbService.subscribeCollection("users", (data) => {
      // Sort by creation date
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenCreditModal = (user, actionType) => {
    setActiveUser(user);
    setCreditAction(actionType);
    setCreditAmount(5);
    setIsCreditModalOpen(true);
  };

  const handleModifyCredits = async (e) => {
    e.preventDefault();
    if (!activeUser) return;

    if (creditAmount <= 0) {
      toast.error("Jumlah kredit harus lebih besar dari 0.");
      return;
    }

    setSubmitting(true);
    try {
      const beforeBalance = activeUser.credits || 0;
      let afterBalance = beforeBalance;
      let type = "manual_add";
      let desc = "";

      if (creditAction === "add") {
        afterBalance = beforeBalance + Number(creditAmount);
        type = "manual_add";
        desc = `Penambahan kredit manual oleh Admin.`;
      } else {
        if (beforeBalance < creditAmount) {
          toast.error("Saldo kredit pengguna tidak mencukupi untuk dipotong.");
          setSubmitting(false);
          return;
        }
        afterBalance = beforeBalance - Number(creditAmount);
        type = "manual_deduct";
        desc = `Pemotongan kredit manual oleh Admin.`;
      }

      // 1. Update user profile credits
      await dbService.updateDocument("users", activeUser.id, {
        credits: afterBalance
      });

      // 2. Log credit transactions
      await dbService.addDocument("creditTransactions", {
        userId: activeUser.id,
        type,
        amount: creditAction === "add" ? Number(creditAmount) : -Number(creditAmount),
        beforeBalance,
        afterBalance,
        referenceId: `ADM-MAN-${Math.floor(1000 + Math.random() * 9000)}`,
        description: desc
      });

      toast.success(`Berhasil ${creditAction === "add" ? "menambahkan" : "memotong"} ${creditAmount} kredit untuk ${activeUser.name}.`);
      setIsCreditModalOpen(false);
      setActiveUser(null);
    } catch (err: any) {
      toast.error("Gagal mengubah kredit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setSubmitting(true);

    try {
      const u = userToToggleStatus;
      const targetStatus = u.status === "active" ? "suspended" : "active";

      await dbService.updateDocument("users", u.id, {
        status: targetStatus
      });

      toast.success(`User ${u.name} berhasil ${targetStatus === "suspended" ? "ditangguhkan" : "diaktifkan"}!`);
      setUserToToggleStatus(null);
    } catch (err: any) {
      toast.error("Gagal mengubah status user: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    // Hide admins from general users list (only manage customers)
    if (u.role === "admin") return false;

    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Manajemen Pengguna</h1>
        <p className={styles.subtitle}>
          Kelola database pelanggan Anda, tambahkan/potong kredit, dan tangguhkan akun pengguna bermasalah.
        </p>
      </div>

      {/* Filter and Search */}
      <SearchBar
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        placeholder="Cari nama atau email..."
        filterValue={statusFilter}
        onFilterChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        filterOptions={[
          { value: "all", label: "Semua Status" },
          { value: "active", label: "Aktif" },
          { value: "suspended", label: "Ditangguhkan" }
        ]}
      />

      {/* Main Table view */}
      {loading ? (
        <Loading />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pengguna"
          description="Tidak ada pengguna terdaftar yang ditemukan."
        />
      ) : (
        <div className={styles.tableWrapper}>
          <Table headers={["Profil", "Email", "Jumlah Kredit", "Status Akun", "Bergabung Pada", "Kelola Saldo", "Kelola Status"]}>
            {paginatedItems.map((u) => (
              <tr key={u.id} className={styles.tableRow}>
                <td className={styles.userCell}>
                  <UserAvatar src={u.photoURL} name={u.name} size="sm" />
                  <span className={styles.userName}>{u.name}</span>
                </td>
                <td className={styles.userEmail}>
                  {u.email}
                </td>
                <td className={styles.creditsCell}>
                  {u.credits || 0}
                </td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td className={styles.dateCell}>
                  {new Date(u.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </td>
                <td>
                  <div className={styles.creditActions}>
                    <button
                      onClick={() => handleOpenCreditModal(u, "add")}
                      className={styles.creditAddBtn}
                    >
                      + Tambah
                    </button>
                    <button
                      onClick={() => handleOpenCreditModal(u, "deduct")}
                      className={styles.creditDeductBtn}
                    >
                      - Potong
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => setUserToToggleStatus(u)}
                    className={u.status === "active" ? styles.suspendBtn : styles.activateBtn}
                  >
                    {u.status === "active" ? "Suspend" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>

          {/* Pagination controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Manual Credit Modification Modal */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title={creditAction === "add" ? `Tambah Kredit Manual - ${activeUser?.name}` : `Potong Kredit Manual - ${activeUser?.name}`}
        size="sm"
      >
        {activeUser && (
          <form onSubmit={handleModifyCredits} className={styles.modalForm}>
            <div className={styles.modalInfo}>
              Saldo kredit saat ini: <span className={styles.creditsHighlight}>{activeUser.credits} kredit</span>
            </div>
            <Input
              label="Jumlah Kredit"
              type="number"
              min="1"
              max="1000"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />
            
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setIsCreditModalOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={submitting}
                variant={creditAction === "add" ? "success" : "primary"}
              >
                {creditAction === "add" ? "Tambah Kredit" : "Potong Kredit"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Toggle Suspend Dialog */}
      <ConfirmDialog
        isOpen={!!userToToggleStatus}
        onClose={() => setUserToToggleStatus(null)}
        onConfirm={handleToggleStatus}
        title={userToToggleStatus?.status === "active" ? "Suspend User" : "Aktifkan User"}
        message={
          userToToggleStatus?.status === "active"
            ? `Apakah Anda yakin ingin menangguhkan user ${userToToggleStatus?.name}? Pengguna ini tidak akan bisa login ke dashboard.`
            : `Apakah Anda yakin ingin mengaktifkan kembali akun user ${userToToggleStatus?.name}?`
        }
        confirmText={userToToggleStatus?.status === "active" ? "Ya, Suspend" : "Ya, Aktifkan"}
        variant={userToToggleStatus?.status === "active" ? "danger" : "success"}
        loading={submitting}
      />
    </div>
  );
}
