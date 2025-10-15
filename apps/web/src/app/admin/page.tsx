"use client";
import React from "react";
import { Users, Stethoscope, Shield, UserCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface AccountStats {
  users: number;
  professionals: number;
  administrators: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<AccountStats>({
    users: 0,
    professionals: 0,
    administrators: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Load all accounts to get counts
        const response = await apiClient.getAllAccountsAdmin(1, 1000); // Get a large number to ensure we get all accounts
        
        if (response && Array.isArray(response.items)) {
          const counts = response.items.reduce(
            (acc, account) => {
              switch (account.role_name) {
                case "user":
                  acc.users++;
                  break;
                case "professional":
                  acc.professionals++;
                  break;
                case "admin":
                  acc.administrators++;
                  break;
                default:
                  // Other roles count as administrators
                  acc.administrators++;
                  break;
              }
              return acc;
            },
            { users: 0, professionals: 0, administrators: 0 }
          );
          
          setStats(counts);
        }
      } catch (error) {
        console.error("Error loading account stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="mt-2 text-gray-600">Panel de control para administrar la plataforma</p>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {loading ? "..." : stats.users}
              </div>
              <div className="text-sm text-blue-700">Usuarios Regulares</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {loading ? "..." : stats.professionals}
              </div>
              <div className="text-sm text-green-700">Profesionales</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {loading ? "..." : stats.administrators}
              </div>
              <div className="text-sm text-purple-700">Administradores</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Acciones Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/admin/accounts">
                <Users className="h-6 w-6" />
                <span>Gestionar Cuentas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/admin/specialties">
                <Stethoscope className="h-6 w-6" />
                <span>Gestionar Especialidades</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
