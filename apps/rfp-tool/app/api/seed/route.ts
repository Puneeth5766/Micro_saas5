import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';
import { connectDB } from '@aether/db';

import RFPProject from '../../../lib/models/RFPProject';
import { getDemoRFPProjects } from '../../../lib/seed/demo-data';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
    userId?: string;
  };
};

function getUserId(request: AuthenticatedRequest): string {
  const userId =
    request.user?.id ||
    request.user?._id ||
    request.user?.userId ||
    (request as unknown as { auth?: { userId?: string } }).auth?.userId ||
    request.headers.get('x-user-id') ||
    '';

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return String(userId);
}

async function seedHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  await connectDB();

  try {
    const userId = getUserId(request);

    await RFPProject.deleteMany({ userId, title: { $in: [
      'IT Services RFP — Municipal Digital Services Portal',
      'Cybersecurity Assessment RFP — Manufacturing Group',
      'SaaS Platform RFP — Enterprise Customer Success Suite',
    ] } });

    const projects = getDemoRFPProjects(userId);
    await RFPProject.insertMany(projects);

    return NextResponse.json({ seeded: true, projectCount: 3 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seeding failed' },
      { status: 500 }
    );
  }
}

export const GET = (withAuth as unknown as typeof seedHandler)(seedHandler);
