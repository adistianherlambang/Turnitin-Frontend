"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar/Sidebar";
import Loading from "@/components/Loading/Loading";
import styles from "./layout.module.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <Loading fullPage={true} />;
  }

  return (
    <div className={styles.container}>
      {/* Admin Sidebar Navigation */}
      <Sidebar />

      {/* Main Admin Content Pane */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
