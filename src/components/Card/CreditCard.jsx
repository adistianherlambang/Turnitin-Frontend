import React from "react";
import styles from "./Card.module.css";

export const CreditCard = ({
  name = "John Doe",
  credits = 0,
  creditPrice = 5000,
  className = ""
}) => {
  const rupiahValue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(credits * creditPrice);

  return (
    <div className={`${styles.creditCard} ${className}`}>
      {/* Glow highlight */}
      <div className={styles.glowTopRight}></div>
      <div className={styles.glowLeftBottom}></div>

      {/* Card Header */}
      <div className={styles.ccHeader}>
        <div>
          <span className={styles.ccBrand}>Turnitin Premium Member</span>
          <h4 className={styles.ccTitle}>PLATINUM ACCREDIT</h4>
        </div>
        {/* Contactless symbol & Chip SVG */}
        <div className={styles.ccIcons}>
          <svg className={styles.ccContactless} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className={styles.ccChip}>
            <div className={styles.ccChipInner}></div>
            <div className={styles.ccChipLine}></div>
          </div>
        </div>
      </div>

      {/* Credit Balance Area */}
      {/* <div className={styles.ccBalanceArea}>
        <span className={styles.ccBalanceLabel}>Saldo Kredit</span>
        <div className={styles.ccBalanceValueContainer}>
          <span className={styles.ccBalanceValue}>{credits}</span>
          <span className={styles.ccBalanceUnit}>Kredit</span>
        </div>
      </div> */}

      {/* Card Footer: Name and Rupiah Value */}
      <div className={styles.ccFooter}>
        <div>
          <span className={styles.ccBalanceLabel}>Saldo Kredit</span>
          <div className={styles.ccBalanceValueContainer}>
            <span className={styles.ccBalanceValue}>{credits}</span>
            <span className={styles.ccBalanceUnit}>Kredit</span>
          </div>
        </div>
        {/* <div>
          <span className={styles.ccHolderLabel}>Card Holder</span>
          <span className={styles.ccHolderName}>{name}</span>
        </div> */}
        <div className="text-right">
          <span className={styles.ccRupiahLabel}>Rupiah Equivalent</span>
          <span className={styles.ccRupiahValue}>{rupiahValue}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
