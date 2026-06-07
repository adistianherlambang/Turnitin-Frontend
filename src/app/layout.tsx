import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turnitin Checker AI - Jasa Cek Plagiasi Turnitin Tercepat & Terpercaya",
  description: "Layanan cek plagiasi Turnitin No-Repository terpercaya di Indonesia. Hasil cepat dalam 5-15 menit, aman, dan harga bersahabat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-white selection:bg-primary/30 selection:text-white">
        <AuthProvider>
          <div className="flex flex-col flex-1">
            {children}
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#18181b",
                color: "#ffffff",
                border: "1px solid #27272a",
                borderRadius: "12px",
                fontSize: "14px"
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff"
                }
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff"
                }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
