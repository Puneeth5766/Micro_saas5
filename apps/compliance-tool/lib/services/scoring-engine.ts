import { ScrapedWebsiteData } from './scraper-service';

export type ChecklistStatus = 'pass' | 'fail' | 'warning' | 'na';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ChecklistResult {
  item: string;
  status: ChecklistStatus;
  details: string;
  category: ChecklistCategory;
}

export interface ComplianceScores {
  overall: number;
  gdpr: number;
  ccpa: number;
  cookieCompliance: number;
  dataRetention: number;
  dataSharing: number;
  userRights: number;
}

type ChecklistCategory = 'gdpr' | 'ccpa' | 'cookie' | 'retention' | 'security';

interface ChecklistDefinition {
  item: string;
  category: ChecklistCategory;
  patterns: RegExp[];
  warningPatterns?: RegExp[];
  detailOnPass: string;
  detailOnFail: string;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hasAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

const CHECKLIST_DEFINITIONS: ChecklistDefinition[] = [
  {
    category: 'gdpr',
    item: 'Data controller identity disclosed',
    patterns: [/data controller/i, /controller identity/i, /who we are/i, /company name/i],
    detailOnPass: 'The policy appears to disclose the identity of the data controller.',
    detailOnFail: 'No clear data controller identity disclosure was found.',
  },
  {
    category: 'gdpr',
    item: 'Purpose of data processing stated',
    patterns: [/purpose of processing/i, /why we collect/i, /how we use/i, /processing purpose/i],
    detailOnPass: 'The purpose of processing is stated.',
    detailOnFail: 'No clear purpose of processing statement was found.',
  },
  {
    category: 'gdpr',
    item: 'Legal basis for processing mentioned',
    patterns: [/legal basis/i, /legitimate interests?/i, /consent/i, /contractual necessity/i],
    warningPatterns: [/consent/i],
    detailOnPass: 'A legal basis for processing appears to be identified.',
    detailOnFail: 'No explicit legal basis for processing was found.',
  },
  {
    category: 'gdpr',
    item: 'User rights listed (access, deletion, portability, rectification)',
    patterns: [/right of access/i, /right to erasure|right to delete/i, /data portability/i, /rectification/i],
    detailOnPass: 'Core GDPR data subject rights are listed.',
    detailOnFail: 'Core GDPR user rights are not comprehensively listed.',
  },
  {
    category: 'gdpr',
    item: 'Data retention period specified',
    patterns: [/retain.*for/i, /retention period/i, /how long.*keep/i, /stored for/i],
    detailOnPass: 'Data retention period language is present.',
    detailOnFail: 'No specific data retention period language was found.',
  },
  {
    category: 'gdpr',
    item: 'Third-party data sharing disclosed',
    patterns: [/third[- ]party/i, /service providers?/i, /share.*data/i, /disclose.*information/i],
    detailOnPass: 'Third-party data sharing disclosures are present.',
    detailOnFail: 'No clear third-party data sharing disclosure was found.',
  },
  {
    category: 'gdpr',
    item: 'International data transfer mentioned',
    patterns: [/international transfer/i, /outside (the )?(eu|eea)/i, /cross-border/i, /standard contractual clauses|scc/i],
    detailOnPass: 'International data transfer language is present.',
    detailOnFail: 'No international transfer disclosure was found.',
  },
  {
    category: 'gdpr',
    item: 'Contact/DPO details present',
    patterns: [/data protection officer|dpo/i, /privacy@/i, /contact.*privacy/i],
    warningPatterns: [/contact/i],
    detailOnPass: 'Privacy contact or DPO details are present.',
    detailOnFail: 'No privacy contact or DPO details were found.',
  },
  {
    category: 'gdpr',
    item: 'Right to withdraw consent mentioned',
    patterns: [/withdraw consent/i, /revoke consent/i, /you may withdraw/i],
    detailOnPass: 'The right to withdraw consent is mentioned.',
    detailOnFail: 'No right to withdraw consent language was found.',
  },
  {
    category: 'gdpr',
    item: 'Complaint procedure stated',
    patterns: [/lodge a complaint/i, /supervisory authority/i, /data protection authority/i],
    detailOnPass: 'Complaint procedure language is present.',
    detailOnFail: 'No complaint procedure language was found.',
  },

  {
    category: 'ccpa',
    item: '"Do Not Sell My Personal Information" mention',
    patterns: [/do not sell my personal information/i, /do not sell or share/i],
    detailOnPass: 'Do-not-sell language appears present.',
    detailOnFail: 'No do-not-sell language was found.',
  },
  {
    category: 'ccpa',
    item: 'Categories of collected data listed',
    patterns: [/categories of personal information/i, /information we collect/i, /types of data/i],
    detailOnPass: 'Categories of collected data are listed.',
    detailOnFail: 'No clear list of collected data categories was found.',
  },
  {
    category: 'ccpa',
    item: 'California resident rights mentioned',
    patterns: [/california residents?/i, /ccpa rights/i, /california privacy rights/i],
    detailOnPass: 'California resident rights language is present.',
    detailOnFail: 'No California resident rights language was found.',
  },
  {
    category: 'ccpa',
    item: 'Opt-out mechanism described',
    patterns: [/opt[- ]out/i, /unsubscribe/i, /preference center/i],
    detailOnPass: 'An opt-out mechanism is described.',
    detailOnFail: 'No clear opt-out mechanism was found.',
  },
  {
    category: 'ccpa',
    item: 'Non-discrimination clause present',
    patterns: [/non-discrimination/i, /will not discriminate/i],
    detailOnPass: 'Non-discrimination language is present.',
    detailOnFail: 'No non-discrimination clause was found.',
  },
  {
    category: 'ccpa',
    item: 'Financial incentive policy mentioned',
    patterns: [/financial incentive/i, /loyalty program/i, /price or service difference/i],
    detailOnPass: 'Financial incentive policy language is present.',
    detailOnFail: 'No financial incentive policy language was found.',
  },

  {
    category: 'cookie',
    item: 'Cookie notice present on site',
    patterns: [/cookie/i, /consent/i, /tracking/i],
    detailOnPass: 'Cookie notice language appears present.',
    detailOnFail: 'No cookie notice language was found.',
  },
  {
    category: 'cookie',
    item: 'Cookie categories described (necessary, analytics, marketing)',
    patterns: [/necessary cookies?/i, /analytics cookies?/i, /marketing cookies?/i],
    detailOnPass: 'Cookie categories are described.',
    detailOnFail: 'Cookie categories are not clearly described.',
  },
  {
    category: 'cookie',
    item: 'Opt-in/opt-out mechanism mentioned',
    patterns: [/accept.*cookies?/i, /reject.*cookies?/i, /cookie preferences?/i, /manage cookies?/i],
    detailOnPass: 'Cookie opt-in/opt-out controls are mentioned.',
    detailOnFail: 'No clear cookie opt-in/opt-out mechanism was found.',
  },
  {
    category: 'cookie',
    item: 'Cookie policy link present',
    patterns: [/cookie policy/i],
    detailOnPass: 'A cookie policy reference appears present.',
    detailOnFail: 'No cookie policy reference was found.',
  },
  {
    category: 'cookie',
    item: 'Cookie lifespan/expiry mentioned',
    patterns: [/cookie.*expires?/i, /retention.*cookies?/i, /session cookie/i, /persistent cookie/i],
    detailOnPass: 'Cookie lifespan/expiry language is present.',
    detailOnFail: 'No cookie lifespan/expiry language was found.',
  },

  {
    category: 'retention',
    item: 'Retention periods specified',
    patterns: [/retention period/i, /retain.*for/i, /kept for/i],
    detailOnPass: 'Retention periods are specified.',
    detailOnFail: 'No retention period specification was found.',
  },
  {
    category: 'retention',
    item: 'Deletion procedures described',
    patterns: [/delete.*data/i, /deletion request/i, /erase.*information/i],
    detailOnPass: 'Deletion procedures are described.',
    detailOnFail: 'No deletion procedures were found.',
  },
  {
    category: 'retention',
    item: 'Backup/archive policy mentioned',
    patterns: [/backup/i, /archive/i, /disaster recovery/i],
    detailOnPass: 'Backup/archive policy language is present.',
    detailOnFail: 'No backup/archive policy language was found.',
  },
  {
    category: 'retention',
    item: 'Account deletion option referenced',
    patterns: [/delete your account/i, /account closure/i, /close your account/i],
    detailOnPass: 'Account deletion option is referenced.',
    detailOnFail: 'No account deletion option was referenced.',
  },

  {
    category: 'security',
    item: 'Security measures mentioned',
    patterns: [/security measures?/i, /protect.*information/i, /safeguards?/i],
    detailOnPass: 'Security measures are mentioned.',
    detailOnFail: 'No clear security measures were mentioned.',
  },
  {
    category: 'security',
    item: 'Encryption mentioned',
    patterns: [/encryption/i, /encrypted/i, /tls|ssl/i],
    detailOnPass: 'Encryption language is present.',
    detailOnFail: 'No encryption language was found.',
  },
  {
    category: 'security',
    item: 'Breach notification procedure mentioned',
    patterns: [/breach notification/i, /notify.*breach/i, /security incident/i],
    detailOnPass: 'Breach notification language is present.',
    detailOnFail: 'No breach notification procedure was found.',
  },
  {
    category: 'security',
    item: 'Data minimization principle mentioned',
    patterns: [/data minimization/i, /only collect.*necessary/i, /limited to what is necessary/i],
    detailOnPass: 'Data minimization language is present.',
    detailOnFail: 'No data minimization language was found.',
  },
  {
    category: 'security',
    item: 'Employee access controls mentioned',
    patterns: [/access controls?/i, /authorized personnel/i, /need-to-know/i, /role-based access/i],
    detailOnPass: 'Employee access controls are mentioned.',
    detailOnFail: 'No employee access control language was found.',
  },
];

function evaluateItem(def: ChecklistDefinition, combinedText: string): ChecklistResult {
  const pass = hasAnyPattern(combinedText, def.patterns);
  if (pass) {
    return {
      item: def.item,
      category: def.category,
      status: 'pass',
      details: def.detailOnPass,
    };
  }

  if (def.warningPatterns && hasAnyPattern(combinedText, def.warningPatterns)) {
    return {
      item: def.item,
      category: def.category,
      status: 'warning',
      details: `Partial compliance signals found, but explicit requirement language is incomplete. ${def.detailOnFail}`,
    };
  }

  return {
    item: def.item,
    category: def.category,
    status: 'fail',
    details: def.detailOnFail,
  };
}

export function runChecklist(scrapedData: ScrapedWebsiteData): ChecklistResult[] {
  const combinedText = normalize(
    [
      scrapedData.privacyPolicyText,
      scrapedData.termsText,
      scrapedData.cookieNoticeText,
      scrapedData.privacyPolicyUrl,
      scrapedData.termsUrl,
    ]
      .filter(Boolean)
      .join(' ')
  );

  return CHECKLIST_DEFINITIONS.map((definition) => {
    if (definition.item === 'Cookie notice present on site' && !scrapedData.hasCookieNotice) {
      return {
        item: definition.item,
        category: definition.category,
        status: 'fail',
        details: 'No cookie banner/notice was detected during scraping.',
      };
    }

    return evaluateItem(definition, combinedText);
  });
}

function scoreCategory(checklist: ChecklistResult[], category: ChecklistCategory, maxItems: number): number {
  const items = checklist.filter((item) => item.category === category);
  const passCount = items.filter((item) => item.status === 'pass').length;

  const score = (passCount / maxItems) * 100;
  return Math.round(score);
}

function scoreUserRights(checklist: ChecklistResult[]): number {
  const rightsItems = checklist.filter(
    (item) =>
      item.item.includes('User rights listed') ||
      item.item.includes('California resident rights') ||
      item.item.includes('Opt-out mechanism described')
  );

  if (rightsItems.length === 0) {
    return 0;
  }

  const pass = rightsItems.filter((item) => item.status === 'pass').length;
  return Math.round((pass / rightsItems.length) * 100);
}

function scoreDataSharing(checklist: ChecklistResult[]): number {
  const sharingItems = checklist.filter(
    (item) =>
      item.item.includes('Third-party data sharing') ||
      item.item.includes('Do Not Sell My Personal Information')
  );

  if (sharingItems.length === 0) {
    return 0;
  }

  const pass = sharingItems.filter((item) => item.status === 'pass').length;
  return Math.round((pass / sharingItems.length) * 100);
}

export function calculateScores(checklist: ChecklistResult[]): ComplianceScores {
  const gdpr = scoreCategory(checklist, 'gdpr', 10);
  const ccpa = scoreCategory(checklist, 'ccpa', 6);
  const cookieCompliance = scoreCategory(checklist, 'cookie', 5);
  const dataRetention = scoreCategory(checklist, 'retention', 4);
  const dataSecurity = scoreCategory(checklist, 'security', 5);

  const overall = Math.round(
    gdpr * 0.35 + ccpa * 0.2 + cookieCompliance * 0.2 + dataRetention * 0.15 + dataSecurity * 0.1
  );

  return {
    overall,
    gdpr,
    ccpa,
    cookieCompliance,
    dataRetention,
    userRights: scoreUserRights(checklist),
    dataSharing: scoreDataSharing(checklist),
  };
}

export function determineRiskLevel(overallScore: number): RiskLevel {
  if (overallScore >= 90) {
    return 'low';
  }
  if (overallScore >= 70) {
    return 'medium';
  }
  if (overallScore >= 50) {
    return 'high';
  }
  return 'critical';
}
