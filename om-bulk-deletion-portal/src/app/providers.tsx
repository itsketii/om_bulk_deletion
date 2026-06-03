"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a0a0a",
            color: "#ffffff",
            border: "1px solid #1f1f1f",
            fontSize: "0.875rem",
          },
        }}
      />
    </AuthProvider>
  );
}
