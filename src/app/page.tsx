"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const authenticated = document.cookie.includes("auth=true");

    if (authenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, []);

  return null; // No renderiza nada, solo redirige
}
