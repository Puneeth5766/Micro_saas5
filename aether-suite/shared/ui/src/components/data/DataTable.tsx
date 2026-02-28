"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../Button";
import { Spinner } from "../Spinner";
import { cn } from "../../utils/cn";

export type DataTableColumn<T> = {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  cell?: (value: T[keyof T], row: T, rowIndex: number) => ReactNode;
};

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  pageSize?: number;
}

type SortDirection = "asc" | "desc";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyState,
  pageSize = 10
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" });
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [data, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function onSort(column: DataTableColumn<T>): void {
    if (!column.sortable) return;
    if (sortKey === column.accessor) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column.accessor);
    setSortDirection("asc");
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-alt">
            <tr>
              {columns.map((column) => {
                const isSorted = sortKey === column.accessor;
                return (
                  <th key={String(column.accessor)} scope="col" className="px-4 py-3 text-left font-semibold text-text-primary">
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1",
                        column.sortable ? "hover:text-primary" : "cursor-default"
                      )}
                      onClick={() => onSort(column)}
                      disabled={!column.sortable}
                      aria-sort={isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                    >
                      {column.header}
                      {column.sortable ? <span className="text-xs">{isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span> : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  <div className="inline-flex items-center gap-2 text-text-secondary">
                    <Spinner size="sm" /> Loading data...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-text-secondary">
                  {emptyState ?? "No data available."}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-surface-alt/60">
                  {columns.map((column) => {
                    const raw = row[column.accessor];
                    return (
                      <td key={String(column.accessor)} className="px-4 py-3 text-text-secondary">
                        {column.cell ? column.cell(raw, row, rowIndex) : String(raw ?? "—")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
