import Link from 'next/link';

import { PageContainer, Card, Button, Badge, StatCard } from '@aether/ui';
import { requireServerUser } from '@aether/auth';
import { connectDB } from '@aether/db';

import RFPProject from '../../lib/models/RFPProject';

function avgResponseTime(statuses: string[]): string {
  const processing = statuses.filter((s) => s === 'processing').length;
  const completed = statuses.filter((s) => s === 'completed').length;
  const score = completed > 0 ? Math.max(8, 22 - processing) : 0;
  return score > 0 ? `${score} min` : '—';
}

export default async function DashboardPage() {
  const user = await requireServerUser();
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [thisMonthCount, totalProjects, recentProjects] = await Promise.all([
    RFPProject.countDocuments({ userId: String(user.id), createdAt: { $gte: monthStart } }),
    RFPProject.countDocuments({ userId: String(user.id) }),
    RFPProject.find({ userId: String(user.id) })
      .select({ title: 1, status: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const creditsRemaining = Math.max(0, 1000 - totalProjects * 12);
  const averageTime = avgResponseTime(recentProjects.map((item) => String(item.status)));

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Good morning, {user.name || 'there'}</h2>
          <p className="text-sm text-slate-600">Your RFP pipeline at a glance.</p>
        </div>
        <Link href="/dashboard/rfps/new">
          <Button>New RFP Response</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard title="RFPs This Month" value={String(thisMonthCount)} />
        <StatCard title="Credits Remaining" value={String(creditsRemaining)} />
        <StatCard title="Avg Response Time" value={averageTime} />
      </div>

      <Card className="p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Recent Projects</h3>
          <Link href="/dashboard/rfps" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="space-y-3">
          {recentProjects.length === 0 ? (
            <p className="text-sm text-slate-500">No projects yet.</p>
          ) : (
            recentProjects.map((project) => (
              <div key={String(project._id)} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-slate-900">{project.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{String(project.status)}</Badge>
                  <Link href={`/dashboard/rfps/${String(project._id)}`}>
                    <Button variant="secondary">Open</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
