"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo/Logo";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { toast } from "react-hot-toast";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const tempErrors: any = {};
    if (!name) {
      tempErrors.name = "Nama lengkap wajib diisi";
    }

    if (!email) {
      tempErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Format email tidak valid";
    }
    
    if (!password) {
      tempErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      tempErrors.password = "Password minimal 6 karakter";
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Konfirmasi password tidak cocok";
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("Akun berhasil dibuat! Anda mendapatkan bonus 5 kredit pendaftaran.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.08),transparent)]">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl border border-border/80 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-xs text-text-secondary">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-blue-400 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Register Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Input
            label="Konfirmasi Kata Sandi"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              className="w-full text-sm font-bold tracking-wide py-3 uppercase"
            >
              Daftar & Ambil 5 Kredit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
