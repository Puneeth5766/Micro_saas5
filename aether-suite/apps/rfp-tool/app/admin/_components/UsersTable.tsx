"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConfirmDialog, DataTable, PlanBadge, Button } from "@aether/ui";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "pay_per_use";
  credits: number;
  totalGenerations: number;
  joinedDate: string;
}

export function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns = useMemo(
    () => [
      { header: "Name", accessor: "name", sortable: true },
      { header: "Email", accessor: "email", sortable: true },
      {
        header: "Plan",
        accessor: "plan",
        cell: (value: unknown) => <PlanBadge plan={value as AdminUserRow["plan"]} size="sm" />,
      },
      { header: "Credits", accessor: "credits", sortable: true },
      { header: "Total Generations", accessor: "totalGenerations", sortable: true },
      { header: "Joined Date", accessor: "joinedDate", sortable: true },
      {
        header: "Actions",
        accessor: "id",
        cell: (_value: unknown, row: AdminUserRow) => (
          <div className="flex items-center gap-2">
            <Link className="text-primary hover:underline" href={`/admin/ai-usage?userId=${row.id}`}>
              View Usage
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPendingUserId(row.id);
                setDialogOpen(true);
              }}
            >
              Reset Credits
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  async function handleResetCredits(): Promise<void> {
    if (!pendingUserId) {
      return;
    }

    await fetch(`/api/admin/users/${pendingUserId}/reset-credits`, { method: "POST" });
    window.location.reload();
  }

  return (
    <>
      <DataTable columns={columns} data={rows} pageSize={50} />
      <ConfirmDialog
        open={dialogOpen}
        onClose={setDialogOpen}
        title="Reset user credits"
        description="This will set the selected user's usage credits to zero."
        confirmLabel="Reset Credits"
        variant="danger"
        onConfirm={handleResetCredits}
      />
    </>
  );
}
