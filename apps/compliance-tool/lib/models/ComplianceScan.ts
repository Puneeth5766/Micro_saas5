import { Document, Model, Schema, model, models } from 'mongoose';

export type ComplianceScanStatus = 'pending' | 'scanning' | 'completed' | 'failed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskFlagSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ChecklistStatus = 'pass' | 'fail' | 'warning' | 'na';

export interface IScrapedContent {
  privacyPolicyUrl: string;
  privacyPolicyText: string;
  termsUrl: string;
  termsText: string;
  cookieNoticeText: string;
  hasPrivacyPolicy: boolean;
  hasTerms: boolean;
  hasCookieNotice: boolean;
  scrapedAt: Date;
}

export interface IComplianceScores {
  overall: number;
  gdpr: number;
  ccpa: number;
  cookieCompliance: number;
  dataRetention: number;
  userRights: number;
  dataSharing: number;
}

export interface IRiskFlag {
  category: string;
  severity: RiskFlagSeverity;
  title: string;
  description: string;
  recommendation: string;
  regulation: string;
}

export interface IChecklistItem {
  item: string;
  status: ChecklistStatus;
  details: string;
}

export interface IExportHistoryItem {
  exportedAt: Date;
  format: 'pdf';
}

export interface IComplianceScan extends Document {
  userId: string;
  url: string;
  domain: string;
  status: ComplianceScanStatus;
  scrapedContent: IScrapedContent;
  scores: IComplianceScores;
  riskLevel: RiskLevel;
  riskFlags: IRiskFlag[];
  checklist: IChecklistItem[];
  aiAnalysis: string;
  exportHistory: IExportHistoryItem[];
  tokensUsed: number;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

const scrapedContentSchema = new Schema<IScrapedContent>(
  {
    privacyPolicyUrl: { type: String, required: true, default: '' },
    privacyPolicyText: { type: String, required: true, default: '' },
    termsUrl: { type: String, required: true, default: '' },
    termsText: { type: String, required: true, default: '' },
    cookieNoticeText: { type: String, required: true, default: '' },
    hasPrivacyPolicy: { type: Boolean, required: true, default: false },
    hasTerms: { type: Boolean, required: true, default: false },
    hasCookieNotice: { type: Boolean, required: true, default: false },
    scrapedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const scoresSchema = new Schema<IComplianceScores>(
  {
    overall: { type: Number, required: true, min: 0, max: 100, default: 0 },
    gdpr: { type: Number, required: true, min: 0, max: 100, default: 0 },
    ccpa: { type: Number, required: true, min: 0, max: 100, default: 0 },
    cookieCompliance: { type: Number, required: true, min: 0, max: 100, default: 0 },
    dataRetention: { type: Number, required: true, min: 0, max: 100, default: 0 },
    userRights: { type: Number, required: true, min: 0, max: 100, default: 0 },
    dataSharing: { type: Number, required: true, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

const riskFlagSchema = new Schema<IRiskFlag>(
  {
    category: { type: String, required: true, trim: true },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: '' },
    recommendation: { type: String, required: true, default: '' },
    regulation: { type: String, required: true, default: '' },
  },
  { _id: false }
);

const checklistSchema = new Schema<IChecklistItem>(
  {
    item: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['pass', 'fail', 'warning', 'na'],
      default: 'warning',
    },
    details: { type: String, required: true, default: '' },
  },
  { _id: false }
);

const exportHistorySchema = new Schema<IExportHistoryItem>(
  {
    exportedAt: { type: Date, required: true, default: Date.now },
    format: { type: String, required: true, enum: ['pdf'], default: 'pdf' },
  },
  { _id: false }
);

const complianceScanSchema = new Schema<IComplianceScan>(
  {
    userId: { type: String, required: true, ref: 'User', index: true, trim: true },
    url: { type: String, required: true, trim: true },
    domain: { type: String, required: true, index: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'scanning', 'completed', 'failed'],
      default: 'pending',
    },
    scrapedContent: { type: scrapedContentSchema, required: true },
    scores: { type: scoresSchema, required: true, default: () => ({}) },
    riskLevel: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    riskFlags: { type: [riskFlagSchema], required: true, default: [] },
    checklist: { type: [checklistSchema], required: true, default: [] },
    aiAnalysis: { type: String, required: true, default: '' },
    exportHistory: { type: [exportHistorySchema], required: true, default: [] },
    tokensUsed: { type: Number, required: true, min: 0, default: 0 },
    cost: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

complianceScanSchema.index({ userId: 1, domain: 1, createdAt: -1, riskLevel: 1 });

const ComplianceScan: Model<IComplianceScan> =
  models.ComplianceScan || model<IComplianceScan>('ComplianceScan', complianceScanSchema);

export default ComplianceScan;
