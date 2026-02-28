"use client";

import { Button } from "../Button";

export interface ExportButtonProps {
  onExport: () => Promise<void> | void;
  format: "pdf" | "docx" | "csv";
  loading?: boolean;
}

export function ExportButton({ onExport, format, loading = false }: ExportButtonProps) {
  return (
    <Button variant="outline" loading={loading} onClick={() => void onExport()} aria-label={`Export as ${format.toUpperCase()}`}>
      Export {format.toUpperCase()}
    </Button>
  );
}
