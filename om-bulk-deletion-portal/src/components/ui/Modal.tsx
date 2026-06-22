"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

type ModalSize = "sm" | "md" | "lg" | "xl";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${SIZE_CLASSES[size]} rounded-lg border border-[var(--border)] bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title || description ? (
          <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-4">
            <div className="flex flex-col gap-1">
              {title ? (
                <h2 className="text-base font-semibold text-black">{title}</h2>
              ) : null}
              {description ? (
                <p className="text-xs text-[var(--muted)]">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-[var(--muted)] transition hover:bg-zinc-50 hover:text-black"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
