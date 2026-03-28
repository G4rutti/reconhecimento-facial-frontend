"use client";

import { useEffect, useState } from "react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: number; // ms
}

const alertConfig: Record<AlertType, { icon: string; className: string }> = {
  success: { icon: "✅", className: "alert-success" },
  error: { icon: "❌", className: "alert-error" },
  info: { icon: "ℹ️", className: "alert-info" },
  warning: { icon: "⚠️", className: "alert-warning" },
};

/**
 * Componente de alerta para feedback visual ao usuário.
 */
export default function Alert({
  type,
  title,
  message,
  onClose,
  autoClose,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const config = alertConfig[type];

  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className={`alert ${config.className}`}>
      <div className="alert-content">
        <span className="alert-icon">{config.icon}</span>
        <div className="alert-text">
          {title && <p className="alert-title">{title}</p>}
          <p className="alert-message">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="alert-close"
        >
          ✕
        </button>
      )}
    </div>
  );
}
