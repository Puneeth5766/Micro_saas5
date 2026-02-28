import { NextResponse } from 'next/server';

import { connectDB } from '@aether/db';

import RFPProject, { IRFPProject } from '../../../lib/models/RFPProject';

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
  const directUserId =
    request.user?.id ||
    request.user?._id ||
    request.user?.userId ||
    (request as unknown as { auth?: { userId?: string } }).auth?.userId ||
    request.headers.get('x-user-id') ||
    '';

  if (!directUserId) {
    throw new Error('Unauthorized user context not found.');
  }

  return String(directUserId);
}

export async function findOwnedProject(projectId: string, userId: string): Promise<IRFPProject> {
  const project = await RFPProject.findById(projectId);

  if (!project || String(project.userId) !== String(userId)) {
    throw new Error('Project not found.');
  }

  return project;
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function sanitizeFilenamePart(value: string): string {
  const trimmed = (value || '').trim();
  const sanitized = trimmed.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
  return sanitized || 'rfp-response';
}
