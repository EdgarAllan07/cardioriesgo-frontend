"use client";

import { MainLayout } from "@/layouts/main-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    // Clear the auth-token cookie by setting max-age to 0
    document.cookie = "auth-token=; path=/; max-age=0";
    // Also clear the legacy 'auth' cookie just in case
    document.cookie = "auth=; path=/; max-age=0";

    window.location.href = "/login";
  };

  return <MainLayout onLogout={handleLogout}>{children}</MainLayout>;
}
