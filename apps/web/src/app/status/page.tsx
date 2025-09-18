"use client";
import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";

interface StatusItem {
  name: string;
  status: "loading" | "connected" | "error";
  message?: string;
}

export default function StatusPage() {
  const [statuses, setStatuses] = useState<StatusItem[]>([
    { name: "Backend API", status: "loading" },
    { name: "Database", status: "loading" },
    { name: "Authentication", status: "loading" },
  ]);

  const checkBackendAPI = async (): Promise<StatusItem> => {
    try {
      const response = await apiClient.get("/health");
      if ((response as { status: number }).status === 200) {
        return { name: "Backend API", status: "connected", message: "API is responding" };
      } else {
        return {
          name: "Backend API",
          status: "error",
          message: `Unexpected status: ${(response as { status: number }).status}`,
        };
      }
    } catch (error) {
      return { name: "Backend API", status: "error", message: `Connection failed: ${error}` };
    }
  };

  const checkDatabase = async (): Promise<StatusItem> => {
    try {
      const response = await apiClient.get("/health");
      if ((response as { status: number }).status === 200) {
        return { name: "Database", status: "connected", message: "Database connection successful" };
      } else {
        return { name: "Database", status: "error", message: "Database connection failed" };
      }
    } catch (error) {
      return { name: "Database", status: "error", message: `Database error: ${error}` };
    }
  };

  const checkAuthentication = async (): Promise<StatusItem> => {
    try {
      // Try to access a protected endpoint to test auth
      const response = await apiClient.get("/users/me");
      if ((response as { status: number }).status === 200) {
        return { name: "Authentication", status: "connected", message: "Auth service working" };
      } else if ((response as { status: number }).status === 401) {
        return {
          name: "Authentication",
          status: "connected",
          message: "Auth service working (not authenticated)",
        };
      } else {
        return {
          name: "Authentication",
          status: "error",
          message: `Unexpected status: ${(response as { status: number }).status}`,
        };
      }
    } catch (error) {
      // 401 is expected if not authenticated
      if ((error as { response?: { status: number } }).response?.status === 401) {
        return {
          name: "Authentication",
          status: "connected",
          message: "Auth service working (not authenticated)",
        };
      }
      return { name: "Authentication", status: "error", message: `Auth error: ${error}` };
    }
  };

  const runChecks = useCallback(async () => {
    setStatuses((prev) => prev.map((item) => ({ ...item, status: "loading" as const })));

    const newStatuses: StatusItem[] = [
      await checkBackendAPI(),
      await checkDatabase(),
      await checkAuthentication(),
    ];

    setStatuses(newStatuses);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const getStatusColor = (status: StatusItem["status"]) => {
    switch (status) {
      case "connected":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "loading":
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  const getStatusIcon = (status: StatusItem["status"]) => {
    switch (status) {
      case "connected":
        return "✅";
      case "error":
        return "❌";
      case "loading":
        return "⏳";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">System Status</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Check the status of backend services and database
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={runChecks}>Refresh Status</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {statuses.map((item) => (
          <Card key={item.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{getStatusIcon(item.status)}</span>
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-medium ${getStatusColor(item.status)}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </p>
              {item.message && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.message}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Backend URL:</span>{" "}
              {process.env.NEXT_PUBLIC_API_URL ? "✅ Set" : "❌ Missing"}
            </div>
            <div>
              <span className="font-medium">Environment:</span>{" "}
              {process.env.NODE_ENV || "development"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
