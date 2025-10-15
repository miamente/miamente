"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccountsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to users by default
    router.replace("/admin/accounts/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo a usuarios...</p>
      </div>
    </div>
  );
}