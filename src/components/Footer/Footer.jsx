import React, { useState, useEffect } from "react";
import Logo from "../Logo/Logo";
import { dbService } from "@/services/dbService";
import styles from "./Footer.module.css";

export const Footer = () => {
  const [settings, setSettings] = useState({
    contactWhatsapp: "6281776743211",
    contactEmail: "support@turnitinchecker.com",
    footer: "© 2026 Turnitin Checker AI. Semua hak cipta dilindungi."
  });

  useEffect(() => {
    const unsub = dbService.subscribeCollection("settings", (data) => {
      if (data && data.length > 0) {
        const s = data.find(item => item.id === "general") || data[0];
        setSettings(prev => ({
          ...prev,
          contactWhatsapp: s.contactWhatsapp || prev.contactWhatsapp,
          contactEmail: s.contactEmail || prev.contactEmail,
          footer: s.footer || prev.footer,
        }));
      }
    });
    return () => unsub();
  }, []);

  const formatWhatsapp = (num) => {
    // Format: 6281776743211 -> +62 817-7674-3211
    if (!num) return "";
    const clean = num.replace(/\D/g, "");
    if (clean.startsWith("62") && clean.length >= 10) {
      const local = clean.slice(2);
      return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
    }
    return `+${clean}`;
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Logo & Description */}
          <div className={styles.brandCol}>
            <Logo />
            <p className={styles.description}>
              Layanan pengecekan plagiarisme Turnitin tercepat, teraman, dan terjangkau di Indonesia. Lindungi orisinalitas karya tulis ilmiah Anda sekarang.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.navColTitle}>Navigasi</h4>
            <ul className={styles.navColList}>
              <li>
                <a href="#fitur" className={styles.navLink}>Fitur</a>
              </li>
              <li>
                <a href="#cara-kerja" className={styles.navLink}>Cara Kerja</a>
              </li>
              <li>
                <a href="#pricing" className={styles.navLink}>Harga Layanan</a>
              </li>
              <li>
                <a href="#faq" className={styles.navLink}>FAQ</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className={styles.navColTitle}>Dukungan</h4>
            <ul className={styles.navColList}>
              <li className={styles.contactItem}>
                <svg className={styles.contactIconPrimary} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${settings.contactEmail}`} className={styles.navLink}>{settings.contactEmail}</a>
              </li>
              <li className={styles.contactItem}>
                <svg className={styles.contactIconSuccess} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href={`https://wa.me/${settings.contactWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.navLink}
                >
                  {formatWhatsapp(settings.contactWhatsapp)}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>{settings.footer}</p>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.navLink}>Kebijakan Privasi</a>
            <a href="#" className={styles.navLink}>Syarat &amp; Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
