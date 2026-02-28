import { ReactNode } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  FileText,
  Gauge,
  Plus,
  Settings,
  BarChart3,
  Home,
  UserCircle2,
} from 'lucide-react';

import { AppShell, Sidebar, Header } from '@aether/ui';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'My RFPs', href: '/dashboard/rfps', icon: FileText },
  { label: 'New RFP', href: '/dashboard/rfps/new', icon: Plus },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <Sidebar>
        <div className="px-4 py-6">
          <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <Gauge className="h-5 w-5 text-indigo-500" />
            <span>RFP Tool</span>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </Sidebar>

      <div className="min-w-0 flex-1">
        <Header>
          <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
            <h1 className="text-lg font-semibold text-slate-900">RFP Dashboard</h1>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
              <UserCircle2 className="h-5 w-5" />
              <span>Account</span>
            </button>
          </div>
        </Header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </AppShell>
  );
}
