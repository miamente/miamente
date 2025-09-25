import { ReactNode } from "react";

interface AdminLoginLayoutProps {
  readonly children: ReactNode;
}

export default function AdminLoginLayout({ children }: AdminLoginLayoutProps) {
  return <>{children}</>;
}
