"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/pages/login-page";

export default function Login() {
  const router = useRouter();

  const handleLogin = () => {
    document.cookie = "auth=true; path=/";
    router.push("/dashboard");
  };

  return <LoginPage onLogin={handleLogin} />;
}
