"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 border-b border-border/40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))]">
        {/* Glow grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            ✨ Cek Plagiasi Turnitin Berbasis AI Tercepat
          </div>
          
          <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Cek Plagiasi Dokumen Anda Dengan{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-primary to-indigo-500 font-sans tracking-wide">
              Turnitin Resmi & Aman
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary leading-relaxed">
            Layanan penapisan orisinalitas karya ilmiah tercepat di Indonesia. Dapatkan sertifikat tingkat kemiripan resmi hanya dalam 5-15 menit. 100% Aman & No-Repository.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register"}>
              <Button size="lg" className="glow-primary">
                Cek Dokumen Sekarang
              </Button>
            </Link>
            <a href="#fitur">
              <Button size="lg" variant="outline">
                Pelajari Selengkapnya
              </Button>
            </a>
          </div>

          {/* Social Proof Numbers */}
          <div className="mt-16 pt-8 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div>
              <span className="block text-3xl font-extrabold text-white font-mono">10,000+</span>
              <span className="text-xs text-text-secondary mt-1">Dokumen Dicek</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-white font-mono">5 - 15m</span>
              <span className="text-xs text-text-secondary mt-1">Rata-rata Proses</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-white font-mono">100%</span>
              <span className="text-xs text-text-secondary mt-1">No-Repository Aman</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-white font-mono">4.9/5</span>
              <span className="text-xs text-text-secondary mt-1">Rating Akademisi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Mengapa Memilih Kami?</h2>
            <p className="text-text-secondary mt-4 leading-relaxed">
              Kami mengutamakan kualitas, kecepatan proses, dan keamanan kerahasiaan dokumen Anda di atas segalanya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card
              title="100% No-Repository"
              subtitle="Dokumen Aman & Tidak Tersimpan"
              hoverable={true}
              className="bg-zinc-900/20"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">
                Kami menjamin draf naskah, skripsi, tesis, atau jurnal Anda tidak akan terindeks database institusi nasional maupun internasional, sehingga Anda dapat mengecek kembali di kampus tanpa takut terdeteksi self-plagiarism.
              </p>
            </Card>

            <Card
              title="Proses Cepat & Otomatis"
              subtitle="Hanya 5 - 15 Menit"
              hoverable={true}
              className="bg-zinc-900/20"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">
                Naskah yang diajukan langsung diproses secara terjadwal. Begitu selesai, laporan hasil PDF resmi dapat langsung diunduh secara realtime di dashboard akun Anda tanpa repot.
              </p>
            </Card>

            <Card
              title="Biaya Fleksibel"
              subtitle="Sistem Kredit Hemat"
              hoverable={true}
              className="bg-zinc-900/20"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">
                Gunakan kredit sesuai dengan jenis kebutuhan Anda. 1 Kredit setara dengan Rp 5.000. Tersedia pilihan Cek Paket (Fixed) maupun fleksibel hitung per-kata untuk dokumen berukuran ringkas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-20 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Langkah Mudah Pengecekan</h2>
            <p className="text-text-secondary mt-4">
              Cek keaslian dokumen akademik Anda hanya dalam 4 tahapan ringkas berikut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Daftar Akun",
                desc: "Buat akun Anda secara gratis menggunakan Email atau Login Cepat Google."
              },
              {
                step: "02",
                title: "Top-Up Kredit",
                desc: "Isi saldo kredit akun Anda via transfer bank BCA. 1 Kredit = Rp 5.000."
              },
              {
                step: "03",
                title: "Ajukan Cek",
                desc: "Pilih jenis layanan, masukkan pengecualian jika ada, lalu unggah dokumen."
              },
              {
                step: "04",
                title: "Unduh Hasil",
                desc: "Admin memproses berkas, dan laporan resmi PDF Turnitin siap diunduh di dashboard."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group text-center md:text-left">
                <div className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors font-mono tracking-tight leading-none mb-4">
                  {item.step}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-zinc-950 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Tarif Kredit Terjangkau</h2>
            <p className="text-text-secondary mt-4 leading-relaxed">
              Dapatkan hasil cek resmi Turnitin dengan biaya yang transparan tanpa biaya langganan bulanan yang mahal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Standard Package */}
            <div className="rounded-2xl border border-border bg-zinc-900/25 p-8 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">Paket Coba-Coba</h4>
                <p className="text-xs text-text-secondary mt-2">Untuk mahasiswa yang baru pertama kali mencoba pengecekan.</p>
                <div className="mt-6 flex items-baseline gap-1.5 font-mono">
                  <span className="text-3xl font-extrabold text-white">Rp 25.000</span>
                  <span className="text-xs text-text-secondary">/ 5 Kredit</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    2x Cek Turnitin No-Repository
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Proses 5 - 15 Menit
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Masa Aktif Kredit Selamanya
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8">
                <Button variant="outline" className="w-full">Pilih Paket</Button>
              </Link>
            </div>

            {/* Recommended Package */}
            <div className="rounded-2xl border-2 border-primary bg-zinc-900/60 p-8 flex flex-col justify-between glow-primary relative transform scale-105">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider text-white">
                Terpopuler
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">Paket Skripsi / Tesis</h4>
                <p className="text-xs text-blue-200 mt-2">Paling cocok untuk mahasiswa semester akhir yang sedang menyusun draf akhir.</p>
                <div className="mt-6 flex items-baseline gap-1.5 font-mono">
                  <span className="text-3xl font-extrabold text-white">Rp 75.000</span>
                  <span className="text-xs text-blue-200">/ 15 Kredit</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-zinc-200">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    7x Cek Turnitin No-Repository
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Bebas Atur Opsi Pengecualian
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Laporan PDF Resmi Full Color
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8">
                <Button className="w-full">Beli Sekarang</Button>
              </Link>
            </div>

            {/* Researcher Package */}
            <div className="rounded-2xl border border-border bg-zinc-900/25 p-8 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">Paket Akademisi & Dosen</h4>
                <p className="text-xs text-text-secondary mt-2">Paling hemat untuk kolaborasi jurnal ilmiah atau tim riset.</p>
                <div className="mt-6 flex items-baseline gap-1.5 font-mono">
                  <span className="text-3xl font-extrabold text-white">Rp 200.000</span>
                  <span className="text-xs text-text-secondary">/ 45 Kredit + 5 Bonus</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Total 50 Kredit (Bonus 5)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Prioritas Pengecekan Utama
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Support via WhatsApp Prioritas
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8">
                <Button variant="outline" className="w-full">Pilih Paket</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Apa Kata Pengguna Kami?</h2>
            <p className="text-text-secondary mt-4 leading-relaxed">
              Ribuan mahasiswa, dosen, dan peneliti di seluruh Indonesia telah menggunakan jasa kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card title="Ahmad Fauzi" subtitle="Mahasiswa Pascasarjana UI" hoverable={false} className="bg-zinc-900/10">
              <div className="flex text-amber-400 gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-xs text-text-secondary italic leading-relaxed">
                &quot;Sangat puas dengan layanannya. Hasil cek Turnitin keluar kurang dari 10 menit. Yang paling penting no-repository, aman buat submit skripsi di fakultas.&quot;
              </p>
            </Card>

            <Card title="Dr. Retno Wulandari" subtitle="Dosen & Peneliti ITB" hoverable={false} className="bg-zinc-900/10">
              <div className="flex text-amber-400 gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-xs text-text-secondary italic leading-relaxed">
                &quot;Fitur per kata ini sangat menghemat biaya riset kami. Proses top up saldo cepat dan dashboard-nya modern. Sangat direkomendasikan untuk rekan sejawat dosen.&quot;
              </p>
            </Card>

            <Card title="Budi Santoso" subtitle="Mahasiswa Universitas Diponegoro" hoverable={false} className="bg-zinc-900/10">
              <div className="flex text-amber-400 gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-xs text-text-secondary italic leading-relaxed">
                &quot;Customer service-nya sangat ramah, dihubungi via WA langsung responsif membimbing cara bayar. Aplikasi web-nya juga sangat lancar dipakai.&quot;
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-zinc-950 border-t border-border/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Pertanyaan Umum (FAQ)</h2>
            <p className="text-text-secondary mt-4">
              Ada yang belum dipahami? Silakan cek beberapa pertanyaan yang paling sering ditanyakan di bawah ini.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Apa itu cek Turnitin No-Repository?",
                a: "Layanan cek No-Repository menjamin draf tulisan yang Anda unggah tidak akan tersimpan secara permanen di database server Turnitin pusat. Hal ini mencegah tulisan Anda dicap plagiarisme 100% saat kampus atau universitas Anda menguji berkas tersebut di kemudian hari."
              },
              {
                q: "Berapa lama proses pengecekan dokumen?",
                a: "Normalnya berkisar antara 5 hingga 15 menit saja setelah berkas berhasil disubmit ke sistem. Namun untuk dokumen yang sangat tebal (lebih dari 150 halaman), dapat memakan waktu hingga 30 menit."
              },
              {
                q: "Format berkas apa saja yang didukung?",
                a: "Kami mendukung berkas berformat PDF, DOC, DOCX, dan TXT dengan ukuran maksimal 10 Megabyte per berkas."
              },
              {
                q: "Bagaimana cara melakukan top-up saldo kredit?",
                a: "Klik tombol 'Isi Kredit' di dashboard Anda, tentukan jumlah kredit, lalu bayar melalui transfer Bank BCA. Selanjutnya, unggah bukti transfer. Kredit akan ditambahkan secara otomatis setelah mendapat persetujuan admin."
              },
              {
                q: "Apakah data dokumen saya aman dan tidak disebarluaskan?",
                a: "100% aman. Privasi naskah penelitian Anda adalah prioritas mutlak kami. Seluruh dokumen yang Anda unggah otomatis terhapus secara terjadwal setelah pengecekan selesai dan tidak ada hak kepemilikan yang kami ambil."
              }
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group border border-border bg-zinc-900/10 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex items-center justify-between font-bold text-sm text-white select-none">
                  <span>{faq.q}</span>
                  <span className="ml-1.5 transition-transform duration-300 group-open:-rotate-185 text-text-secondary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <p className="mt-3 text-xs text-text-secondary leading-relaxed border-t border-border/50 pt-3 cursor-text">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(37,99,235,0.1),transparent)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
            Siap Memastikan Orisinalitas Karya Tulis Anda?
          </h2>
          <p className="max-w-xl mx-auto text-sm text-text-secondary">
            Daftar sekarang secara gratis, dapatkan bonus 5 kredit instan, dan amankan kelulusan akademik Anda dengan Turnitin resmi.
          </p>
          <div className="pt-4">
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="px-8 glow-primary">
                Daftar & Klaim 5 Kredit Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
