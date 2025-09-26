import React from "react";
import { LoginForm } from "@/components/login-form";

export default function AdminLoginPage() {
  return <LoginForm isAdminLogin={true} redirectPath="/admin" />;
}
