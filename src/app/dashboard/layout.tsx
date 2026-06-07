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
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md p-8 rounded-2xl border border-danger/30 bg-danger/5 space-y-4">
          <h2 className="text-xl font-bold text-danger">Akun Ditangguhkan</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
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
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar onBuyCreditsClick={() => setIsBuyModalOpen(true)} />

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Global Topup Credit Modal */}
      <Modal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title="Beli Kredit Baru"
        size="md"
      >
        <form onSubmit={handleBuySubmit} className="space-y-5">
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
          <div className="p-4 bg-zinc-900 border border-border/80 rounded-xl flex items-center justify-between text-sm">
            <span className="text-text-secondary">Total Pembayaran:</span>
            <span className="font-bold text-emerald-400 font-mono text-base">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
              }).format(amount * bankSettings.creditPrice)}
            </span>
          </div>

          {/* Bank Info Details */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-2">
            <span className="block font-bold text-white uppercase tracking-wider">Informasi Transfer Bank</span>
            <div className="grid grid-cols-3 gap-y-1">
              <span className="text-text-secondary">Bank:</span>
              <span className="col-span-2 font-semibold text-white">{bankSettings.bankName}</span>
              <span className="text-text-secondary">No. Rekening:</span>
              <span className="col-span-2 font-bold text-white font-mono">{bankSettings.bankAccountNumber}</span>
              <span className="text-text-secondary">Atas Nama:</span>
              <span className="col-span-2 font-semibold text-white">{bankSettings.bankAccountHolder}</span>
            </div>
            <span className="block text-zinc-500 font-medium mt-1 leading-normal">
              *Harap transfer nominal sesuai jumlah di atas lalu unggah struk bukti transfer.
            </span>
          </div>

          {/* Proof File Uploader */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wide">
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
          <div className="flex justify-end gap-3 pt-2">
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
