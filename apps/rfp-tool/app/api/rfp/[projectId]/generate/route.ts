import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';
import { trackEvent } from '@aether/analytics';

import { generateFullResponse, type AIProvider } from '../../../../../lib/services/rfp-ai-service';
import {
  AuthenticatedRequest,
  ensureDatabaseConnection,
  errorResponse,
  findOwnedProject,
  getUserIdFromRequest,
} from '../../_utils';

async function generateHandler(
  request: AuthenticatedRequest,
  context: { params: { projectId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const { projectId } = context.params;
    const body = (await request.json()) as { provider?: AIProvider; model?: string };

    if (!body?.provider || !body?.model) {
      return errorResponse('provider and model are required.', 400);
    }

    const project = await findOwnedProject(projectId, userId);

    project.status = 'processing';
    project.lastError = '';
    await project.save();

    try {
      const result = await generateFullResponse({
        project,
        provider: body.provider,
        model: body.model,
      });

      project.status = 'completed';
      project.lastError = '';
      await project.save();

      await trackEvent({
        userId,
        event: 'rfp_generated',
        productId: 'rfp-tool',
        properties: {
          projectId,
          provider: body.provider,
          model: body.model,
          sectionCount: result.sections.length,
          totalTokensUsed: result.totalTokensUsed,
          totalCost: result.totalCost,
        },
      });

      return NextResponse.json({
        success: true,
        totalTokensUsed: result.totalTokensUsed,
        totalCost: result.totalCost,
        sectionCount: result.sections.length,
      });
    } catch (error) {
      project.status = 'failed';
      project.lastError = error instanceof Error ? error.message : 'Generation failed.';
      await project.save();

      return errorResponse(project.lastError, 500);
    }
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Generation failed.', 500);
  }
}

export const POST = (withAuth as unknown as typeof generateHandler)(generateHandler);
