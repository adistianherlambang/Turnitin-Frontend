import React from "react";
import styles from "./Loading.module.css";

// 1. Loading Spinner / Overlay
export const Loading = ({ fullPage = false, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  const spinner = (
    <div
      className={`rounded-full border-t-primary border-r-transparent border-b-zinc-800 border-l-zinc-800 animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      {spinner}
    </div>
  );
};

// 2. Skeleton Box Placeholder
export const Skeleton = ({ variant = "rect", width = "100%", height = "1rem", className = "" }) => {
  const shapes = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md"
  };

  return (
    <div
      className={`bg-zinc-800 animate-pulse-slow ${shapes[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Loading;
