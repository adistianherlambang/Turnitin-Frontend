"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo/Logo";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { toast } from "react-hot-toast";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const { login, socialLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const tempErrors: any = {};
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

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const profile = await login(email, password);
      toast.success(`Selamat datang kembali, ${profile.name}!`);

      // Redirect based on role
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk. Periksa kembali email dan password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const profile = await socialLogin(provider);
      toast.success(`Login berhasil via ${provider}!`);
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(`Gagal masuk via ${provider}: ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <Logo />
          <h2 className={styles.title}>
            Masuk ke Akun Anda
          </h2>
          <p className={styles.subtitle}>
            Atau{" "}
            <Link href="/register" className={styles.link}>
              daftar akun baru di sini
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <div className={styles.passwordGroup}>
              <div className={styles.passwordHeader}>
                <label className={styles.label}>
                  Kata Sandi
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success("Tautan reset password telah dikirim ke email Anda. (Simulated)");
                  }}
                  className={styles.forgotLink}
                >
                  Lupa Password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={`${styles.passwordInput} ${errors.password ? styles.inputError : ""}`}
              />
              {errors.password && (
                <span className={styles.errorText}>
                  {errors.password}
                </span>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full text-sm font-bold tracking-wide py-3 uppercase"
            >
              Masuk Sekarang
            </Button>
          </div>
        </form>


      </div>
    </div>
  );
}
