import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';

import RFPProject from '../../../../lib/models/RFPProject';
import {
  AuthenticatedRequest,
  ensureDatabaseConnection,
  errorResponse,
  findOwnedProject,
  getUserIdFromRequest,
} from '../_utils';

async function getHandler(
  request: AuthenticatedRequest,
  context: { params: { projectId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const { projectId } = context.params;

    const project = await RFPProject.findOne(
      { _id: projectId, userId },
      { 'rfpFile.extractedText': 0 }
    ).lean();

    if (!project) {
      return errorResponse('Project not found.', 404);
    }

    return NextResponse.json({ project });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch project.', 500);
  }
}

async function patchHandler(
  request: AuthenticatedRequest,
  context: { params: { projectId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const { projectId } = context.params;
    const body = (await request.json()) as { sectionId?: string; editedResponse?: string };

    if (!body?.sectionId || typeof body.editedResponse !== 'string') {
      return errorResponse('sectionId and editedResponse are required.', 400);
    }

    const project = await findOwnedProject(projectId, userId);
    const section = project.sections.find((item) => item.id === body.sectionId);

    if (!section) {
      return errorResponse('Section not found.', 404);
    }

    section.generatedResponse = body.editedResponse;
    section.lastEditedAt = new Date();
    project.markModified('sections');
    await project.save();

    return NextResponse.json({ section });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to update section.', 500);
  }
}

async function deleteHandler(
  request: AuthenticatedRequest,
  context: { params: { projectId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const { projectId } = context.params;

    const project = await findOwnedProject(projectId, userId);
    await project.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to delete project.', 500);
  }
}

export const GET = (withAuth as unknown as typeof getHandler)(getHandler);
export const PATCH = (withAuth as unknown as typeof patchHandler)(patchHandler);
export const DELETE = (withAuth as unknown as typeof deleteHandler)(deleteHandler);
