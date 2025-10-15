"use client";
import React, { useState } from "react";
import { Users, UserCheck, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accountTabs = [
  {
    id: "users",
    name: "Usuarios Regulares",
    href: "/admin/accounts/users",
    icon: Users,
    description: "Gestionar usuarios regulares del sistema",
  },
  {
    id: "professionals",
    name: "Profesionales",
    href: "/admin/accounts/professionals",
    icon: UserCheck,
    description: "Gestionar profesionales de la salud",
  },
  {
    id: "other-roles",
    name: "Otros Roles",
    href: "/admin/accounts/other-roles",
    icon: Shield,
    description: "Gestionar administradores y otros roles",
  },
];

export default function AdminAccountsPage() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Cuentas</h1>
        <p className="text-gray-600 mt-2">
          Administra todos los tipos de cuentas del sistema de manera unificada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link key={tab.id} href={tab.href}>
              <Card 
                className={cn(
                  "transition-all duration-200 hover:shadow-md cursor-pointer",
                  isActive 
                    ? "ring-2 ring-red-500 bg-red-50" 
                    : "hover:shadow-lg hover:scale-[1.02]"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isActive 
                          ? "bg-red-100 text-red-600" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className={cn(
                          "text-lg",
                          isActive ? "text-red-900" : "text-gray-900"
                        )}>
                          {tab.name}
                        </CardTitle>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-red-600" : "text-gray-400"
                    )} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    "text-sm",
                    isActive ? "text-red-700" : "text-gray-600"
                  )}>
                    {tab.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">-</div>
              <div className="text-sm text-blue-700">Usuarios Regulares</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">-</div>
              <div className="text-sm text-green-700">Profesionales</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">-</div>
              <div className="text-sm text-purple-700">Otros Roles</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
