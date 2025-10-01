import React from "react";
import { MoreVertical, Edit, Trash2, UserX, UserCheck, Mail, Phone, Calendar } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBogotaDate } from "@/lib/timezone";

export interface Column<T> {
  key: keyof T | "actions";
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface AdminDataTableProps<T extends { id: string }> {
  readonly title: string;
  readonly description: string;
  readonly addButtonText?: string;
  readonly onAdd?: () => void;
  readonly data: readonly T[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly columns: readonly Column<T>[];
  readonly onEdit?: (item: T) => void;
  readonly onToggleActive?: (item: T) => void;
  readonly onDelete?: (item: T) => void;
  readonly emptyMessage?: string;
}

export function AdminDataTable<T extends { id: string }>({
  title,
  description,
  addButtonText,
  onAdd,
  data,
  loading,
  error,
  columns,
  onEdit,
  onToggleActive,
  onDelete,
  emptyMessage = "No hay datos disponibles",
}: AdminDataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div
          data-testid="loading-spinner"
          className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"
        ></div>
      </div>
    );
  }

  const renderCell = (item: T, column: Column<T>) => {
    if (column.key === "actions") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {onToggleActive && (
              <DropdownMenuItem onClick={() => onToggleActive(item)}>
                {(item as unknown as { is_active: boolean }).is_active ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (column.render) {
      return column.render(item);
    }

    // Handle the 'actions' key case
    if (column.key === "actions") {
      return null;
    }

    const value = item[column.key];
    return <span>{String(value)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
        {addButtonText && onAdd && <Button onClick={onAdd}>{addButtonText}</Button>}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {title} ({data.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className={`p-4 text-left font-medium ${column.className || ""}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={String(column.key)} className="p-4">
                          {renderCell(item, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Utility functions for common column renderers
export const commonRenderers = {
  user: (item: { full_name: string; id: string }) => (
    <div className="flex items-center space-x-2">
      <div>
        <div className="font-medium">{item.full_name}</div>
        <div className="text-sm text-gray-500">ID: {item.id.slice(0, 8)}...</div>
      </div>
    </div>
  ),

  contact: (item: { email: string; phone?: string }) => (
    <div>
      <div className="flex items-center space-x-2 text-sm">
        <Mail className="h-4 w-4 text-gray-400" />
        <span>{item.email}</span>
      </div>
      {item.phone && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{item.phone}</span>
        </div>
      )}
    </div>
  ),

  status: (item: { is_active: boolean; is_verified: boolean }) => (
    <div className="space-y-1">
      <Badge variant={item.is_active ? "default" : "secondary"}>
        {item.is_active ? "Activo" : "Inactivo"}
      </Badge>
      <br />
      <Badge variant={item.is_verified ? "default" : "outline"}>
        {item.is_verified ? "Verificado" : "No verificado"}
      </Badge>
    </div>
  ),

  date: (item: Record<string, unknown>, field: string) => (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <Calendar className="h-4 w-4" />
      <span>
        {formatBogotaDate(new Date(item[field] as string), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  ),

  lastLogin: (item: { last_login?: string }) => (
    <div className="text-sm text-gray-500">
      {item.last_login
        ? formatBogotaDate(new Date(item.last_login), {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Nunca"}
    </div>
  ),
};
