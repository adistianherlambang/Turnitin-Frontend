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
  const [storageFull, setStorageFull] = useState(false);
  const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{ id: string; amount: number; credits: number } | null>(null);
  const [bankSettings, setBankSettings] = useState({
    bankName: "Bank Central Asia (BCA)",
    bankAccountNumber: "8029381029",
    bankAccountHolder: "PT Turnitin Indonesia Group",
    creditPrice: 5000,
    contactWhatsapp: "6281234567890"
  });

  // Check storage limits
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_STORAGE_SERVER || "http://localhost:5001"}/api/storage`);
        const data = await res.json();
        if (data && data.success) {
          setStorageFull(data.storage.isFull);
        }
      } catch (err) {
        console.error("Gagal memeriksa penyimpanan:", err);
      }
    };
    if (isBuyModalOpen) {
      checkStorage();
    }
  }, [isBuyModalOpen]);

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
      }, paymentId);

      setPaymentSuccessInfo({
        id: paymentId,
        amount: totalCost,
        credits: Number(amount)
      });
      toast.success("Permintaan top-up berhasil diajukan!");
    } catch (err: any) {
      toast.error("Gagal mengajukan pembayaran: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount(5);
    setProofUrl("");
    setPaymentSuccessInfo(null);
  };

  const handleCloseSuccess = () => {
    setIsBuyModalOpen(false);
    resetForm();
  };

  const getFormattedAmount = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const getWhatsappUrl = () => {
    if (!paymentSuccessInfo) return "";
    const formatted = getFormattedAmount(paymentSuccessInfo.amount);
    const message = `Halo Admin, saya ingin konfirmasi pembayaran kredit Turnitin dengan ID: ${paymentSuccessInfo.id} sebesar ${formatted}. Mohon segera diproses. Terima kasih.`;
    return `https://wa.me/${bankSettings.contactWhatsapp || "6281234567890"}?text=${encodeURIComponent(message)}`;
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
        onClose={handleCloseSuccess}
        title={paymentSuccessInfo ? "Pembayaran Terkirim" : "Beli Kredit Baru"}
        size="md"
      >
        {paymentSuccessInfo ? (
          <div className={styles.successScreen}>
            <div className={styles.successIconWrapper}>
              <svg className={styles.successIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className={styles.successTitle}>Konfirmasi Pembayaran</h3>
            <p className={styles.successText}>
              Permintaan top-up Anda telah masuk antrean sistem. Harap konfirmasi manual ke admin melalui WhatsApp agar diproses segera.
            </p>

            <div className={styles.receiptBox}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>ID Pembayaran:</span>
                <div className={styles.paymentIdWrapper}>
                  <span className={styles.paymentIdText}>{paymentSuccessInfo.id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentSuccessInfo.id);
                      toast.success("ID Pembayaran disalin ke clipboard!");
                    }}
                    className={styles.copyBtn}
                    title="Salin ID"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Jumlah Kredit:</span>
                <span className={styles.receiptValueBold}>{paymentSuccessInfo.credits} Kredit</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Total Pembayaran:</span>
                <span className={styles.receiptValueEmerald}>
                  {getFormattedAmount(paymentSuccessInfo.amount)}
                </span>
              </div>
            </div>

            <div className={styles.successActions}>
              <a
                href={getWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <svg className={styles.whatsappIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 2.8 1.4 4.8 1.4 5.3 0 9.7-4.3 9.7-9.7 0-5.3-4.3-9.7-9.7-9.7C6.07 1.154 1.87 5.454 1.87 10.754c0 2 .5 3.3 1.4 4.8l-1 3.6 3.7-1z" />
                </svg>
                Konfirmasi via WhatsApp
              </a>

              <Button variant="outline" onClick={handleCloseSuccess} className={styles.fullWidthBtn}>
                Selesai & Tutup
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBuySubmit} className={styles.form}>
            {storageFull && (
              <div className={styles.storageFullWarning}>
                ⚠️ <strong>Penyimpanan Server Penuh.</strong> Untuk sementara Anda tidak dapat melakukan pembelian kredit baru karena tidak dapat mengunggah bukti transfer.
              </div>
            )}

          <Input
            label="Jumlah Kredit"
            type="number"
            min="1"
            max="1000"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
            required
            disabled={storageFull}
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
              disabled={storageFull}
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
              disabled={!proofUrl || storageFull}
              className="glow-primary"
            >
              Kirim Konfirmasi
            </Button>
          </div>
        </form>
      )}
      </Modal>
    </div>
  );
}
