import { executeAI } from '@aether/ai';

import { ScrapedWebsiteData } from './scraper-service';
import { ChecklistResult, ComplianceScores, determineRiskLevel } from './scoring-engine';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure-openai' | string;

export interface RiskFlag {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  regulation: string;
}

export interface ComplianceAIResult {
  summary: string;
  riskFlags: RiskFlag[];
  quickWins: string[];
}

interface AnalyzeComplianceParams {
  scrapedData: ScrapedWebsiteData;
  checklist: ChecklistResult[];
  scores: ComplianceScores;
  userId: string;
  provider: AIProvider;
}

const SYSTEM_PROMPT = `You are a legal compliance analyst specializing in data privacy regulations including
GDPR, CCPA, PECR, and PIPEDA. You analyze SaaS website policies and provide structured,
actionable compliance assessments. Your analysis is factual, cites specific regulations,
and prioritizes the most critical risks first. Never provide legal advice — always
recommend consulting a qualified attorney for final decisions.`;

const PRODUCT_ID = 'compliance-tool';

function getAIText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }

  const candidate = payload as {
    text?: string;
    output?: string;
    response?: string;
    content?: string;
  };

  return candidate.text || candidate.output || candidate.response || candidate.content || '';
}

function formatFailures(checklist: ChecklistResult[]): string {
  const failures = checklist.filter((item) => item.status === 'fail' || item.status === 'warning');

  if (failures.length === 0) {
    return 'None';
  }

  return failures
    .slice(0, 20)
    .map((item, index) => `${index + 1}. [${item.category.toUpperCase()}] ${item.item} — ${item.details}`)
    .join('\n');
}

function buildPrompt(params: AnalyzeComplianceParams): string {
  const { scrapedData, checklist, scores } = params;
  const riskLevel = determineRiskLevel(scores.overall);
  const privacyTextExcerpt = (scrapedData.privacyPolicyText || '').slice(0, 3000);

  return `Analyze this SaaS website's compliance status based on the following data:

COMPLIANCE SCORES:
Overall: ${scores.overall}/100 (${riskLevel} risk)
GDPR: ${scores.gdpr}/100 | CCPA: ${scores.ccpa}/100 | Cookies: ${scores.cookieCompliance}/100

CHECKLIST FAILURES:
${formatFailures(checklist)}

PRIVACY POLICY EXCERPT (first 3000 chars):
${privacyTextExcerpt}

Provide:
1. Executive summary (3 sentences max)
2. Top 5 critical risk flags with: category, severity, title, specific description,
   recommendation, and exact regulation reference
3. Three quick wins (easiest fixes with highest impact)

Format as valid JSON matching this structure:
{ "summary": string, "riskFlags": RiskFlag[], "quickWins": string[] }`;
}

function sanitizeRiskFlag(input: unknown): RiskFlag | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const flag = input as Record<string, unknown>;
  const severity = String(flag.severity || 'medium').toLowerCase();
  const allowedSeverity = ['low', 'medium', 'high', 'critical'] as const;

  return {
    category: String(flag.category || 'General'),
    severity: (allowedSeverity.includes(severity as (typeof allowedSeverity)[number])
      ? severity
      : 'medium') as RiskFlag['severity'],
    title: String(flag.title || 'Compliance risk identified'),
    description: String(flag.description || ''),
    recommendation: String(flag.recommendation || ''),
    regulation: String(flag.regulation || ''),
  };
}

function extractJsonCandidate(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return '';
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function parseAIResponse(rawText: string): ComplianceAIResult {
  const fallback: ComplianceAIResult = {
    summary: rawText,
    riskFlags: [],
    quickWins: [],
  };

  const candidate = extractJsonCandidate(rawText);
  if (!candidate) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(candidate) as {
      summary?: unknown;
      riskFlags?: unknown[];
      quickWins?: unknown[];
    };

    const riskFlags = Array.isArray(parsed.riskFlags)
      ? parsed.riskFlags.map((flag) => sanitizeRiskFlag(flag)).filter((flag): flag is RiskFlag => Boolean(flag))
      : [];

    const quickWins = Array.isArray(parsed.quickWins)
      ? parsed.quickWins.map((item) => String(item)).filter((item) => item.trim().length > 0)
      : [];

    return {
      summary: String(parsed.summary || ''),
      riskFlags,
      quickWins,
    };
  } catch (error) {
    console.warn('Failed to parse compliance AI JSON response; returning fallback structure.', error);
    return fallback;
  }
}

export async function analyzeCompliance(params: AnalyzeComplianceParams): Promise<ComplianceAIResult> {
  const prompt = buildPrompt(params);

  const rawResult = await executeAI({
    prompt,
    systemPrompt: SYSTEM_PROMPT,
    provider: params.provider,
    model: 'gpt-4o-mini',
    maxTokens: 1400,
    userId: params.userId,
    productId: PRODUCT_ID,
    action: 'compliance.analysis.generate',
  });

  const rawText = getAIText(rawResult);
  return parseAIResponse(rawText);
}
