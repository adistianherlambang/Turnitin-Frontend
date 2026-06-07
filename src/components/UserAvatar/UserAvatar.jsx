import React from "react";
import styles from "./UserAvatar.module.css";

export const UserAvatar = ({
  src,
  name = "User",
  size = "md", // sm | md | lg
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl"
  };

  const fallbackSeed = name.replace(/\s+/g, "");
  const fallbackSrc = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`;

  return (
    <div className={`relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 select-none flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <img
        src={src || fallbackSrc}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = fallbackSrc;
        }}
      />
    </div>
  );
};

export default UserAvatar;
