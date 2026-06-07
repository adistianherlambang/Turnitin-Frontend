"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import { toast } from "react-hot-toast";

export default function AdminAccount() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar akun admin!");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Akun Admin</h1>
        <p className="text-xs text-text-secondary mt-1">
          Kelola profil administratif Anda dan keluarlah secara aman.
        </p>
      </div>

      {/* Profile detail */}
      <Card hoverable={false} className="bg-zinc-900/20 text-center flex flex-col items-center py-8">
        <UserAvatar
          src={user?.photoURL}
          name={user?.name || "Admin"}
          size="lg"
          className="mb-4 shadow-lg border-2 border-primary/20"
        />
        <h3 className="text-lg font-bold text-white leading-tight">{user?.name || "Memuat..."}</h3>
        <span className="text-xs text-text-secondary mt-1">{user?.email}</span>
        
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
          Peran: Administrator Portal
        </div>
      </Card>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full text-danger border-danger/20 hover:bg-danger/10 py-3.5 font-bold"
        >
          Keluar dari Sistem Admin
        </Button>
      </div>
    </div>
  );
}
