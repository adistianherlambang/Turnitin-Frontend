import React from "react";
import styles from "./Card.module.css";

export const NotificationCard = ({
  title,
  message,
  createdAt,
  createdBy,
  className = ""
}) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
    : "";

  return (
    <div className={`${styles.notifCard} ${className}`}>
      {/* Visual Accent */}
      {/* <div className={styles.notifAccent}></div> */}

      <div className={styles.notifContent}>
        <div className={styles.notifHeader}>
          <h5 className={styles.notifTitle}>{title}</h5>
          {formattedDate && (
            <span className={styles.notifDate}>
              {formattedDate}
            </span>
          )}
        </div>
        <p className={styles.notifMessage}>
          {message}
        </p>
        {createdBy && (
          <div className={styles.notifCreator}>
            <span>Oleh:</span>
            <span className={styles.notifCreatorName}>{createdBy}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
