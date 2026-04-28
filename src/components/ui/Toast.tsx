"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 4000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === "success";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem 1.25rem",
        borderRadius: "0.75rem",
        backgroundColor: isSuccess ? "#2D6A4F" : "#DC2626",
        color: "white",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        minWidth: "280px",
        maxWidth: "400px",
        transition: "opacity 0.3s, transform 0.3s",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(1rem)",
        fontFamily: "var(--font-cairo), sans-serif",
      }}
      role="alert"
    >
      {isSuccess ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span style={{ flex: 1, fontSize: "0.9rem", lineHeight: 1.5 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "2px",
          opacity: 0.8,
          display: "flex",
        }}
        aria-label="إغلاق"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Hook for managing toasts
import { useCallback } from "react";

export interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}
