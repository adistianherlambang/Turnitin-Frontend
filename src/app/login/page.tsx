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

        {/* Separator */}
        <div className={styles.separator}>
          <div className={styles.separatorLineContainer} aria-hidden="true">
            <div className={styles.separatorLine}></div>
          </div>
          <div className={styles.separatorTextContainer}>
            <span className={styles.separatorText}>Atau masuk dengan</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className={styles.socialGrid}>
          <button
            onClick={() => handleSocialLogin("google")}
            className={styles.socialBtn}
          >
            {/* Google Icon */}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <button
            onClick={() => handleSocialLogin("microsoft")}
            className={styles.socialBtn}
          >
            {/* Microsoft Icon */}
            <svg viewBox="0 0 23 23" fill="currentColor">
              <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
              <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
              <rect x="0" y="12" width="11" height="11" fill="#00A1F1"/>
              <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
            </svg>
            Microsoft
          </button>
          
          <button
            onClick={() => handleSocialLogin("facebook")}
            className={styles.socialBtn}
          >
            {/* Facebook Icon */}
            <svg className={styles.facebookIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          
          <button
            onClick={() => handleSocialLogin("apple")}
            className={styles.socialBtn}
          >
            {/* Apple Icon */}
            <svg viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.38-6.12-3.23-2.58-7.14-7.23-11.74-13.97-9.39-13.88-16.1-30.82-20.13-50.81-4.04-20.02-2.18-36.93 5.56-50.72 6.51-11.63 15.64-17.58 27.39-17.84 5.37-.1 10.74 1.54 16.1 4.95 5.37 3.4 9.17 4.92 11.42 4.54 2.25-.38 6.13-2.18 11.66-5.4 5.53-3.2 10.59-4.7 15.19-4.5 16.58.64 28.98 6.84 37.19 18.61-13.29 8.08-19.8 19.01-19.52 32.78.33 10.23 4.24 18.75 11.75 25.56 7.51 6.81 16.36 10.42 26.56 10.81 2.25.1 4.58-.2 6.98-.92 2.4-.71 4.48-1.74 6.23-3.06 1.8 4.54 3.65 9.4 5.53 14.54zm-28.71-112.5c0 7.84-2.82 15.08-8.46 21.72-5.63 6.64-12.58 10.74-20.84 12.31.22-1.74.33-3.32.33-4.74 0-7.39-2.92-14.75-8.77-22.09-5.85-7.34-13.1-11.45-21.75-12.34 8.71-11.53 19.66-17.06 32.84-16.57 6.13.22 11.95 2.2 17.47 5.92 5.53 3.73 9.4 8.24 11.63 13.56 4.39 5.37 6.58 10.43 6.58 15.2z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}
