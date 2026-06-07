"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dbService } from "@/services/dbService";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function UserAccount() {
  const { user, logout } = useAuth();
  const [supportSettings, setSupportSettings] = useState({
    contactWhatsapp: "6281776743211",
    contactEmail: "support@turnitinchecker.com"
  });

  useEffect(() => {
    let unsub = () => { };
    if (user) {
      unsub = dbService.subscribeCollection("settings", (data) => {
        if (data && data.length > 0) {
          const s = data.find(item => item.id === "general") || data[0];
          setSupportSettings({
            contactWhatsapp: s.contactWhatsapp || "6281234567890",
            contactEmail: s.contactEmail || "support@turnitinchecker.com"
          });
        }
      });
    }
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar akun!");
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Akun Pengguna</h1>
        <p className={styles.subtitle}>
          Kelola profil Anda, cek saldo kredit, dan hubungi pusat bantuan kami.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card hoverable={false} className="bg-zinc-900/20">
        <div className={styles.profileCardContent}>
          <UserAvatar
            src={user?.photoURL}
            name={user?.name || "User"}
            size="lg"
            className={styles.avatar}
          />
          <h3 className={styles.profileName}>{user?.name || "Memuat..."}</h3>
          <span className={styles.profileEmail}>{user?.email}</span>

          <div className={styles.roleBadge}>
            Peran: {user?.role === "admin" ? "Super Admin" : "Pengguna Premium"}
          </div>
        </div>
      </Card>

      {/* Credits Info */}
      <Card title="Informasi Saldo Kredit" hoverable={false} className="bg-zinc-900/20">
        <div className={styles.creditsFlex}>
          <div>
            <p className={styles.creditsLabel}>Kredit Tersedia</p>
            <span className={styles.creditsValue}>
              {user?.credits || 0} <span className={styles.creditsUnit}>kredit</span>
            </span>
          </div>
          <Button
            onClick={() => {
              const buyBtn = document.querySelector('button[class*="creditsBuyBtn"]');
              if (buyBtn) (buyBtn as any).click();
            }}
            className={styles.buyBtn}
          >
            Beli Kredit
          </Button>
        </div>
      </Card>

      {/* Support & Admin Help Details */}
      <Card title="Dukungan Pelanggan" hoverable={false} className="bg-zinc-900/20">
        <p className={styles.supportIntro}>
          Mengalami kendala saat melakukan pembayaran, kekurangan kredit, atau kendala pengunduhan laporan? Hubungi administrator kami langsung.
        </p>

        <div className={styles.supportList}>
          {/* WhatsApp Direct Link */}
          <a
            href={`https://wa.me/${supportSettings.contactWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.supportLink} ${styles.supportLinkWhatsapp}`}
          >
            <div className={styles.supportIconWrapper}>
              <span className={`${styles.supportIconBadge} ${styles.badgeWhatsapp}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <div>
                <span className={styles.supportTextTitle}>Hubungi via WhatsApp</span>
                <span className={styles.supportTextDesc}>Respon cepat dalam hitungan menit</span>
              </div>
            </div>
            <svg className={styles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Email Support Link */}
          {/* <a
            href={`mailto:${supportSettings.contactEmail}`}
            className={`${styles.supportLink} ${styles.supportLinkEmail}`}
          >
            <div className={styles.supportIconWrapper}>
              <span className={`${styles.supportIconBadge} ${styles.badgeEmail}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <span className={styles.supportTextTitle}>Hubungi via Email</span>
                <span className={styles.supportTextDesc}>{supportSettings.contactEmail}</span>
              </div>
            </div>
            <svg className={styles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a> */}
        </div>
      </Card>

      <div className={styles.logoutContainer}>
        <Button variant="outline" onClick={handleLogout} className={styles.logoutBtn}>
          Keluar dari Akun
        </Button>
      </div>
    </div>
  );
}
