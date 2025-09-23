"use client";
import React from "react";
import { usePathname } from "next/navigation";

import { UnifiedHeader } from "./unified-header";

import type { HeaderProps } from "@/lib/header-types";

export function HeaderWrapper(props: Readonly<HeaderProps>) {
  const pathname = usePathname();

  // Check if current path is an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  // Configure variant-specific settings
  const headerConfig = isAdminRoute
    ? {
        ...props.config,
        hideUserMenuOnLogin: true, // Hide user menu on admin login page
      }
    : props.config;

  return (
    <UnifiedHeader {...props} variant={isAdminRoute ? "admin" : "default"} config={headerConfig} />
  );
}
