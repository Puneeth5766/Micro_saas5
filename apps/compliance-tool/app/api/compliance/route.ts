import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';

import ComplianceScan from '../../../lib/models/ComplianceScan';
import { AuthenticatedRequest, ensureDatabaseConnection, errorResponse, getUserIdFromRequest } from './_utils';

async function listHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const url = new URL(request.url);

    const pageParam = Number(url.searchParams.get('page') || '1');
    const limitParam = Number(url.searchParams.get('limit') || '10');

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;

    const filter = { userId };

    const [scans, total] = await Promise.all([
      ComplianceScan.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ComplianceScan.countDocuments(filter),
    ]);

    return NextResponse.json({ scans, total, page });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to list scans.', 500);
  }
}

export const GET = (withAuth as unknown as typeof listHandler)(listHandler);
