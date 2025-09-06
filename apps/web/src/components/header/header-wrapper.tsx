"use client";
import { usePathname } from "next/navigation";

import { AdminHeader } from "./admin-header";
import { Header } from "./header";

import type { HeaderProps } from "@/lib/header-types";

export function HeaderWrapper(props: HeaderProps) {
  const pathname = usePathname();

  // Check if current path is an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <AdminHeader {...props} />;
  }

  return <Header {...props} />;
}
