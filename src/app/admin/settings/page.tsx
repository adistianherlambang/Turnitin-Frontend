"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/services/dbService";
import Card from "@/components/Card/Card";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Loading from "@/components/Loading/Loading";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // General Platform Settings state
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [creditPrice, setCreditPrice] = useState(5000);

  const [websiteName, setWebsiteName] = useState("");
  const [footer, setFooter] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    // Subscribe to general settings
    const unsub = dbService.subscribeCollection("settings", (data) => {
      if (data && data.length > 0) {
        const s = data.find(item => item.id === "general") || data[0];
        setBankName(s.bankName || "");
        setBankAccountNumber(s.bankAccountNumber || "");
        setBankAccountHolder(s.bankAccountHolder || "");
        setContactWhatsapp(s.contactWhatsapp || "");
        setContactEmail(s.contactEmail || "");
        setCreditPrice(s.creditPrice || 5000);
        setWebsiteName(s.websiteName || "");
        setFooter(s.footer || "");
        setSeoTitle(s.seoTitle || "");
        setSeoDescription(s.seoDescription || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData = {
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        contactWhatsapp,
        contactEmail,
        creditPrice: Number(creditPrice),
        websiteName,
        footer,
        seoTitle,
        seoDescription
      };

      await dbService.updateDocument("settings", "general", updateData);
      toast.success("Pengaturan platform berhasil disimpan!");
    } catch (err: any) {
      toast.error("Gagal menyimpan pengaturan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Pengaturan Platform</h1>
        <p className={styles.subtitle}>
          Ubah konfigurasi transfer bank, nomor kontak admin, penyesuaian harga kredit, dan metadata SEO.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className={styles.form}>
        <div className={styles.gridTwoCols}>
          {/* Bank Accounts Setting */}
          <Card title="Rekening Transfer Bank" hoverable={false} className={styles.cardInner}>
            <Input
              label="Nama Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: Bank Central Asia (BCA)"
              required
            />
            <Input
              label="Nomor Rekening"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="Contoh: 12345678"
              required
            />
            <Input
              label="Nama Pemilik Rekening (Atas Nama)"
              value={bankAccountHolder}
              onChange={(e) => setBankAccountHolder(e.target.value)}
              placeholder="Contoh: PT Turnitin Checker"
              required
            />
          </Card>

          {/* Pricing & Support Contact settings */}
          <Card title="Harga Kredit & Pusat Kontak" hoverable={false} className={styles.cardInner}>
            <Input
              label="Harga 1 Kredit (Rupiah)"
              type="number"
              min="1"
              value={creditPrice}
              onChange={(e) => setCreditPrice(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />
            <Input
              label="Nomor WhatsApp Admin (Kode Negara)"
              value={contactWhatsapp}
              onChange={(e) => setContactWhatsapp(e.target.value)}
              placeholder="Contoh: 6281776743211"
              required
            />
            <Input
              label="Email Dukungan Bantuan"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@website.com"
              required
            />
          </Card>
        </div>

        {/* Branding & SEO Metadata */}
        <Card title="Branding Website & Optimasi SEO" hoverable={false} className={styles.cardInner}>
          <div className={styles.gridTwoColsSmall}>
            <Input
              label="Nama Website"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              placeholder="Turnitin Checker AI"
              required
            />
            <Input
              label="Teks Footer"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="© 2026 Turnitin Checker AI. All rights reserved."
              required
            />
          </div>

          <div className={styles.seoSection}>
            <Input
              label="Meta Title SEO"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Cek Turnitin Murah, Cepat dan No-Repository"
              required
            />
            <div className={styles.textareaGroup}>
              <label className={styles.textareaLabel}>
                Meta Description SEO
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Deskripsi pencarian google untuk mengoptimalkan peringkat pencarian situs..."
                className={styles.textarea}
                required
              />
            </div>
          </div>
        </Card>

        {/* Form Submit Button */}
        <div className={styles.submitBtnContainer}>
          <Button
            type="submit"
            loading={submitting}
            className={styles.submitBtn}
          >
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
