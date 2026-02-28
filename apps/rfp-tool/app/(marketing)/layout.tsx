import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from '@aether/ui';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="text-lg font-bold text-indigo-600">
            Aether RFP
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t bg-slate-50">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 text-sm md:grid-cols-2 md:px-6">
          <div>
            <p className="font-semibold text-slate-900">Aether RFP</p>
            <p className="mt-1 text-slate-600">AI-powered RFP responses that help your team win faster.</p>
          </div>
          <div className="flex items-center gap-4 md:justify-end">
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-600 hover:text-slate-900">
              Terms
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-slate-900">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
