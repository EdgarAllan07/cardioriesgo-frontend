"use client";

import { MainLayout } from "@/layouts/main-layout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    document.cookie = "auth=false; path=/";
    window.location.href = "/login";
  };

  return <MainLayout onLogout={handleLogout}>{children}</MainLayout>;
}
