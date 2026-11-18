"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authSessionEvents } from "@/services/auth-session";

export function AuthSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      router.replace("/login?motivo=sessao-expirada");
    };

    window.addEventListener(authSessionEvents.sessionExpired, handleSessionExpired);
    return () => window.removeEventListener(authSessionEvents.sessionExpired, handleSessionExpired);
  }, [router]);

  return null;
}
