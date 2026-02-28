import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';

import RFPProject from '../../../lib/models/RFPProject';
import { AuthenticatedRequest, ensureDatabaseConnection, errorResponse, getUserIdFromRequest } from './_utils';

async function listHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);

    const url = new URL(request.url);
    const pageParam = Number(url.searchParams.get('page') || '1');
    const limitParam = Number(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;

    const filter: Record<string, unknown> = { userId };
    if (status) {
      filter.status = status;
    }

    const [projects, total] = await Promise.all([
      RFPProject.find(filter)
        .select({ _id: 1, title: 1, status: 1, sections: 1, createdAt: 1, totalCost: 1 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RFPProject.countDocuments(filter),
    ]);

    return NextResponse.json({
      projects: projects.map((project) => ({
        _id: String(project._id),
        title: project.title,
        status: project.status,
        sectionCount: Array.isArray(project.sections) ? project.sections.length : 0,
        createdAt: project.createdAt,
        totalCost: project.totalCost || 0,
      })),
      total,
      page,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to list projects.', 500);
  }
}

export const GET = (withAuth as unknown as typeof listHandler)(listHandler);
