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

export default function AdminCheckTypes() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null); // type object or null for add
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [creditCost, setCreditCost] = useState(2);
  const [unitType, setUnitType] = useState("fixed"); // fixed | per_word | per_character
  const [unitValue, setUnitValue] = useState(1);
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [typeToDelete, setTypeToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Listen to check types collection
    const unsub = dbService.subscribeCollection("checkTypes", (data) => {
      // Sort by sortOrder
      data.sort((a, b) => a.sortOrder - b.sortOrder);
      setTypes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingType(null);
    setName("");
    setSlug("");
    setDescription("");
    setCreditCost(2);
    setUnitType("fixed");
    setUnitValue(1);
    setSortOrder(types.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type) => {
    setEditingType(type);
    setName(type.name);
    setSlug(type.slug);
    setDescription(type.description);
    setCreditCost(type.creditCost);
    setUnitType(type.unitType);
    setUnitValue(type.unitValue);
    setSortOrder(type.sortOrder);
    setIsActive(type.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Nama dan Slug wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const typeData = {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        description,
        creditCost: Number(creditCost),
        unitType,
        unitValue: Number(unitValue),
        sortOrder: Number(sortOrder),
        isActive
      };

      if (editingType) {
        // Update document
        await dbService.updateDocument("checkTypes", editingType.id, typeData);
        toast.success("Jenis pengecekan berhasil diperbarui!");
      } else {
        // Add document
        await dbService.addDocument("checkTypes", typeData, typeData.slug);
        toast.success("Jenis pengecekan berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error("Gagal menyimpan data: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    setSubmitting(true);

    try {
      await dbService.deleteDocument("checkTypes", typeToDelete.id);
      toast.success("Layanan berhasil dihapus.");
      setTypeToDelete(null);
    } catch (err: any) {
      toast.error("Gagal menghapus layanan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Title & Actions */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Jenis Pengecekan</h1>
          <p className={styles.subtitle}>
            Konfigurasi jenis layanan, biaya kredit, dan perhitungan yang ditawarkan pada formulir pengajuan user.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className={styles.addBtn}>
          Tambah Layanan Baru
        </Button>
      </div>

      {/* Main Table view */}
      {loading ? (
        <Loading />
      ) : types.length === 0 ? (
        <EmptyState
          title="Tidak Ada Layanan"
          description="Belum ada konfigurasi jenis pengecekan. Silakan buat yang baru."
          actionButton={
            <Button size="sm" onClick={handleOpenAdd}>Buat Layanan Pertama</Button>
          }
        />
      ) : (
        <Table headers={["Urutan", "Nama Layanan", "Slug", "Biaya Kredit", "Perhitungan", "Status", "Aksi"]}>
          {types.map((type) => (
            <tr key={type.id} className={styles.tableRow}>
              <td className={styles.sortOrder}>{type.sortOrder}</td>
              <td className={styles.serviceCell}>
                <span className={styles.serviceName}>{type.name}</span>
                <span className={styles.serviceDesc} title={type.description}>
                  {type.description}
                </span>
              </td>
              <td className={styles.slugText}>{type.slug}</td>
              <td className={styles.costText}>{type.creditCost} kredit</td>
              <td className={styles.unitText}>
                {type.unitType === "fixed" ? "Tarif Tetap" : `Per ${type.unitValue} kata`}
              </td>
              <td>
                <span className={`${styles.statusBadge} ${
                  type.isActive ? styles.statusActive : styles.statusInactive
                }`}>
                  {type.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </td>
              <td>
                <div className={styles.actionsCell}>
                  <button
                    onClick={() => handleOpenEdit(type)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setTypeToDelete(type)}
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
        title={editingType ? "Edit Jenis Pengecekan" : "Tambah Jenis Pengecekan"}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nama Layanan"
            placeholder="Contoh: Turnitin No-Repository"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingType) {
                // Auto slugify
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-"));
              }
            }}
            required
          />

          <Input
            label="Slug (Unique URL Key)"
            placeholder="contoh-turnitin-no-repo"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!!editingType}
            required
          />

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Deskripsi Layanan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat yang menjelaskan detail cakupan layanan pengecekan..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.fieldsGrid}>
            <Input
              label="Biaya Kredit"
              type="number"
              min="1"
              value={creditCost}
              onChange={(e) => setCreditCost(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Tipe Perhitungan Unit
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className={styles.select}
              >
                <option value="fixed" className="bg-zinc-950">Fixed (Tarif Tetap)</option>
                <option value="per_word" className="bg-zinc-950">Per Word (Per Kata)</option>
                <option value="per_character" className="bg-zinc-950">Per Character (Per Karakter)</option>
              </select>
            </div>
          </div>

          {unitType !== "fixed" && (
            <Input
              label="Nilai Unit (Contoh: per 500 kata)"
              type="number"
              min="1"
              value={unitValue}
              onChange={(e) => setUnitValue(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />
          )}

          <div className={styles.fieldsGridAlign}>
            <Input
              label="Urutan Urutan Tampilan"
              type="number"
              min="1"
              value={sortOrder}
              onChange={(e) => setSortOrder(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />

            <div className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className={styles.checkboxInput}
              />
              <label htmlFor="active" className={styles.checkboxLabel}>
                Layanan Aktif / Ditampilkan
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Simpan Layanan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Layanan Cek"
        message={`Apakah Anda yakin ingin menghapus layanan ${typeToDelete?.name}? Tindakan ini akan menghilangkannya dari menu draf pengajuan user secara permanen.`}
        confirmText="Hapus Layanan"
        loading={submitting}
      />
    </div>
  );
}
