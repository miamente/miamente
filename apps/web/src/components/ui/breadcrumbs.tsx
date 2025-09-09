import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400",
        className,
      )}
    >
      <Link
        href="/"
        className="flex items-center transition-colors hover:text-gray-900 dark:hover:text-gray-100"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Inicio</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
