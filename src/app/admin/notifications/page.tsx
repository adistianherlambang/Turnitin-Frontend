"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/services/dbService";
import Table from "@/components/Table/Table";
import EmptyState from "@/components/EmptyState/EmptyState";
import Loading from "@/components/Loading/Loading";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<any>(null); // notif object or null for add
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  
  const [notifToDelete, setNotifToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Listen to announcements
    const unsub = dbService.subscribeCollection("notifications", (data) => {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingNotif(null);
    setTitle("");
    setMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notif) => {
    setEditingNotif(notif);
    setTitle(notif.title);
    setMessage(notif.message);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Judul dan pesan pengumuman wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const notifData = {
        title,
        message,
        createdBy: "Super Admin"
      };

      if (editingNotif) {
        await dbService.updateDocument("notifications", editingNotif.id, notifData);
        toast.success("Pengumuman berhasil diperbarui!");
      } else {
        await dbService.addDocument("notifications", notifData);
        toast.success("Pengumuman baru disiarkan ke semua user!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error("Gagal menyimpan pengumuman: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!notifToDelete) return;
    setSubmitting(true);

    try {
      await dbService.deleteDocument("notifications", notifToDelete.id);
      toast.success("Pengumuman berhasil dihapus.");
      setNotifToDelete(null);
    } catch (err: any) {
      toast.error("Gagal menghapus pengumuman: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Title & Actions */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pengumuman & Siaran</h1>
          <p className={styles.subtitle}>
            Buat siaran pengumuman penting atau banner promo pembelian kredit yang akan tampil langsung di dashboard pengguna.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className={styles.addBtn}>
          Buat Siaran Baru
        </Button>
      </div>

      {/* Main Table view */}
      {loading ? (
        <Loading />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Tidak Ada Siaran"
          description="Belum ada pengumuman yang disiarkan pada platform."
          actionButton={
            <Button size="sm" onClick={handleOpenAdd}>Buat Pengumuman Pertama</Button>
          }
        />
      ) : (
        <Table headers={["Tanggal Disiarkan", "Judul Pengumuman", "Pesan Pengumuman", "Pembuat", "Aksi"]}>
          {notifications.map((notif) => (
            <tr key={notif.id} className={styles.tableRow}>
              <td className={styles.dateText}>
                {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </td>
              <td className={styles.notifTitle} title={notif.title}>
                {notif.title}
              </td>
              <td className={styles.notifMessage} title={notif.message}>
                {notif.message}
              </td>
              <td className={styles.creatorText}>{notif.createdBy}</td>
              <td>
                <div className={styles.actionsCell}>
                  <button
                    onClick={() => handleOpenEdit(notif)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setNotifToDelete(notif)}
                    className={styles.deleteBtn}
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotif ? "Edit Siaran Pengumuman" : "Buat Siaran Baru"}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Judul Pengumuman"
            placeholder="Contoh: Promo Cashback Kredit Akhir Tahun!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Isi Pesan Pengumuman
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan detail pengumuman yang ingin disampaikan kepada pengguna..."
              className={styles.textarea}
            />
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              {editingNotif ? "Perbarui Pengumuman" : "Siarkan Sekarang"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!notifToDelete}
        onClose={() => setNotifToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${notifToDelete?.title}"? Pengumuman ini akan lenyap dari dashboard pengguna secara langsung.`}
        confirmText="Hapus Pengumuman"
        loading={submitting}
      />
    </div>
  );
}
