import { withAuth } from '@aether/auth';
import { trackEvent } from '@aether/analytics';

import { generateComplianceReport } from '../../../../../lib/services/pdf-service';
import { AuthenticatedRequest, ensureDatabaseConnection, errorResponse, findOwnedScan, getUserIdFromRequest } from '../../_utils';

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'domain';
}

async function exportHandler(
  request: AuthenticatedRequest,
  context: { params: { scanId: string } }
): Promise<Response> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const scan = await findOwnedScan(context.params.scanId, userId);

    const buffer = await generateComplianceReport(scan);

    scan.exportHistory.push({ exportedAt: new Date(), format: 'pdf' });
    await scan.save();

    await trackEvent({
      userId,
      event: 'compliance_report_exported',
      productId: 'compliance-tool',
      properties: {
        scanId: String(scan._id),
        domain: scan.domain,
        exports: scan.exportHistory.length,
      },
    });

    const datePart = new Date().toISOString().slice(0, 10);
    const filename = `compliance-${safeName(scan.domain)}-${datePart}.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to export report.', 500);
  }
}

export const GET = (withAuth as unknown as typeof exportHandler)(exportHandler);
