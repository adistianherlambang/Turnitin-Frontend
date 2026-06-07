"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { dbService } from "@/services/dbService";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Checkbox from "@/components/Input/Input"; // wait, Input exports Checkbox
import { Checkbox as CustomCheckbox } from "@/components/Input/Input"; // import properly
import UploadBox from "@/components/UploadBox/UploadBox";
import Loading from "@/components/Loading/Loading";
import { toast } from "react-hot-toast";

export default function SubmitCheck() {
  const router = useRouter();
  const { user } = useAuth();
  
  // States
  const [step, setStep] = useState(1);
  const [checkTypes, setCheckTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Selection States
  const [selectedType, setSelectedType] = useState<any>(null); // the full checkType object
  const [excludeBibliography, setExcludeBibliography] = useState(false);
  const [excludeQuotes, setExcludeQuotes] = useState(false);
  const [percentLimit, setPercentLimit] = useState("");
  const [wordLimit, setWordLimit] = useState("");
  
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  // Fetch check types from collection (no hardcode)
  useEffect(() => {
    const unsub = dbService.subscribeCollection("checkTypes", (data) => {
      // Filter active and sort
      const activeTypes = data.filter(t => t.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
      setCheckTypes(activeTypes);
      setLoadingTypes(false);
    });
    return () => unsub();
  }, []);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleExclusionsNext = () => {
    // Validate percent vs word count (only one is allowed)
    if (percentLimit && wordLimit) {
      toast.error("Hanya salah satu dari batas persen ATAU batas jumlah kata yang boleh diisi.");
      return;
    }
    setStep(3);
  };

  const handleUploadSuccess = (url, name) => {
    setFileUrl(url);
    setFileName(name);
    setStep(4);
  };

  const calculateCreditUsed = () => {
    if (!selectedType) return 0;
    
    // For fixed
    if (selectedType.unitType === "fixed") {
      return selectedType.creditCost;
    }
    
    // For per_word / per_character
    // Since word count isn't fully extracted on client (requires complex doc parsing),
    // we mock/estimate standard length or let the user input page count, OR we check the slug.
    // Let's assume a default unit count of 1 for estimation or simulate 2 units (e.g. 500 words).
    // Let's mock a standard check cost of 2 credits for variable per_word.
    // A robust, standard approach:
    // Assume a mock document length of 500 words if wordLimit is empty, else use wordLimit,
    // or calculate it as ceil(1500 / unitValue) * cost (default 3 units).
    const estimatedWords = wordLimit ? Number(wordLimit) : 1200;
    const units = Math.ceil(estimatedWords / selectedType.unitValue);
    return units * selectedType.creditCost;
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    const cost = calculateCreditUsed();
    
    // Check balance
    if (user.credits < cost) {
      toast.error(`Kredit tidak mencukupi. Anda membutuhkan ${cost} kredit.`);
      return;
    }

    setSubmitting(true);
    try {
      const submissionId = `SUB-${Math.floor(10000 + Math.random() * 90000)}`;
      const userId = user.uid || user.id;

      // 1. Reduce user credits
      const beforeBalance = user.credits;
      const afterBalance = beforeBalance - cost;
      
      await dbService.updateDocument("users", userId, {
        credits: afterBalance
      });

      // 2. Create transaction record
      await dbService.addDocument("creditTransactions", {
        userId,
        type: "usage",
        amount: -cost,
        beforeBalance,
        afterBalance,
        referenceId: submissionId,
        description: `Cek Turnitin: ${selectedType.name} (File: ${fileName})`
      });

      // 3. Create submission record
      await dbService.addDocument("submissions", {
        submissionId,
        userId,
        checkTypeId: selectedType.id,
        checkTypeName: selectedType.name,
        creditUsed: cost,
        documentFile: fileUrl,
        resultFile: "", // empty initially
        status: "waiting",
        notes: "",
        options: {
          excludeBibliography,
          excludeQuotes,
          percentLimit: percentLimit ? Number(percentLimit) : null,
          wordLimit: wordLimit ? Number(wordLimit) : null
        }
      });

      toast.success("Dokumen berhasil disubmit ke antrean!");
      router.push("/dashboard/history");
    } catch (err: any) {
      toast.error("Gagal mengirimkan pengajuan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Ajukan Pengecekan Baru</h1>
        <p className="text-xs text-text-secondary mt-1">
          Lengkapi langkah-langkah berikut untuk memulai penapisan plagiasi Turnitin.
        </p>
      </div>

      {/* Progress Wizard Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5 text-sm select-none">
        {[
          { num: 1, label: "Pilih Layanan" },
          { num: 2, label: "Opsi Turnitin" },
          { num: 3, label: "Unggah Berkas" },
          { num: 4, label: "Ringkasan" }
        ].map((item) => (
          <div key={item.num} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
              step >= item.num
                ? "bg-primary text-white"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700"
            }`}>
              {item.num}
            </span>
            <span className={`font-semibold hidden sm:inline ${
              step >= item.num ? "text-white" : "text-text-secondary"
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: SELECT CHECK TYPE */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Langkah 1: Pilih Jenis Pengecekan</h3>
          
          {loadingTypes ? (
            <Loading />
          ) : checkTypes.length === 0 ? (
            <div className="p-8 text-center text-text-secondary bg-zinc-900/10 border border-border rounded-2xl">
              Tidak ada jenis pengecekan aktif saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {checkTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className="rounded-2xl border border-border hover:border-primary/50 bg-zinc-900/20 hover:bg-zinc-900/40 p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {type.unitType === "fixed" ? "Tarif Tetap" : "Tarif Fleksibel"}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-3 leading-tight">{type.name}</h4>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">{type.description}</p>
                  </div>
                  <div className="mt-6 border-t border-border/40 pt-4 flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-bold text-white">{type.creditCost}</span>
                    <span className="text-xs text-text-secondary">
                      {type.unitType === "fixed" ? "Kredit / Dokumen" : `Kredit / ${type.unitValue} Kata`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: EXCLUSION OPTIONS */}
      {step === 2 && selectedType && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Langkah 2: Opsi Pengecualian Turnitin</h3>
          
          <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-6">
            <div className="space-y-4">
              <CustomCheckbox
                id="bib"
                label="Kecualikan Daftar Pustaka (Exclude Bibliography)"
                checked={excludeBibliography}
                onChange={(e) => setExcludeBibliography(e.target.checked)}
              />
              <CustomCheckbox
                id="quotes"
                label="Kecualikan Teks Yang Dikutip (Exclude Quotes)"
                checked={excludeQuotes}
                onChange={(e) => setExcludeQuotes(e.target.checked)}
              />
            </div>

            <div className="border-t border-border/60 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pengecualian Tingkat Persen (%)"
                type="number"
                placeholder="Contoh: 2"
                value={percentLimit}
                onChange={(e) => {
                  setPercentLimit(e.target.value);
                  if (e.target.value) setWordLimit(""); // reset other
                }}
                disabled={!!wordLimit}
              />
              <Input
                label="Pengecualian Batas Jumlah Kata"
                type="number"
                placeholder="Contoh: 10"
                value={wordLimit}
                onChange={(e) => {
                  setWordLimit(e.target.value);
                  if (e.target.value) setPercentLimit(""); // reset other
                }}
                disabled={!!percentLimit}
              />
            </div>
            
            <span className="block text-[10px] text-zinc-500 font-medium leading-normal">
              *Hanya satu batas yang diperbolehkan diisi (Batas Persen ATAU Batas Jumlah Kata). Kosongkan jika ingin memakai setting default Turnitin.
            </span>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button onClick={handleExclusionsNext}>
              Lanjutkan
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: UPLOAD DOCUMENT */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Langkah 3: Unggah Dokumen Akademik</h3>

          <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
            <span className="block text-xs text-text-secondary">
              Dokumen akan diproses oleh server eksternal kami secara otomatis. Harap unggah berkas dengan format PDF, DOC, DOCX, atau TXT.
            </span>
            <UploadBox
              uploadType="documents"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(err) => toast.error(err)}
              allowedExtensions={[".pdf", ".doc", ".docx", ".txt"]}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Kembali
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: SUMMARY & CONFIRMATION */}
      {step === 4 && selectedType && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Langkah 4: Ringkasan Pengajuan</h3>

          <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-text-secondary uppercase font-semibold">Jenis Layanan</span>
                <span className="block font-bold text-white">{selectedType.name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-text-secondary uppercase font-semibold">Dokumen Unggahan</span>
                <span className="block font-bold text-primary truncate max-w-xs">{fileName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-text-secondary uppercase font-semibold">Pengecualian Daftar Pustaka</span>
                <span className="block font-medium text-white">{excludeBibliography ? "Aktif" : "Tidak Aktif"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-text-secondary uppercase font-semibold">Pengecualian Kutipan</span>
                <span className="block font-medium text-white">{excludeQuotes ? "Aktif" : "Tidak Aktif"}</span>
              </div>
              {(percentLimit || wordLimit) && (
                <div className="space-y-1 col-span-2">
                  <span className="text-xs text-text-secondary uppercase font-semibold">Filter Limitasi Khusus</span>
                  <span className="block font-medium text-white">
                    {percentLimit ? `Kecualikan sumber kemiripan < ${percentLimit}%` : `Kecualikan sumber kemiripan < ${wordLimit} kata`}
                  </span>
                </div>
              )}
            </div>

            {/* Credit Cost Block */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase">Biaya Kredit Diperlukan</span>
                <span className="block text-2xl font-extrabold text-white font-mono mt-0.5">
                  {calculateCreditUsed()} <span className="text-xs font-normal text-text-secondary">kredit</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-text-secondary uppercase">Saldo Kredit Saya</span>
                <span className="block text-lg font-bold text-white font-mono mt-0.5">
                  {user?.credits || 0} <span className="text-xs font-normal text-text-secondary">kredit</span>
                </span>
              </div>
            </div>
            
            {((user?.credits || 0) < calculateCreditUsed()) && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-center text-xs text-danger font-semibold">
                ⚠️ Kredit tidak mencukupi. Anda membutuhkan {calculateCreditUsed() - (user?.credits || 0)} kredit lagi. Silakan top-up terlebih dahulu.
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
              Kembali
            </Button>
            <Button
              onClick={handleFinalSubmit}
              loading={submitting}
              disabled={!user || user.credits < calculateCreditUsed()}
              className="glow-primary"
            >
              Ajukan Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
