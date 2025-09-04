"use client";
import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseApp } from "@/hooks/useFirebaseApp";

interface StatusItem {
  name: string;
  status: "loading" | "connected" | "error";
  message?: string;
}

export default function StatusPage() {
  const { firestore, functions, isInitialized } = useFirebaseApp();
  const [statuses, setStatuses] = useState<StatusItem[]>([
    { name: "Firebase App", status: "loading" },
    { name: "App Check", status: "loading" },
    { name: "Firestore", status: "loading" },
    { name: "Functions", status: "loading" },
  ]);

  const checkAppCheck = async (): Promise<StatusItem> => {
    try {
      // Check if App Check is configured
      const hasRecaptchaKey = !!process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
      if (!hasRecaptchaKey) {
        return { name: "App Check", status: "error", message: "No reCAPTCHA site key configured" };
      }

      // In a real app, you'd check the App Check token
      // For now, we'll just check if the key exists
      return { name: "App Check", status: "connected", message: "reCAPTCHA key configured" };
    } catch (error) {
      return { name: "App Check", status: "error", message: `Error: ${error}` };
    }
  };

  const checkFirestore = useCallback(async (): Promise<StatusItem> => {
    try {
      if (!firestore) {
        return { name: "Firestore", status: "error", message: "Firestore not initialized" };
      }

      // Try to read from a test collection
      const { doc, getDoc } = await import("firebase/firestore");
      const testDoc = doc(firestore, "test", "connection");
      await getDoc(testDoc);

      return { name: "Firestore", status: "connected", message: "Connection successful" };
    } catch (error) {
      return { name: "Firestore", status: "error", message: `Connection failed: ${error}` };
    }
  }, [firestore]);

  const checkFunctions = useCallback(async (): Promise<StatusItem> => {
    try {
      if (!functions) {
        return { name: "Functions", status: "error", message: "Functions not initialized" };
      }

      // Functions are initialized, but we can't easily test without calling one
      return { name: "Functions", status: "connected", message: "Functions initialized" };
    } catch (error) {
      return { name: "Functions", status: "error", message: `Error: ${error}` };
    }
  }, [functions]);

  const runChecks = useCallback(async () => {
    setStatuses((prev) => prev.map((item) => ({ ...item, status: "loading" as const })));

    const newStatuses: StatusItem[] = [
      {
        name: "Firebase App",
        status: isInitialized ? "connected" : "error",
        message: isInitialized ? "App initialized" : "App not initialized",
      },
      await checkAppCheck(),
      await checkFirestore(),
      await checkFunctions(),
    ];

    setStatuses(newStatuses);
  }, [isInitialized, checkFirestore, checkFunctions]);

  useEffect(() => {
    if (isInitialized) {
      runChecks();
    }
  }, [isInitialized, runChecks]);

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
        <h1 className="text-3xl font-bold">Firebase Status</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Check the status of Firebase services and App Check
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={runChecks} disabled={!isInitialized}>
          Refresh Status
        </Button>
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
              <span className="font-medium">API Key:</span>{" "}
              {process.env.NEXT_PUBLIC_FB_API_KEY ? "✅ Set" : "❌ Missing"}
            </div>
            <div>
              <span className="font-medium">Project ID:</span>{" "}
              {process.env.NEXT_PUBLIC_FB_PROJECT_ID ? "✅ Set" : "❌ Missing"}
            </div>
            <div>
              <span className="font-medium">reCAPTCHA Key:</span>{" "}
              {process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ? "✅ Set" : "❌ Missing"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
