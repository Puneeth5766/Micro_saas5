const SYSTEM_PROMPTS: Record<string, string> = {
  "rfp-tool": "You are an expert RFP response writer who crafts clear, persuasive, and compliant responses tailored to the buyer's requirements.",
  "compliance-tool": "You are a legal compliance analyst who identifies obligations, flags risk, and recommends practical controls for regulated SaaS businesses.",
  "market-analyzer": "You are a SaaS market research analyst who synthesizes market signals, competitors, positioning, and pricing insights into actionable recommendations.",
  "proposal-optimizer": "You are a professional proposal coach who strengthens structure, clarity, differentiation, and win themes in commercial proposals.",
  "landing-critic": "You are a conversion rate optimization expert who audits landing pages for messaging clarity, trust, friction, and conversion opportunities."
};

const VARIABLE_REGEX = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

export class PromptTemplate {
  private readonly template: string;

  constructor(template: string) {
    this.template = template;
  }

  compile(variables: Record<string, string>): string {
    return this.template.replace(VARIABLE_REGEX, (_match, variableName: string) => {
      const value = variables[variableName];

      if (typeof value !== "string") {
        throw new Error(`Missing required template variable: ${variableName}`);
      }

      return value;
    });
  }
}

export function buildSystemPrompt(productId: string): string {
  return SYSTEM_PROMPTS[productId] ?? "You are an expert AI assistant for B2B SaaS workflows.";
}
