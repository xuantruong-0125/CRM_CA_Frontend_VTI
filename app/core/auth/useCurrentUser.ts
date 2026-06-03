"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "@/core/auth/getCurrentUser";

export function useCurrentUser() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());

    const handleStorage = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    mounted,
    currentUser,
    isSale: currentUser?.roles.includes("SALE") ?? false,
  };
}