"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  readonly totalItems: number;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange?: (size: number) => void;
  readonly pageSizeOptions?: number[];
  readonly compact?: boolean; // removes vertical padding for tight layouts
}

export function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  compact = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const goTo = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (clamped !== currentPage) onPageChange(clamped);
  };

  // Generate a compact set of page buttons
  const getPages = () => {
    const pages: (number | "ellipsis")[] = [];
    const windowSize = 2;

    for (let p = 1; p <= totalPages; p += 1) {
      const isEdge = p === 1 || p === totalPages;
      const inWindow = Math.abs(p - currentPage) <= windowSize;
      if (isEdge || inWindow) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 ${compact ? "py-2" : "py-4"}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={!canPrev}
          className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          {getPages().map((p, idx) =>
            p === "ellipsis" ? (
              <span key={`e-${idx}`} className="px-2 select-none text-gray-500">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p as number)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`inline-flex items-center justify-center w-8 h-8 rounded border text-sm font-medium ${
                  p === currentPage 
                    ? "bg-red-600 text-white border-red-600" 
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={!canNext}
          className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Mostrando {(totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1)}–{Math.min(currentPage * pageSize, totalItems)} de {totalItems}
        </span>
        {onPageSizeChange && (
          <label className="ml-3 inline-flex items-center gap-2">
            <span>Elementos</span>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}


