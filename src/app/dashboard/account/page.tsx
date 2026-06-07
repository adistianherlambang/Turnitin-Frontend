"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dbService } from "@/services/dbService";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import { toast } from "react-hot-toast";

export default function UserAccount() {
  const { user, logout } = useAuth();
  const [supportSettings, setSupportSettings] = useState({
    contactWhatsapp: "6281234567890",
    contactEmail: "support@turnitinchecker.com"
  });

  useEffect(() => {
    let unsub = () => {};
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
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Akun Pengguna</h1>
        <p className="text-xs text-text-secondary mt-1">
          Kelola profil Anda, cek saldo kredit, dan hubungi pusat bantuan kami.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card hoverable={false} className="bg-zinc-900/20 text-center flex flex-col items-center py-8">
        <UserAvatar
          src={user?.photoURL}
          name={user?.name || "User"}
          size="lg"
          className="mb-4 shadow-lg border-2 border-primary/20"
        />
        <h3 className="text-lg font-bold text-white leading-tight">{user?.name || "Memuat..."}</h3>
        <span className="text-xs text-text-secondary mt-1">{user?.email}</span>
        
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
          Peran: {user?.role === "admin" ? "Super Admin" : "Pengguna Premium"}
        </div>
      </Card>

      {/* Credits Info */}
      <Card title="Informasi Saldo Kredit" hoverable={false} className="bg-zinc-900/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary uppercase font-semibold">Kredit Tersedia</p>
            <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
              {user?.credits || 0} <span className="text-sm font-normal text-text-secondary">kredit</span>
            </span>
          </div>
          <Button
            onClick={() => {
              const buyBtn = document.querySelector('button[class*="active:scale-95"]');
              if (buyBtn) (buyBtn as any).click();
            }}
            className="glow-primary text-xs px-4"
          >
            Beli Kredit
          </Button>
        </div>
      </Card>

      {/* Support & Admin Help Details */}
      <Card title="Dukungan Pelanggan" hoverable={false} className="bg-zinc-900/20">
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Mengalami kendala saat melakukan pembayaran, kekurangan kredit, atau kendala pengunduhan laporan? Hubungi administrator kami langsung.
        </p>
        
        <div className="space-y-3">
          {/* WhatsApp Direct Link */}
          <a
            href={`https://wa.me/${supportSettings.contactWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-zinc-900 hover:bg-zinc-850 border border-border hover:border-success/30 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-success/15 border border-success/20 text-success">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <div>
                <span className="block text-xs font-bold text-white">Hubungi via WhatsApp</span>
                <span className="block text-[10px] text-text-secondary mt-0.5">Respon cepat dalam hitungan menit</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Email Support Link */}
          <a
            href={`mailto:${supportSettings.contactEmail}`}
            className="flex items-center justify-between p-3.5 bg-zinc-900 hover:bg-zinc-850 border border-border hover:border-primary/30 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-primary/15 border border-primary/20 text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <span className="block text-xs font-bold text-white">Hubungi via Email</span>
                <span className="block text-[10px] text-text-secondary mt-0.5">{supportSettings.contactEmail}</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </Card>

      <div className="pt-2">
        <Button variant="outline" onClick={handleLogout} className="w-full text-danger border-danger/20 hover:bg-danger/10 py-3 font-bold">
          Keluar dari Akun
        </Button>
      </div>
    </div>
  );
}
