import { NextResponse } from 'next/server';

import { withAuth, withUsageLimit } from '@aether/auth';
import { trackEvent } from '@aether/analytics';

import ComplianceScan from '../../../../lib/models/ComplianceScan';
import { analyzeCompliance } from '../../../../lib/services/compliance-ai-service';
import { calculateScores, determineRiskLevel, runChecklist } from '../../../../lib/services/scoring-engine';
import { scrapeWebsite } from '../../../../lib/services/scraper-service';
import { AuthenticatedRequest, ensureDatabaseConnection, errorResponse, getUserIdFromRequest, toSafeDomain } from '../_utils';

function validateScanUrl(inputUrl: string): URL {
  const parsed = new URL(inputUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('URL must use http or https protocol.');
  }
  return parsed;
}

async function scanHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await ensureDatabaseConnection();

    const userId = getUserIdFromRequest(request);
    const body = (await request.json()) as { url?: string; provider?: string };

    if (!body?.url) {
      return errorResponse('url is required.', 400);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = validateScanUrl(body.url);
    } catch {
      return errorResponse('Please provide a valid http/https URL.', 400);
    }

    const scan = await ComplianceScan.create({
      userId,
      url: parsedUrl.toString(),
      domain: toSafeDomain(parsedUrl.toString()),
      status: 'pending',
      scrapedContent: {
        privacyPolicyUrl: '',
        privacyPolicyText: '',
        termsUrl: '',
        termsText: '',
        cookieNoticeText: '',
        hasPrivacyPolicy: false,
        hasTerms: false,
        hasCookieNotice: false,
        scrapedAt: new Date(),
      },
      scores: {
        overall: 0,
        gdpr: 0,
        ccpa: 0,
        cookieCompliance: 0,
        dataRetention: 0,
        userRights: 0,
        dataSharing: 0,
      },
      riskLevel: 'critical',
      riskFlags: [],
      checklist: [],
      aiAnalysis: '',
      exportHistory: [],
      tokensUsed: 0,
      cost: 0,
    });

    await trackEvent({
      userId,
      event: 'compliance_scan_started',
      productId: 'compliance-tool',
      properties: {
        scanId: String(scan._id),
        domain: scan.domain,
      },
    });

    // MVP note: route handlers run synchronously here; migrate this pipeline to a queue worker for true async background processing.
    scan.status = 'scanning';
    await scan.save();

    try {
      const scrapedData = await scrapeWebsite(scan.url);

      scan.scrapedContent = {
        ...scrapedData,
        scrapedAt: new Date(),
      };
      await scan.save();

      const checklist = runChecklist(scrapedData);
      scan.checklist = checklist.map((item) => ({
        item: item.item,
        status: item.status,
        details: item.details,
      }));
      await scan.save();

      const scores = calculateScores(checklist);
      scan.scores = scores;
      scan.riskLevel = determineRiskLevel(scores.overall);
      await scan.save();

      try {
        const aiResult = await analyzeCompliance({
          scrapedData,
          checklist,
          scores,
          userId,
          provider: body.provider || 'openai',
        });

        scan.riskFlags = aiResult.riskFlags;
        scan.aiAnalysis = aiResult.quickWins?.length
          ? `${aiResult.summary}\n\nQuick wins:\n${aiResult.quickWins.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
          : aiResult.summary;
      } catch (error) {
        scan.aiAnalysis = error instanceof Error ? `AI analysis unavailable: ${error.message}` : 'AI analysis unavailable.';
      }

      scan.status = 'completed';
      await scan.save();
    } catch (error) {
      scan.status = 'failed';
      scan.aiAnalysis = error instanceof Error ? `Scan failed: ${error.message}` : 'Scan failed.';
      await scan.save();

      return errorResponse('Compliance scan failed. Please verify the URL or try again.', 500);
    }

    return NextResponse.json({ scanId: String(scan._id), status: scan.status });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Scan request failed.', 500);
  }
}

const protectedHandler = (withAuth as unknown as (handler: typeof scanHandler) => typeof scanHandler)(scanHandler);

export const POST = (
  withUsageLimit as unknown as (
    productId: string,
    handler: typeof protectedHandler
  ) => typeof protectedHandler
)('compliance-tool', protectedHandler);
