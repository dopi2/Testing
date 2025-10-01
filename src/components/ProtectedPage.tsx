// /src/components/ProtectedPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotAuthorizedPage from "./NotAuthorizedPage";

export default function ProtectedPage({
  role,
  children,
}: {
  role?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = sessionStorage.getItem("accessToken");
        console.log("🔍 ProtectedPage: stored token =", token);

        const res = await fetch("/api/verify", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          console.error("❌ /api/verify failed:", res.status);
          router.push("/login");
          return;
        }

        const data = await res.json();
        console.log("✅ /api/verify response:", data);

        if (!data.valid) {
          console.error("❌ Token invalid");
          router.push("/login");
          return;
        }

        const currentUserRole = data.user?.role;
        setUserRole(currentUserRole);

        // If role is specified and doesn't match, show 403
        if (role && currentUserRole !== role) {
          console.error(
            `❌ Role mismatch: required=${role}, got=${currentUserRole}`
          );
          setAuthorized(false);
          return;
        }

        console.log("🎉 Access granted");
        setAuthorized(true);
      } catch (err) {
        console.error("❌ Auth check error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [role, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  // If not authorized due to role mismatch, show 403
  if (!authorized && userRole) {
    return <NotAuthorizedPage currentRole={userRole} />;
  }

  // If not authorized and no user role (token issues), redirect to login
  if (!authorized) {
    return <p>Redirecting to login...</p>;
  }

  return <>{children}</>;
}