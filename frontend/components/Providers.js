"use client";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/lib/toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
