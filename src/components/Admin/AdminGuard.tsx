"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/Context/UserContext";
type AdminGuardProps = {
  children: React.ReactNode;
};

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();

  const { isAdmin, loading } = useUser();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div>
        Carregando...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}