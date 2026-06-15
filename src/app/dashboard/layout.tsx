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
    contactWhatsapp: "6281776743211"
  });

  // Check storage limits
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const res = await fetch(`/api/r2/storage`);
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
    setSubmitting(true);
    try {
      const paymentId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
      const totalCost = amount * bankSettings.creditPrice;

      await dbService.addDocument("payments", {
        paymentId,
        userId: user.uid || user.id,
        amount: totalCost,
        credits: Number(amount),
        proofFile: proofUrl || "",
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
    
    let proofProxyUrl = "";
    if (proofUrl) {
      try {
        const urlObj = new URL(proofUrl);
        const key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
        proofProxyUrl = `${window.location.origin}/api/r2/view/${key}`;
      } catch (err) {
        proofProxyUrl = proofUrl;
      }
    }

    const proofLine = proofProxyUrl ? `\nBukti Transfer: ${proofProxyUrl}` : "\n*(Catatan: Saya melampirkan foto bukti transfer secara manual di chat ini)*";
    const message = `Halo Admin, saya ingin konfirmasi pembayaran kredit Turnitin.\n\nID Pembayaran: ${paymentSuccessInfo.id}\nJumlah Kredit: ${paymentSuccessInfo.credits} Kredit\nTotal: ${formatted}${proofLine}\n\nMohon segera diproses. Terima kasih.`;
    return `https://wa.me/${bankSettings.contactWhatsapp}?text=${encodeURIComponent(message)}`;
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
              {proofUrl 
                ? "Permintaan top-up Anda telah masuk antrean sistem. Harap konfirmasi manual ke admin melalui WhatsApp agar diproses segera."
                : "Permintaan top-up Anda telah masuk antrean sistem. Harap klik tombol di bawah untuk konfirmasi ke WhatsApp dan kirim/lampirkan foto bukti transfer secara manual."}
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 2.91005C16.0831 1.98416 14.991 1.25002 13.7875 0.750416C12.584 0.250812 11.2931 -0.00426317 9.99 5.38951e-05C4.53 5.38951e-05 0.0800002 4.45005 0.0800002 9.91005C0.0800002 11.6601 0.54 13.3601 1.4 14.8601L0 20.0001L5.25 18.6201C6.7 19.4101 8.33 19.8301 9.99 19.8301C15.45 19.8301 19.9 15.3801 19.9 9.92005C19.9 7.27005 18.87 4.78005 17 2.91005ZM9.99 18.1501C8.51 18.1501 7.06 17.7501 5.79 17.0001L5.49 16.8201L2.37 17.6401L3.2 14.6001L3 14.2901C2.17755 12.9771 1.74092 11.4593 1.74 9.91005C1.74 5.37005 5.44 1.67005 9.98 1.67005C12.18 1.67005 14.25 2.53005 15.8 4.09005C16.5676 4.85392 17.1759 5.7626 17.5896 6.76338C18.0033 7.76417 18.2142 8.83714 18.21 9.92005C18.23 14.4601 14.53 18.1501 9.99 18.1501ZM14.51 11.9901C14.26 11.8701 13.04 11.2701 12.82 11.1801C12.59 11.1001 12.43 11.0601 12.26 11.3001C12.09 11.5501 11.62 12.1101 11.48 12.2701C11.34 12.4401 11.19 12.4601 10.94 12.3301C10.69 12.2101 9.89 11.9401 8.95 11.1001C8.21 10.4401 7.72 9.63005 7.57 9.38005C7.43 9.13005 7.55 9.00005 7.68 8.87005C7.79 8.76005 7.93 8.58005 8.05 8.44005C8.17 8.30005 8.22 8.19005 8.3 8.03005C8.38 7.86005 8.34 7.72005 8.28 7.60005C8.22 7.48005 7.72 6.26005 7.52 5.76005C7.32 5.28005 7.11 5.34005 6.96 5.33005H6.48C6.31 5.33005 6.05 5.39005 5.82 5.64005C5.6 5.89005 4.96 6.49005 4.96 7.71005C4.96 8.93005 5.85 10.1101 5.97 10.2701C6.09 10.4401 7.72 12.9401 10.2 14.0101C10.79 14.2701 11.25 14.4201 11.61 14.5301C12.2 14.7201 12.74 14.6901 13.17 14.6301C13.65 14.5601 14.64 14.0301 14.84 13.4501C15.05 12.8701 15.05 12.3801 14.98 12.2701C14.91 12.1601 14.76 12.1101 14.51 11.9901Z" fill="white" />
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
                Unggah Bukti Transfer <span style={{ fontWeight: 'normal', opacity: 0.7 }}>(Opsional)</span>
              </label>
              <UploadBox
                uploadType="payments"
                onUploadSuccess={(url) => setProofUrl(url)}
                onUploadError={(err) => toast.error(err)}
                allowedExtensions={[".jpg", ".jpeg", ".png", ".pdf"]}
                disabled={storageFull}
              />
              <p className={styles.uploadTip}>
                *Jika menemui error saat mengunggah (seperti kendala sertifikat/jaringan), Anda dapat melewati upload di sini dan mengirimkan gambar bukti transfer Anda secara manual di WhatsApp Admin setelah menekan tombol di bawah.
              </p>
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
                disabled={storageFull}
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
