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
    <div className="space-y-6 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Jenis Pengecekan</h1>
          <p className="text-xs text-text-secondary mt-1">
            Konfigurasi jenis layanan, biaya kredit, dan perhitungan yang ditawarkan pada formulir pengajuan user.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="glow-primary text-xs px-4 py-2.5 font-bold">
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
            <tr key={type.id} className="hover:bg-zinc-900/30">
              <td className="font-mono text-xs font-bold text-text-secondary">{type.sortOrder}</td>
              <td className="text-xs">
                <span className="block font-bold text-white leading-tight">{type.name}</span>
                <span className="block text-[10px] text-text-secondary mt-1 max-w-[200px] truncate" title={type.description}>
                  {type.description}
                </span>
              </td>
              <td className="font-mono text-xs text-zinc-400">{type.slug}</td>
              <td className="font-mono text-xs font-bold text-white">{type.creditCost} kredit</td>
              <td className="text-xs text-text-secondary">
                {type.unitType === "fixed" ? "Tarif Tetap" : `Per ${type.unitValue} kata`}
              </td>
              <td>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  type.isActive
                    ? "bg-success/15 text-success border border-success/20"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                }`}>
                  {type.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(type)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setTypeToDelete(type)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-zinc-300 tracking-wide">
              Deskripsi Layanan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat yang menjelaskan detail cakupan layanan pengecekan..."
              className="w-full px-4 py-2.5 text-sm bg-zinc-900 border border-border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Biaya Kredit"
              type="number"
              min="1"
              value={creditCost}
              onChange={(e) => setCreditCost(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-zinc-300 tracking-wide">
                Tipe Perhitungan Unit
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-zinc-900 border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <Input
              label="Urutan Urutan Tampilan"
              type="number"
              min="1"
              value={sortOrder}
              onChange={(e) => setSortOrder(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />

            <div className="flex items-center gap-3 select-none h-full pt-4">
              <input
                type="checkbox"
                id="active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-zinc-900 text-primary focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-semibold text-zinc-300 cursor-pointer">
                Layanan Aktif / Ditampilkan
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
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
