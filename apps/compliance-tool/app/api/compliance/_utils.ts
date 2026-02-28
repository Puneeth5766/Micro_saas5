import { NextResponse } from 'next/server';

import { connectDB } from '@aether/db';

import ComplianceScan, { IComplianceScan } from '../../../lib/models/ComplianceScan';

export type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
    userId?: string;
  };
};

export async function ensureDatabaseConnection(): Promise<void> {
  await connectDB();
}

export function getUserIdFromRequest(request: AuthenticatedRequest): string {
  const userId =
    request.user?.id ||
    request.user?._id ||
    request.user?.userId ||
    (request as unknown as { auth?: { userId?: string } }).auth?.userId ||
    request.headers.get('x-user-id') ||
    '';

  if (!userId) {
    throw new Error('Unauthorized user context not found.');
  }

  return String(userId);
}

export async function findOwnedScan(scanId: string, userId: string): Promise<IComplianceScan> {
  const scan = await ComplianceScan.findById(scanId);

  if (!scan || String(scan.userId) !== String(userId)) {
    throw new Error('Scan not found.');
  }

  return scan;
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function toSafeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}
