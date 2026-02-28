'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { Badge, Button, Card, DataTable, EmptyState, UploadZone } from '@aether/ui';

type ProjectRow = {
  _id: string;
  title: string;
  status: string;
  sectionCount: number;
  createdAt: string;
  totalCost: number;
};

type ListResponse = {
  projects: ProjectRow[];
  total: number;
  page: number;
};

const fetcher = async (url: string): Promise<ListResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load projects');
  return response.json();
};

function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

export default function RFPListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const query = new URLSearchParams();
  query.set('page', '1');
  query.set('limit', '50');
  if (status) query.set('status', status);

  const { data, isLoading, mutate } = useSWR<ListResponse>(`/api/rfp?${query.toString()}`, fetcher);

  const filtered = useMemo(() => {
    const rows = data?.projects || [];
    return rows.filter((row) => row.title.toLowerCase().includes(search.trim().toLowerCase()));
  }, [data, search]);

  async function deleteProject(projectId: string) {
    const previous = data;
    if (!previous) return;

    const optimistic = {
      ...previous,
      projects: previous.projects.filter((item) => item._id !== projectId),
      total: Math.max(0, previous.total - 1),
    };

    await mutate(optimistic, false);

    const response = await fetch(`/api/rfp/${projectId}`, { method: 'DELETE' });
    if (!response.ok) {
      await mutate(previous, false);
      return;
    }

    await mutate();
  }

  async function exportDocx(projectId: string, title: string) {
    const response = await fetch(`/api/rfp/${projectId}/export`);
    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rfp-response-${title.replace(/[^a-zA-Z0-9-_]+/g, '-')}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">My RFP Projects</h2>
        <Link href="/dashboard/rfps/new">
          <Button>New RFP</Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Search by title"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No RFPs yet"
            description="Upload your first RFP to generate a response."
            action={
              <div className="max-w-md">
                <UploadZone accept="application/pdf" maxSize={10 * 1024 * 1024}>
                  <Link href="/dashboard/rfps/new" className="text-indigo-600">
                    Start new upload
                  </Link>
                </UploadZone>
              </div>
            }
          />
        ) : (
          <DataTable
            columns={['Title', 'Status', 'Sections', 'Cost', 'Created', 'Actions']}
            rows={filtered.map((project) => ({
              Title: project.title,
              Status: <Badge>{project.status}</Badge>,
              Sections: String(project.sectionCount),
              Cost: `$${(project.totalCost || 0).toFixed(2)}`,
              Created: new Date(project.createdAt).toLocaleDateString(),
              Actions: (
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/rfps/${project._id}`}>
                    <Button size="sm" variant="secondary">
                      Open
                    </Button>
                  </Link>
                  {project.status === 'completed' && (
                    <Button size="sm" variant="secondary" onClick={() => exportDocx(project._id, project.title)}>
                      Export
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => deleteProject(project._id)}>
                    Delete
                  </Button>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
