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
import styles from "./page.module.css";

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
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Ajukan Pengecekan Baru</h1>
        <p className={styles.subtitle}>
          Lengkapi langkah-langkah berikut untuk memulai penapisan plagiasi Turnitin.
        </p>
      </div>

      {/* Progress Wizard Header */}
      <div className={styles.wizardHeader}>
        {[
          { num: 1, label: "Pilih Layanan" },
          { num: 2, label: "Opsi Turnitin" },
          { num: 3, label: "Unggah Berkas" },
          { num: 4, label: "Ringkasan" }
        ].map((item) => (
          <div key={item.num} className={styles.wizardStep}>
            <span className={`${styles.wizardBadge} ${
              step >= item.num ? styles.wizardBadgeActive : styles.wizardBadgeInactive
            }`}>
              {item.num}
            </span>
            <span className={`${styles.wizardLabel} ${
              step >= item.num ? styles.wizardLabelActive : styles.wizardLabelInactive
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: SELECT CHECK TYPE */}
      {step === 1 && (
        <div className={styles.stepWrapper}>
          <h3 className={styles.stepTitle}>Langkah 1: Pilih Jenis Pengecekan</h3>
          
          {loadingTypes ? (
            <Loading />
          ) : checkTypes.length === 0 ? (
            <div className={styles.emptyTypes}>
              Tidak ada jenis pengecekan aktif saat ini.
            </div>
          ) : (
            <div className={styles.typesGrid}>
              {checkTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className={styles.typeCard}
                >
                  <div>
                    <span className={styles.typeBadge}>
                      {type.unitType === "fixed" ? "Tarif Tetap" : "Tarif Fleksibel"}
                    </span>
                    <h4 className={styles.typeName}>{type.name}</h4>
                    <p className={styles.typeDesc}>{type.description}</p>
                  </div>
                  <div className={styles.typeCostRow}>
                    <span className={styles.typeCostVal}>{type.creditCost}</span>
                    <span className={styles.typeCostUnit}>
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
        <div className={styles.stepWrapper}>
          <h3 className={styles.stepTitle}>Langkah 2: Opsi Pengecualian Turnitin</h3>
          
          <div className={styles.panel}>
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

            <div className={styles.exclusionsGrid}>
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
            
            <span className={styles.footnoteText}>
              *Hanya satu batas yang diperbolehkan diisi (Batas Persen ATAU Batas Jumlah Kata). Kosongkan jika ingin memakai setting default Turnitin.
            </span>
          </div>

          <div className={styles.stepFooter}>
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
        <div className={styles.stepWrapper}>
          <h3 className={styles.stepTitle}>Langkah 3: Unggah Dokumen Akademik</h3>

          <div className={styles.panel}>
            <span className={styles.introText}>
              Dokumen akan diproses oleh server eksternal kami secara otomatis. Harap unggah berkas dengan format PDF, DOC, DOCX, atau TXT.
            </span>
            <UploadBox
              uploadType="documents"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(err) => toast.error(err)}
              allowedExtensions={[".pdf", ".doc", ".docx", ".txt"]}
            />
          </div>

          <div className={styles.stepFooter}>
            <Button variant="outline" onClick={() => setStep(2)}>
              Kembali
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: SUMMARY & CONFIRMATION */}
      {step === 4 && selectedType && (
        <div className={styles.stepWrapper}>
          <h3 className={styles.stepTitle}>Langkah 4: Ringkasan Pengajuan</h3>

          <div className={styles.panel}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Jenis Layanan</span>
                <span className={styles.summaryValueBold}>{selectedType.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Dokumen Unggahan</span>
                <span className={styles.summaryValuePrimary}>{fileName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pengecualian Daftar Pustaka</span>
                <span className={styles.summaryValueMedium}>{excludeBibliography ? "Aktif" : "Tidak Aktif"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pengecualian Kutipan</span>
                <span className={styles.summaryValueMedium}>{excludeQuotes ? "Aktif" : "Tidak Aktif"}</span>
              </div>
              {(percentLimit || wordLimit) && (
                <div className={`${styles.summaryItem} ${styles.summaryColSpan2}`}>
                  <span className={styles.summaryLabel}>Filter Limitasi Khusus</span>
                  <span className={styles.summaryValueMedium}>
                    {percentLimit ? `Kecualikan sumber kemiripan < ${percentLimit}%` : `Kecualikan sumber kemiripan < ${wordLimit} kata`}
                  </span>
                </div>
              )}
            </div>

            {/* Credit Cost Block */}
            <div className={styles.costBox}>
              <div className={styles.costDetail}>
                <span className={styles.costDetailLabel}>Biaya Kredit Diperlukan</span>
                <span className={styles.costDetailValBig}>
                  {calculateCreditUsed()} <span className={styles.costUnit}>kredit</span>
                </span>
              </div>
              <div className={styles.costDetailRight}>
                <span className={styles.costDetailLabel}>Saldo Kredit Saya</span>
                <span className={styles.costDetailValSmall}>
                  {user?.credits || 0} <span className={styles.costUnit}>kredit</span>
                </span>
              </div>
            </div>
            
            {((user?.credits || 0) < calculateCreditUsed()) && (
              <div className={styles.insufficientWarning}>
                ⚠️ Kredit tidak mencukupi. Anda membutuhkan {calculateCreditUsed() - (user?.credits || 0)} kredit lagi. Silakan top-up terlebih dahulu.
              </div>
            )}
          </div>

          <div className={styles.stepFooter}>
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
