import { executeAI, PromptTemplate, buildSystemPrompt } from '@aether/ai';

import RFPProject, { IRFPProject, IRFPProjectSection } from '../models/RFPProject';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure-openai' | string;

const PRODUCT_ID = 'rfp-tool';
const DEFAULT_MODEL = 'gpt-4o-mini';

const RFP_SYSTEM_PROMPT = `You are an expert RFP (Request for Proposal) response writer with 15 years of experience
helping IT agencies, SaaS companies, and government contractors win enterprise deals.
You write professional, structured, and persuasive responses that directly address
requirements. Your responses are factual, confident, and never include filler content.
Always format responses in clean paragraphs. Never exceed the requested length.`;

const SECTION_TEMPLATE = `COMPANY PROFILE:
{{companyProfile}}

RFP SECTION TITLE: {{sectionTitle}}

RFP REQUIREMENT:
{{rfpRequirement}}

Write a professional response for this RFP section. Be specific, cite relevant experience, and directly address the stated requirement. Maximum 400 words.`;

interface ExecuteAIResult {
  text?: string;
  content?: string;
  output?: string;
  response?: string;
  tokensUsed?: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  totalCost?: number;
}

export interface GenerationResult {
  sections: IRFPProjectSection[];
  totalTokensUsed: number;
  totalCost: number;
}

export interface RegenerateResult {
  section: IRFPProjectSection;
  totalTokensUsed: number;
  totalCost: number;
}

function formatCompanyProfile(project: IRFPProject): string {
  const profile = project.companyProfile;

  const services = profile.services?.length ? profile.services.join(', ') : 'N/A';

  return [
    `Company Name: ${profile.name || 'N/A'}`,
    `Description: ${profile.description || 'N/A'}`,
    `Services: ${services}`,
    `Past Projects: ${profile.pastProjects || 'N/A'}`,
    `Team Size: ${profile.teamSize || 'N/A'}`,
    `Location: ${profile.location || 'N/A'}`,
  ].join('\n');
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  try {
    const candidate = new (PromptTemplate as unknown as new (...args: unknown[]) => {
      format?: (input: Record<string, string>) => string;
      render?: (input: Record<string, string>) => string;
      compile?: (input: Record<string, string>) => string;
    })(template);

    if (typeof candidate.format === 'function') {
      return candidate.format(vars);
    }

    if (typeof candidate.render === 'function') {
      return candidate.render(vars);
    }

    if (typeof candidate.compile === 'function') {
      return candidate.compile(vars);
    }
  } catch {
    // fallback below
  }

  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => vars[key] ?? '');
}

function buildSectionPrompt(project: IRFPProject, section: IRFPProjectSection): string {
  return renderTemplate(SECTION_TEMPLATE, {
    companyProfile: formatCompanyProfile(project),
    sectionTitle: section.title,
    rfpRequirement: section.rfpRequirement,
  });
}

function pickText(result: ExecuteAIResult): string {
  return (result.text || result.content || result.output || result.response || '').trim();
}

function pickTokens(result: ExecuteAIResult): number {
  if (typeof result.tokensUsed === 'number') return result.tokensUsed;
  if (typeof result.totalTokens === 'number') return result.totalTokens;
  const input = typeof result.inputTokens === 'number' ? result.inputTokens : 0;
  const output = typeof result.outputTokens === 'number' ? result.outputTokens : 0;
  return input + output;
}

function pickCost(result: ExecuteAIResult): number {
  if (typeof result.totalCost === 'number') return result.totalCost;
  if (typeof result.cost === 'number') return result.cost;
  return 0;
}

function getSystemPrompt(): string {
  if (typeof buildSystemPrompt === 'function') {
    return buildSystemPrompt(RFP_SYSTEM_PROMPT);
  }

  return RFP_SYSTEM_PROMPT;
}

async function saveProgress(project: IRFPProject): Promise<void> {
  project.markModified('sections');
  await project.save();
}

export async function generateFullResponse(params: {
  project: IRFPProject;
  provider: AIProvider;
  model: string;
}): Promise<GenerationResult> {
  const { project, provider, model } = params;

  project.status = 'processing';
  await saveProgress(project);

  let totalTokensUsed = project.totalTokensUsed || 0;
  let totalCost = project.totalCost || 0;

  for (const section of project.sections) {
    section.status = 'generating';
    section.lastEditedAt = new Date();
    await saveProgress(project);

    try {
      const prompt = buildSectionPrompt(project, section);

      const aiResult = (await executeAI({
        prompt,
        systemPrompt: getSystemPrompt(),
        provider,
        model: model || DEFAULT_MODEL,
        maxTokens: 900,
        userId: project.userId,
        productId: PRODUCT_ID,
        action: 'rfp.section.generate',
      })) as ExecuteAIResult;

      const responseText = pickText(aiResult);
      const usedTokens = pickTokens(aiResult);
      const sectionCost = pickCost(aiResult);

      section.generatedResponse = responseText;
      section.status = responseText ? 'done' : 'failed';
      section.tokensUsed = (section.tokensUsed || 0) + usedTokens;
      section.lastEditedAt = new Date();

      totalTokensUsed += usedTokens;
      totalCost += sectionCost;

      project.totalTokensUsed = totalTokensUsed;
      project.totalCost = totalCost;

      await saveProgress(project);
    } catch {
      section.status = 'failed';
      section.lastEditedAt = new Date();
      await saveProgress(project);
      throw new Error(`Failed to generate response for section "${section.title}".`);
    }
  }

  project.status = project.sections.every((section) => section.status === 'done') ? 'completed' : 'failed';
  await saveProgress(project);

  return {
    sections: project.sections,
    totalTokensUsed: project.totalTokensUsed,
    totalCost: project.totalCost,
  };
}

export async function regenerateSection(params: {
  project: IRFPProject;
  sectionId: string;
  instruction?: string;
  provider: AIProvider;
}): Promise<RegenerateResult> {
  const { project, sectionId, instruction, provider } = params;

  const section = project.sections.find((item) => item.id === sectionId);
  if (!section) {
    throw new Error('Section not found.');
  }

  section.status = 'generating';
  section.lastEditedAt = new Date();
  await saveProgress(project);

  const originalPrompt = buildSectionPrompt(project, section);
  const prompt = instruction?.trim()
    ? `Rewrite this section with the following guidance: ${instruction.trim()}\n\n${originalPrompt}`
    : originalPrompt;

  const aiResult = (await executeAI({
    prompt,
    systemPrompt: getSystemPrompt(),
    provider,
    model: DEFAULT_MODEL,
    maxTokens: 900,
    userId: project.userId,
    productId: PRODUCT_ID,
    action: 'rfp.section.regenerate',
  })) as ExecuteAIResult;

  const responseText = pickText(aiResult);
  const usedTokens = pickTokens(aiResult);
  const regenCost = pickCost(aiResult);

  section.generatedResponse = responseText;
  section.status = responseText ? 'done' : 'failed';
  section.tokensUsed = (section.tokensUsed || 0) + usedTokens;
  section.regenerationCount = (section.regenerationCount || 0) + 1;
  section.lastEditedAt = new Date();

  project.totalTokensUsed = (project.totalTokensUsed || 0) + usedTokens;
  project.totalCost = (project.totalCost || 0) + regenCost;

  await saveProgress(project);

  return {
    section,
    totalTokensUsed: project.totalTokensUsed,
    totalCost: project.totalCost,
  };
}

export async function generateExecutiveSummary(
  project: IRFPProject,
  provider: AIProvider
): Promise<string> {
  const compiledSections = project.sections
    .filter((section) => section.generatedResponse)
    .map(
      (section) =>
        `SECTION: ${section.title}\nREQUIREMENT: ${section.rfpRequirement}\nRESPONSE: ${section.generatedResponse}`
    )
    .join('\n\n');

  const prompt = `Based on these RFP responses, write a compelling 200-word executive summary that highlights our key strengths and why we are the best choice for this project.\n\n${compiledSections}`;

  const aiResult = (await executeAI({
    prompt,
    systemPrompt: getSystemPrompt(),
    provider,
    model: DEFAULT_MODEL,
    maxTokens: 450,
    userId: project.userId,
    productId: PRODUCT_ID,
    action: 'rfp.executive-summary.generate',
  })) as ExecuteAIResult;

  const summary = pickText(aiResult);
  const tokens = pickTokens(aiResult);
  const cost = pickCost(aiResult);

  project.totalTokensUsed = (project.totalTokensUsed || 0) + tokens;
  project.totalCost = (project.totalCost || 0) + cost;
  await RFPProject.updateOne(
    { _id: project._id },
    {
      $set: {
        totalTokensUsed: project.totalTokensUsed,
        totalCost: project.totalCost,
        updatedAt: new Date(),
      },
    }
  );

  return summary;
}
