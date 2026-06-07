"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function AdminAccount() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar akun admin!");
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Akun Admin</h1>
        <p className={styles.subtitle}>
          Kelola profil administratif Anda dan keluarlah secara aman.
        </p>
      </div>

      {/* Profile detail */}
      <Card hoverable={false} className="bg-zinc-900/20">
        <div className={styles.profileCardContent}>
          <UserAvatar
            src={user?.photoURL}
            name={user?.name || "Admin"}
            size="lg"
            className={styles.avatar}
          />
          <h3 className={styles.profileName}>{user?.name || "Memuat..."}</h3>
          <span className={styles.profileEmail}>{user?.email}</span>
          
          <div className={styles.roleBadge}>
            Peran: Administrator Portal
          </div>
        </div>
      </Card>

      <div className={styles.logoutContainer}>
        <Button
          variant="outline"
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          Keluar dari Sistem Admin
        </Button>
      </div>
    </div>
  );
}
