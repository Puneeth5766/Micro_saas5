import { randomUUID } from 'crypto';

import { IRFPProject } from '../models/RFPProject';

type DemoProjectInput = Omit<
  Partial<IRFPProject>,
  '_id' | 'createdAt' | 'updatedAt' | 'id' | 'userId'
> & {
  title: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  rfpFile: {
    originalName: string;
    size: number;
    uploadedAt: Date;
    extractedText: string;
    pageCount: number;
  };
  companyProfile: {
    name: string;
    description: string;
    services: string[];
    pastProjects: string;
    teamSize: string;
    location: string;
    uploadedAt: Date;
  };
  sections: Array<{
    title: string;
    rfpRequirement: string;
    generatedResponse: string;
    status: 'pending' | 'generating' | 'done' | 'failed';
    tokensUsed: number;
    regenerationCount: number;
    lastEditedAt: Date;
  }>;
};

export function getDemoRFPProjects(userId: string): DemoProjectInput[] {
  const now = new Date();

  return [
    {
      userId,
      title: 'IT Services RFP — Municipal Digital Services Portal',
      status: 'completed',
      rfpFile: {
        originalName: 'city-it-services-rfp.pdf',
        size: 4_920_321,
        uploadedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12),
        extractedText:
          'City modernization initiative for citizen services portal, multilingual support, secure case tracking, and SLA-backed help desk operations.',
        pageCount: 38,
      },
      companyProfile: {
        name: 'Northbridge Digital Solutions',
        description:
          'Northbridge delivers public-sector software modernization and managed IT services focused on accessibility, resilience, and measurable outcomes.',
        services: ['GovTech delivery', 'Cloud migration', '24/7 managed support', 'Accessibility remediation'],
        pastProjects:
          'Delivered statewide licensing portal serving 1.2M users and migrated legacy records system for a county agency with zero downtime.',
        teamSize: '120',
        location: 'Austin, TX',
        uploadedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12),
      },
      sections: [
        {
          title: 'Section 1 — Executive Overview',
          rfpRequirement: 'Provide a concise overview of your approach to modernizing municipal digital services.',
          generatedResponse:
            'Northbridge proposes a phased modernization plan that prioritizes citizen-facing workflows first, then transitions back-office integrations in parallel. We begin with service discovery and journey mapping to eliminate friction points, then implement a cloud-native portal with modular services for payments, case tracking, and document exchange. This approach reduces risk, accelerates time-to-value, and supports measurable service-level improvements from launch.',
          status: 'done',
          tokensUsed: 468,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 11),
        },
        {
          title: 'Section 2 — Technical Architecture',
          rfpRequirement: 'Describe platform architecture, scalability model, and security controls.',
          generatedResponse:
            'Our architecture uses containerized services on a managed cloud platform with autoscaling and multi-zone redundancy. We enforce zero-trust controls, role-based access, encryption in transit and at rest, and centralized audit logging. Security posture is continuously monitored via SIEM and vulnerability scanning, with quarterly penetration testing and documented remediation SLAs.',
          status: 'done',
          tokensUsed: 512,
          regenerationCount: 1,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
        },
        {
          title: 'Section 3 — Implementation Timeline',
          rfpRequirement: 'Provide milestones, dependencies, and proposed delivery timeline.',
          generatedResponse:
            'We propose a 24-week implementation schedule: Weeks 1–4 for discovery and baseline architecture, Weeks 5–12 for portal and integration development, Weeks 13–18 for UAT and accessibility compliance, and Weeks 19–24 for rollout and stabilization. Weekly governance checkpoints and a joint risk register ensure schedule adherence and transparent decision-making.',
          status: 'done',
          tokensUsed: 437,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 9),
        },
        {
          title: 'Section 4 — Accessibility & Compliance',
          rfpRequirement: 'Explain compliance strategy for WCAG and applicable public-sector standards.',
          generatedResponse:
            'Accessibility is embedded in design, QA, and release criteria. We align to WCAG 2.1 AA, conduct screen-reader validation, keyboard-only navigation testing, and contrast verification on every sprint release. Compliance artifacts, issue logs, and remediation timelines are provided in a formal accessibility conformance report.',
          status: 'done',
          tokensUsed: 401,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
        },
        {
          title: 'Section 5 — Data Migration',
          rfpRequirement: 'Detail migration methodology for historical records and legacy systems.',
          generatedResponse:
            'Northbridge executes migration in controlled waves with data profiling, cleansing, mapping, and reconciliation checkpoints. Dry runs are completed in lower environments before production cutover. We maintain rollback plans and validation scripts to ensure data integrity and continuity for public records operations.',
          status: 'done',
          tokensUsed: 389,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
        },
        {
          title: 'Section 6 — Support Model',
          rfpRequirement: 'Describe post-launch support and incident management model.',
          generatedResponse:
            'Our support model includes a 24/7 incident desk, tiered escalation, and named service delivery manager. Priority 1 incidents are acknowledged within 15 minutes and resolved under a defined SLA with executive escalation paths. Monthly service reviews track uptime, ticket trends, and continuous improvement actions.',
          status: 'done',
          tokensUsed: 430,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
        },
        {
          title: 'Section 7 — Staffing Plan',
          rfpRequirement: 'List proposed team structure, roles, and qualifications.',
          generatedResponse:
            'The core team includes a program manager, solution architect, lead engineer, UX specialist, accessibility analyst, QA lead, and DevSecOps engineer. Each role includes public-sector delivery experience and clear accountability. Resourcing is backed by a staffed bench to ensure continuity during peak periods.',
          status: 'done',
          tokensUsed: 355,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
        },
        {
          title: 'Section 8 — Pricing & Value',
          rfpRequirement: 'Provide cost structure and value justification.',
          generatedResponse:
            'Our pricing model is transparent, milestone-based, and aligned to deliverables. We combine fixed-price implementation with optional managed-service tiers to match budget flexibility. The projected value includes reduced call-center load, improved citizen self-service, and lower total cost of ownership through standardized cloud operations.',
          status: 'done',
          tokensUsed: 472,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
        },
      ],
      exportHistory: [{ exportedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), format: 'docx', fileSize: 483221 }],
      totalTokensUsed: 3464,
      totalCost: 22.41,
      lastError: '',
    },
    {
      userId,
      title: 'Cybersecurity Assessment RFP — Manufacturing Group',
      status: 'completed',
      rfpFile: {
        originalName: 'cybersecurity-assessment-rfp.pdf',
        size: 3_108_220,
        uploadedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
        extractedText:
          'Comprehensive security posture assessment across cloud and on-prem assets, policy review, threat modeling, and remediation roadmap.',
        pageCount: 24,
      },
      companyProfile: {
        name: 'Aegis Risk Advisory',
        description:
          'Aegis provides cybersecurity assessment and risk reduction programs for regulated and industrial environments.',
        services: ['Security assessments', 'Threat modeling', 'Compliance advisory', 'Managed detection integration'],
        pastProjects:
          'Led multi-site OT security assessment for a global food manufacturer and delivered SOC2 remediation roadmap for a logistics SaaS provider.',
        teamSize: '65',
        location: 'Chicago, IL',
        uploadedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
      },
      sections: [
        {
          title: 'Section 1 — Assessment Scope',
          rfpRequirement: 'Define proposed assessment coverage and boundaries.',
          generatedResponse:
            'Aegis will assess cloud infrastructure, endpoint controls, identity architecture, SIEM operations, and selected OT segments. Scope includes policy alignment, control maturity scoring, and adversarial threat path review. Boundary assumptions and exclusions are documented before kickoff to ensure alignment with stakeholders and operational constraints.',
          status: 'done',
          tokensUsed: 401,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
        },
        {
          title: 'Section 2 — Methodology',
          rfpRequirement: 'Describe assessment frameworks and evidence collection approach.',
          generatedResponse:
            'We use NIST CSF and CIS controls as the baseline and map findings to your internal policy framework. Evidence collection combines interviews, configuration review, telemetry analysis, and targeted technical validation. Every finding is tied to business impact, exploitability, and recommended control improvements.',
          status: 'done',
          tokensUsed: 378,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
        },
        {
          title: 'Section 3 — Threat Modeling',
          rfpRequirement: 'Provide your process for identifying and prioritizing threats.',
          generatedResponse:
            'Aegis conducts threat modeling workshops with security, operations, and business owners to identify high-impact attack scenarios. We evaluate likelihood, blast radius, and detection readiness, then prioritize actions that reduce both exploitability and recovery time. Outputs include scenario matrices and control gap mapping.',
          status: 'done',
          tokensUsed: 364,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
        },
        {
          title: 'Section 4 — Deliverables',
          rfpRequirement: 'List all expected deliverables and reporting cadence.',
          generatedResponse:
            'Deliverables include an executive risk summary, detailed findings log, maturity scorecard, and a 90-day remediation roadmap. Weekly status updates and milestone readouts keep leadership informed. Final materials are board-ready and include cost/effort estimates for remediation planning.',
          status: 'done',
          tokensUsed: 350,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
        },
        {
          title: 'Section 5 — Team & Certifications',
          rfpRequirement: 'Provide staffing profile and relevant certifications.',
          generatedResponse:
            'The delivery team includes CISSP-certified lead assessors, cloud security specialists, and compliance analysts with ISO 27001 and SOC2 expertise. Named resources and resumes are provided upon request. A dedicated engagement manager is assigned to governance and escalation management.',
          status: 'done',
          tokensUsed: 333,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
        },
        {
          title: 'Section 6 — Commercial Proposal',
          rfpRequirement: 'Provide commercial terms and assumptions.',
          generatedResponse:
            'Our commercial proposal uses fixed-fee phases aligned to scope milestones, with optional add-ons for deep technical validation or ongoing advisory support. Pricing includes kickoff, fieldwork, reporting, and executive presentation. Assumptions and dependencies are explicitly defined to avoid scope ambiguity.',
          status: 'done',
          tokensUsed: 349,
          regenerationCount: 1,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
        },
      ],
      exportHistory: [{ exportedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3), format: 'docx', fileSize: 367410 }],
      totalTokensUsed: 2175,
      totalCost: 14.08,
      lastError: '',
    },
    {
      userId,
      title: 'SaaS Platform RFP — Enterprise Customer Success Suite',
      status: 'draft',
      rfpFile: {
        originalName: 'enterprise-saas-platform-rfp.pdf',
        size: 6_210_445,
        uploadedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
        extractedText:
          'Enterprise RFP seeking a multi-tenant customer success platform with analytics, integrations, role-based access, and global data residency options.',
        pageCount: 46,
      },
      companyProfile: {
        name: 'Helix Customer Platforms',
        description:
          'Helix builds enterprise-grade customer success software for subscription businesses requiring scale, compliance, and deep integration.',
        services: ['SaaS platform implementation', 'API integrations', 'Data migration', 'Success operations consulting'],
        pastProjects:
          'Implemented customer health platform for a Fortune 500 software vendor and integrated CRM + billing workflows across 12 business units.',
        teamSize: '210',
        location: 'Seattle, WA',
        uploadedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
      },
      sections: [
        {
          title: '1. Platform Overview',
          rfpRequirement: 'Provide a high-level platform overview and business outcomes.',
          generatedResponse:
            'Helix delivers a configurable, enterprise-ready customer success platform that unifies account health, lifecycle workflows, and renewal intelligence. The platform enables teams to identify risk early, automate outreach, and coordinate cross-functional actions. Expected outcomes include higher retention, better expansion visibility, and faster time-to-value for customer-facing teams.',
          status: 'done',
          tokensUsed: 388,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
        },
        {
          title: '2. Multi-Tenant Architecture',
          rfpRequirement: 'Describe multi-tenant architecture and tenant isolation.',
          generatedResponse:
            'Our multi-tenant architecture enforces strict logical isolation at application and data layers while preserving centralized operability. Tenant-specific encryption keys, scoped identity policies, and granular service boundaries protect customer data. This model supports enterprise scale without sacrificing governance or performance.',
          status: 'done',
          tokensUsed: 357,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
        },
        {
          title: '3. Data Residency & Compliance',
          rfpRequirement: 'Explain global residency options and compliance posture.',
          generatedResponse:
            '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '4. API and Integration Layer',
          rfpRequirement: 'Describe supported integrations and API maturity.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '5. Identity and Access Management',
          rfpRequirement: 'Outline SSO, MFA, and role-based access capabilities.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '6. Workflow Automation',
          rfpRequirement: 'Provide detail on automation capabilities and trigger logic.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '7. Analytics and Reporting',
          rfpRequirement: 'Describe dashboarding, forecasting, and alerting options.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '8. Implementation Approach',
          rfpRequirement: 'Share implementation methodology and timeline assumptions.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '9. Support and SLAs',
          rfpRequirement: 'Define post-go-live support model and SLA commitments.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
        {
          title: '10. Commercial Terms',
          rfpRequirement: 'Provide pricing model, assumptions, and contract terms.',
          generatedResponse: '',
          status: 'pending',
          tokensUsed: 0,
          regenerationCount: 0,
          lastEditedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        },
      ],
      exportHistory: [],
      totalTokensUsed: 745,
      totalCost: 4.79,
      lastError: '',
    },
  ].map((project) => ({
    ...project,
    sections: project.sections.map((section) => ({
      ...section,
      id: randomUUID(),
    })),
  }));
}
