import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server';

import { withAuth, withUsageLimit } from '@aether/auth';
import { trackEvent } from '@aether/analytics';

import RFPProject from '../../../../lib/models/RFPProject';
import {
  extractRFPSections,
  FileProcessingError,
  parsePDF,
  saveUploadedFile,
  validatePDFFile,
} from '../../../../lib/services/file-service';
import { AuthenticatedRequest, ensureDatabaseConnection, errorResponse, getUserIdFromRequest } from '../_utils';

async function uploadHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const formData = await request.formData();

    const file = formData.get('rfpFile');
    if (!(file instanceof File)) {
      return errorResponse('RFP PDF file is required.', 400);
    }

    validatePDFFile({ size: file.size, mimetype: file.type });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfResult = await parsePDF(buffer);
    const extractedSections = extractRFPSections(pdfResult.text);

    await saveUploadedFile(buffer, `${userId}/${file.name}`);

    const companyName = String(formData.get('companyName') || '').trim();
    const companyDescription = String(formData.get('companyDescription') || '').trim();
    const pastProjects = String(formData.get('pastProjects') || '').trim();
    const teamSize = String(formData.get('teamSize') || '').trim();
    const location = String(formData.get('location') || '').trim();
    const rawServices = String(formData.get('services') || '[]');

    let services: string[] = [];
    try {
      const parsed = JSON.parse(rawServices);
      services = Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
    } catch {
      return errorResponse('Invalid services format. Provide a JSON array.', 400);
    }

    if (!companyName) {
      return errorResponse('companyName is required.', 400);
    }

    const projectTitle = file.name.replace(/\.pdf$/i, '').trim() || 'Untitled RFP';

    const project = await RFPProject.create({
      userId,
      title: projectTitle,
      status: 'draft',
      rfpFile: {
        originalName: file.name,
        size: file.size,
        uploadedAt: new Date(),
        extractedText: pdfResult.text,
        pageCount: pdfResult.pageCount,
      },
      companyProfile: {
        name: companyName,
        description: companyDescription,
        services,
        pastProjects,
        teamSize,
        location,
        uploadedAt: new Date(),
      },
      sections: extractedSections.map((section) => ({
        id: randomUUID(),
        title: section.title,
        rfpRequirement: section.content,
        generatedResponse: '',
        status: 'pending',
        tokensUsed: 0,
        regenerationCount: 0,
        lastEditedAt: new Date(),
      })),
      exportHistory: [],
      totalTokensUsed: 0,
      totalCost: 0,
      lastError: '',
    });

    await trackEvent({
      userId,
      event: 'rfp_uploaded',
      productId: 'rfp-tool',
      properties: {
        projectId: String(project._id),
        pageCount: pdfResult.pageCount,
        sectionCount: extractedSections.length,
      },
    });

    return NextResponse.json({
      projectId: String(project._id),
      sectionCount: extractedSections.length,
      pageCount: pdfResult.pageCount,
    });
  } catch (error) {
    if (error instanceof FileProcessingError) {
      return errorResponse(error.userMessage, 400);
    }

    return errorResponse(error instanceof Error ? error.message : 'Upload failed.', 500);
  }
}

const protectedHandler = (withAuth as unknown as (handler: typeof uploadHandler) => typeof uploadHandler)(
  uploadHandler
);

export const POST = (
  withUsageLimit as unknown as (
    productId: string,
    handler: typeof protectedHandler
  ) => typeof protectedHandler
)('rfp-tool', protectedHandler);
