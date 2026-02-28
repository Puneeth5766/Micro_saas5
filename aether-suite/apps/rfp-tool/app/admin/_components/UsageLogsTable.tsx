"use client";

import { useMemo } from "react";
import { DataTable } from "@aether/ui";

export interface UsageLogRow {
  userId: string;
  productId: string;
  provider: string;
  tokensUsed: number;
  cost: number;
  action: string;
  timestamp: string;
}

export function UsageLogsTable({ rows }: { rows: UsageLogRow[] }) {
  const columns = useMemo(
    () => [
      { header: "User", accessor: "userId", sortable: true },
      { header: "Product", accessor: "productId", sortable: true },
      { header: "Provider", accessor: "provider", sortable: true },
      { header: "Tokens", accessor: "tokensUsed", sortable: true },
      { header: "Cost", accessor: "cost", sortable: true },
      { header: "Action", accessor: "action", sortable: true },
      { header: "Timestamp", accessor: "timestamp", sortable: true },
    ],
    [],
  );

  return <DataTable columns={columns} data={rows} pageSize={50} />;
}
