import { NextResponse } from 'next/server';

import { withAuth } from '@aether/auth';
import { trackEvent } from '@aether/analytics';

import { regenerateSection, type AIProvider } from '../../../../../lib/services/rfp-ai-service';
import {
  AuthenticatedRequest,
  ensureDatabaseConnection,
  errorResponse,
  findOwnedProject,
  getUserIdFromRequest,
} from '../../_utils';

async function regenerateHandler(
  request: AuthenticatedRequest,
  context: { params: { projectId: string } }
): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const { projectId } = context.params;

    const body = (await request.json()) as {
      sectionId?: string;
      instruction?: string;
      provider?: AIProvider;
    };

    if (!body?.sectionId || !body?.provider) {
      return errorResponse('sectionId and provider are required.', 400);
    }

    const project = await findOwnedProject(projectId, userId);

    const result = await regenerateSection({
      project,
      sectionId: body.sectionId,
      instruction: body.instruction,
      provider: body.provider,
    });

    await trackEvent({
      userId,
      event: 'rfp_section_regenerated',
      productId: 'rfp-tool',
      properties: {
        projectId,
        sectionId: body.sectionId,
        provider: body.provider,
        totalTokensUsed: result.totalTokensUsed,
        totalCost: result.totalCost,
      },
    });

    return NextResponse.json({ section: result.section });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Section regeneration failed.', 500);
  }
}

export const POST = (withAuth as unknown as typeof regenerateHandler)(regenerateHandler);
