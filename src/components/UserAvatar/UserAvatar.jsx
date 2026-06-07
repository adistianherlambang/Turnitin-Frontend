import React from "react";
import styles from "./UserAvatar.module.css";

export const UserAvatar = ({
  src,
  name = "User",
  size = "md", // sm | md | lg
  className = ""
}) => {
  const fallbackSeed = name.replace(/\s+/g, "");
  const fallbackSrc = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`;

  return (
    <div className={`${styles.avatarContainer} ${styles[`size-${size}`]} ${className}`}>
      <img
        src={src || fallbackSrc}
        alt={name}
        className={styles.image}
        onError={(e) => {
          e.target.src = fallbackSrc;
        }}
      />
    </div>
  );
};

export default UserAvatar;
