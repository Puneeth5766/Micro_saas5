import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';

import { AuthenticatedRequest, ensureDatabaseConnection, errorResponse, findOwnedScan, getUserIdFromRequest } from '../_utils';

async function getHandler(
  request: AuthenticatedRequest,
  context: { params: { scanId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const scan = await findOwnedScan(context.params.scanId, userId);

    return NextResponse.json({ scan });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch scan.', 500);
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  context: { params: { scanId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const scan = await findOwnedScan(context.params.scanId, userId);
    await scan.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to delete scan.', 500);
  }
}

export const GET = (withAuth as unknown as typeof getHandler)(getHandler);
export const DELETE = (withAuth as unknown as typeof deleteHandler)(deleteHandler);
