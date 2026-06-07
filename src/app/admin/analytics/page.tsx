"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/services/dbService";
import Loading from "@/components/Loading/Loading";
import Table from "@/components/Table/Table";
import styles from "./page.module.css";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Pre-seeded charts data
const REVENUE_ANALYTICS = [
  { month: "Jan", revenue: 225000 },
  { month: "Feb", revenue: 400000 },
  { month: "Mar", revenue: 600000 },
  { month: "Apr", revenue: 475000 },
  { month: "May", revenue: 775000 },
  { month: "Jun", revenue: 1100000 }
];

const CHECK_TYPES_POPULARITY = [
  { name: "No-Repository", value: 65, color: "#2563EB" },
  { name: "Repository", value: 25, color: "#22C55E" },
  { name: "Premium (Per Word)", value: 10, color: "#F59E0B" }
];

const USER_GROWTH = [
  { week: "Mgu 1", users: 12 },
  { week: "Mgu 2", users: 28 },
  { week: "Mgu 3", users: 45 },
  { week: "Mgu 4", users: 78 }
];

export default function AdminAnalytics() {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = dbService.subscribeCollection("users", setUsers);
    const unsubPayments = dbService.subscribeCollection("payments", setPayments);
    const unsubSub = dbService.subscribeCollection("submissions", setSubmissions);

    const timer = setTimeout(() => setLoading(false), 500);

    return () => {
      unsubUsers();
      unsubPayments();
      unsubSub();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Calculate top credit buyers
  const getTopBuyers = () => {
    // Group payments by userId
    const userSpending: Record<string, number> = {};
    payments
      .filter(p => p.status === "approved")
      .forEach(p => {
        userSpending[p.userId] = (userSpending[p.userId] || 0) + p.amount;
      });

    return Object.entries(userSpending)
      .map(([userId, totalAmount]) => {
        const u = users.find(user => user.id === userId);
        return {
          id: userId,
          name: u?.name || "User N/A",
          email: u?.email || "N/A",
          amount: totalAmount,
          creditsBought: totalAmount / 5000 // default price
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <div>
        <h1 className={styles.title}>Analitik Platform</h1>
        <p className={styles.subtitle}>
          Analisis performa finansial, pertumbuhan registrasi pengguna baru, dan statistik jenis pengecekan terpopuler.
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Revenue Area Chart */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Total Pendapatan Terakumulasi</h4>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_ANALYTICS}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" stroke="#A1A1AA" fontSize={11} />
                <YAxis stroke="#A1A1AA" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181B", border: "1px solid #27272A" }} formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Pertumbuhan Pendaftaran User Mingguan</h4>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={USER_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="week" stroke="#A1A1AA" fontSize={11} />
                <YAxis stroke="#A1A1AA" fontSize={11} />
                <Tooltip contentStyle={{ background: "#18181B", border: "1px solid #27272A" }} />
                <Bar dataKey="users" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular check types Pie chart */}
        <div className={styles.chartCardFlex}>
          <h4 className={styles.chartTitle}>Layanan Cek Terpopuler (%)</h4>
          <div className={styles.pieFlexContainer}>
            <div className={styles.pieChartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CHECK_TYPES_POPULARITY}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CHECK_TYPES_POPULARITY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className={styles.legendList}>
              {CHECK_TYPES_POPULARITY.map((item, index) => (
                <div key={index} className={styles.legendItem}>
                  <span className={styles.legendColorDot} style={{ backgroundColor: item.color }}></span>
                  <span className={styles.textMuted}>{item.name}:</span>
                  <span className={styles.legendValue}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top credit buyers table list */}
        <div className={styles.tableCard}>
          <h4 className={styles.chartTitle}>Daftar Top User (Pembelian Kredit Terbanyak)</h4>
          {getTopBuyers().length === 0 ? (
            <div className={styles.emptyTableText}>
              Belum ada transaksi pembelian kredit disetujui.
            </div>
          ) : (
            <Table headers={["Nama Pengguna", "Kredit Dibeli", "Total Transaksi"]}>
              {getTopBuyers().map((buyer) => (
                <tr key={buyer.id} className={styles.tableRow}>
                  <td className={styles.buyerCell}>
                    <span className={styles.buyerName}>{buyer.name}</span>
                    <span className={styles.buyerEmail}>{buyer.email}</span>
                  </td>
                  <td className={styles.fontMono}>{buyer.creditsBought} kredit</td>
                  <td className={styles.amountText}>{formatCurrency(buyer.amount)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
