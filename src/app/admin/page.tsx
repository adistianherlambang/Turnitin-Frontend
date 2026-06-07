"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/services/dbService";
import StatisticCard from "@/components/Card/StatisticCard";
import Loading from "@/components/Loading/Loading";
import Table from "@/components/Table/Table";
import StatusBadge from "@/components/Badge/StatusBadge";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Simulated monthly metrics
const MONTHLY_SUBMISSIONS_DATA = [
  { name: "Jan", total: 45 },
  { name: "Feb", total: 80 },
  { name: "Mar", total: 120 },
  { name: "Apr", total: 95 },
  { name: "May", total: 155 },
  { name: "Jun", total: 220 }
];

const MONTHLY_REVENUE_DATA = [
  { name: "Jan", revenue: 225000 },
  { name: "Feb", revenue: 400000 },
  { name: "Mar", revenue: 600000 },
  { name: "Apr", revenue: 475000 },
  { name: "May", revenue: 775000 },
  { name: "Jun", revenue: 1100000 }
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Combine listeners to populate admin metrics
    const unsubUsers = dbService.subscribeCollection("users", setUsers);
    const unsubPayments = dbService.subscribeCollection("payments", setPayments);
    const unsubSubmissions = dbService.subscribeCollection("submissions", setSubmissions);

    // Turn off loader once listeners initialize
    const timer = setTimeout(() => setLoading(false), 800);

    return () => {
      unsubUsers();
      unsubPayments();
      unsubSubmissions();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Count calculations
  const totalUsersCount = users.filter(u => u.role !== "admin").length;
  const totalSubmissionsCount = submissions.length;
  const pendingPaymentsCount = payments.filter(p => p.status === "pending").length;
  const processingChecksCount = submissions.filter(s => s.status === "processing").length;
  const completedChecksCount = submissions.filter(s => s.status === "completed").length;
  const rejectedChecksCount = submissions.filter(s => s.status === "rejected").length;

  const totalCreditsSold = payments
    .filter(p => p.status === "approved")
    .reduce((sum, p) => sum + p.credits, 0);

  const estimatedRevenue = payments
    .filter(p => p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const getRecentSubmissions = () => {
    return [...submissions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard Admin</h1>
        <p className="text-xs text-text-secondary mt-1">
          Pantau kesehatan platform, verifikasi pembayaran kredit, dan kelola draf naskah plagiarisme.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Pengguna"
          value={totalUsersCount}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          trend="+8% dari bulan lalu"
          trendDirection="up"
        />
        <StatisticCard
          title="Total Pengajuan"
          value={totalSubmissionsCount}
          icon={
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          trend="+15% pertumbuhan cek"
          trendDirection="up"
        />
        <StatisticCard
          title="Menunggu Verifikasi"
          value={pendingPaymentsCount}
          icon={
            <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="Pembayaran top-up pending"
          trendDirection="neutral"
        />
        <StatisticCard
          title="Kredit Terjual"
          value={`${totalCreditsSold} Pcs`}
          icon={
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          trend={formatCurrency(estimatedRevenue)}
          trendDirection="up"
        />
      </div>

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions Chart */}
        <div className="p-6 bg-zinc-900/40 border border-border rounded-2xl">
          <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">Statistik Pengajuan Bulanan</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SUBMISSIONS_DATA}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} />
                <YAxis stroke="#A1A1AA" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181B", border: "1px solid #27272A" }} />
                <Area type="monotone" dataKey="total" stroke="#2563EB" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="p-6 bg-zinc-900/40 border border-border rounded-2xl">
          <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">Estimasi Pendapatan Bulanan (IDR)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} />
                <YAxis stroke="#A1A1AA" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181B", border: "1px solid #27272A" }} formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent submissions lists */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-white tracking-wide uppercase">Daftar Pengajuan Terbaru</h4>
          <Link href="/admin/submissions" className="text-xs text-primary hover:underline">
            Kelola Semua Pengajuan
          </Link>
        </div>

        {getRecentSubmissions().length === 0 ? (
          <div className="p-8 text-center text-text-secondary bg-zinc-900/10 border border-border rounded-2xl">
            Belum ada berkas cek yang diajukan oleh pengguna.
          </div>
        ) : (
          <Table headers={["ID Pengajuan", "Layanan", "Status", "Tanggal Cek", "Aksi"]}>
            {getRecentSubmissions().map((sub) => (
              <tr key={sub.id} className="hover:bg-zinc-900/30">
                <td className="font-mono text-xs text-zinc-300">{sub.submissionId}</td>
                <td className="text-xs text-white max-w-[180px] truncate">{sub.checkTypeName}</td>
                <td>
                  <StatusBadge status={sub.status} />
                </td>
                <td className="text-xs text-text-secondary font-mono">
                  {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td>
                  <Link
                    href="/admin/submissions"
                    className="text-xs font-semibold text-primary hover:text-blue-400"
                  >
                    Tinjau
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
