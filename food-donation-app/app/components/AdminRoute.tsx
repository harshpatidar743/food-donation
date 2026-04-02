"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredAuthUser, isAdminUser, isAuthenticatedUser } from "../lib/auth";

type AdminRouteProps = {
  children: ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const authUser = getStoredAuthUser();
    const canAccess = isAuthenticatedUser(authUser) && isAdminUser(authUser);

    if (!canAccess) {
      router.replace("/");
      return;
    }

    setHasAccess(true);
    setIsCheckingAccess(false);
  }, [pathname, router]);

  if (isCheckingAccess) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Checking admin access...
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
