import { withAuth } from '@aether/auth';
import { trackEvent } from '@aether/analytics';

import { generateDOCX } from '../../../../../lib/services/docx-service';
import {
  AuthenticatedRequest,
  ensureDatabaseConnection,
  errorResponse,
  findOwnedProject,
  getUserIdFromRequest,
  sanitizeFilenamePart,
} from '../../_utils';

async function exportHandler(
  request: AuthenticatedRequest,
  context: { params: { projectId: string } }
): Promise<Response> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const { projectId } = context.params;

    const project = await findOwnedProject(projectId, userId);

    if (project.status !== 'completed') {
      return errorResponse('Project must be completed before export.', 400);
    }

    const docxBuffer = await generateDOCX(project);

    project.exportHistory.push({
      exportedAt: new Date(),
      format: 'docx',
      fileSize: docxBuffer.byteLength,
    });
    await project.save();

    await trackEvent({
      userId,
      event: 'rfp_exported',
      productId: 'rfp-tool',
      properties: {
        projectId,
        fileSize: docxBuffer.byteLength,
        exportCount: project.exportHistory.length,
      },
    });

    const safeTitle = sanitizeFilenamePart(project.title);

    return new Response(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="rfp-response-${safeTitle}.docx"`,
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Export failed.', 500);
  }
}

export const GET = (withAuth as unknown as typeof exportHandler)(exportHandler);
