"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar/Sidebar";
import Loading from "@/components/Loading/Loading";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import UploadBox from "@/components/UploadBox/UploadBox";
import { dbService } from "@/services/dbService";
import { toast } from "react-hot-toast";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [amount, setAmount] = useState(5);
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bankSettings, setBankSettings] = useState({
    bankName: "Bank Central Asia (BCA)",
    bankAccountNumber: "8029381029",
    bankAccountHolder: "PT Turnitin Indonesia Group",
    creditPrice: 5000
  });

  // Fetch settings for bank info
  useEffect(() => {
    let unsub = () => { };
    if (user) {
      unsub = dbService.subscribeCollection("settings", (data) => {
        if (data && data.length > 0) {
          const s = data.find(item => item.id === "general") || data[0];
          setBankSettings(s);
        }
      });
    }
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading fullPage={true} />;
  }

  if (user.status === "suspended") {
    return (
      <div className={styles.suspendedRoot}>
        <div className={styles.suspendedBox}>
          <h2 className={styles.suspendedTitle}>Akun Ditangguhkan</h2>
          <p className={styles.suspendedDesc}>
            Akun Anda telah ditangguhkan oleh administrator. Harap hubungi dukungan pelanggan di support@turnitinchecker.com untuk memulihkan akun Anda.
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!proofUrl) {
      toast.error("Harap unggah bukti transfer pembayaran Anda!");
      return;
    }

    setSubmitting(true);
    try {
      const paymentId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
      const totalCost = amount * bankSettings.creditPrice;

      await dbService.addDocument("payments", {
        paymentId,
        userId: user.uid || user.id,
        amount: totalCost,
        credits: Number(amount),
        proofFile: proofUrl,
        status: "pending"
      });

      toast.success("Permintaan top-up berhasil diajukan. Mohon tunggu persetujuan admin!");
      setIsBuyModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error("Gagal mengajukan pembayaran: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount(5);
    setProofUrl("");
  };

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <Sidebar onBuyCreditsClick={() => setIsBuyModalOpen(true)} />

      {/* Main Content Pane */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Global Topup Credit Modal */}
      <Modal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title="Beli Kredit Baru"
        size="md"
      >
        <form onSubmit={handleBuySubmit} className={styles.form}>
          <Input
            label="Jumlah Kredit"
            type="number"
            min="1"
            max="1000"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
            required
          />

          {/* Cost breakdown */}
          <div className={styles.costBreakdown}>
            <span className={styles.labelSecondary}>Total Pembayaran:</span>
            <span className={styles.costValue}>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
              }).format(amount * bankSettings.creditPrice)}
            </span>
          </div>

          {/* Bank Info Details */}
          <div className={styles.bankInfoBlock}>
            <span className={styles.bankHeader}>Informasi Transfer Bank</span>
            <div className={styles.bankDetailsGrid}>
              <span className={styles.labelSecondary}>Bank:</span>
              <span className={styles.bankValueSemi}>{bankSettings.bankName}</span>
              <span className={styles.labelSecondary}>No. Rekening:</span>
              <span className={styles.bankValueBoldMono}>{bankSettings.bankAccountNumber}</span>
              <span className={styles.labelSecondary}>Atas Nama:</span>
              <span className={styles.bankValueSemi}>{bankSettings.bankAccountHolder}</span>
            </div>
            <span className={styles.bankFootnote}>
              *Harap transfer nominal sesuai jumlah di atas lalu unggah struk bukti transfer.
            </span>
          </div>

          {/* Proof File Uploader */}
          <div className={styles.uploadSection}>
            <label className={styles.uploadLabel}>
              Unggah Bukti Transfer
            </label>
            <UploadBox
              uploadType="payments"
              onUploadSuccess={(url) => setProofUrl(url)}
              onUploadError={(err) => toast.error(err)}
              allowedExtensions={[".jpg", ".jpeg", ".png", ".pdf"]}
            />
          </div>

          {/* Actions */}
          <div className={styles.actionsFooter}>
            <Button
              variant="outline"
              onClick={() => setIsBuyModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={!proofUrl}
              className="glow-primary"
            >
              Kirim Konfirmasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
