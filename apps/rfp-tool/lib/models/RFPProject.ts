import { Document, Model, Schema, model, models } from 'mongoose';

export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';
export type SectionStatus = 'pending' | 'generating' | 'done' | 'failed';

export interface IRFPFile {
  originalName: string;
  size: number;
  uploadedAt: Date;
  extractedText: string;
  pageCount: number;
}

export interface ICompanyProfile {
  name: string;
  description: string;
  services: string[];
  pastProjects: string;
  teamSize: string;
  location: string;
  uploadedAt: Date;
}

export interface IRFPProjectSection {
  id: string;
  title: string;
  rfpRequirement: string;
  generatedResponse: string;
  status: SectionStatus;
  tokensUsed: number;
  regenerationCount: number;
  lastEditedAt: Date;
}

export interface IExportHistoryItem {
  exportedAt: Date;
  format: 'docx';
  fileSize: number;
}

export interface IRFPProject extends Document {
  userId: string;
  title: string;
  status: ProjectStatus;
  rfpFile: IRFPFile;
  companyProfile: ICompanyProfile;
  sections: IRFPProjectSection[];
  exportHistory: IExportHistoryItem[];
  totalTokensUsed: number;
  totalCost: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rfpFileSchema = new Schema<IRFPFile>(
  {
    originalName: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 },
    uploadedAt: { type: Date, required: true, default: Date.now },
    extractedText: { type: String, required: true, default: '' },
    pageCount: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const companyProfileSchema = new Schema<ICompanyProfile>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: '' },
    services: { type: [String], required: true, default: [] },
    pastProjects: { type: String, required: true, default: '' },
    teamSize: { type: String, required: true, default: '' },
    location: { type: String, required: true, default: '' },
    uploadedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const sectionSchema = new Schema<IRFPProjectSection>(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    rfpRequirement: { type: String, required: true, default: '' },
    generatedResponse: { type: String, required: true, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'generating', 'done', 'failed'],
      default: 'pending',
    },
    tokensUsed: { type: Number, required: true, min: 0, default: 0 },
    regenerationCount: { type: Number, required: true, min: 0, default: 0 },
    lastEditedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const exportHistorySchema = new Schema<IExportHistoryItem>(
  {
    exportedAt: { type: Date, required: true, default: Date.now },
    format: { type: String, required: true, enum: ['docx'], default: 'docx' },
    fileSize: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const rfpProjectSchema = new Schema<IRFPProject>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'processing', 'completed', 'failed'],
      default: 'draft',
      index: true,
    },
    rfpFile: { type: rfpFileSchema, required: true },
    companyProfile: { type: companyProfileSchema, required: true },
    sections: { type: [sectionSchema], default: [] },
    exportHistory: { type: [exportHistorySchema], default: [] },
    totalTokensUsed: { type: Number, required: true, min: 0, default: 0 },
    totalCost: { type: Number, required: true, min: 0, default: 0 },
    lastError: { type: String, required: false, default: '' },
  },
  {
    timestamps: true,
  }
);

rfpProjectSchema.index({ userId: 1, status: 1, createdAt: -1 });

const RFPProject: Model<IRFPProject> =
  models.RFPProject || model<IRFPProject>('RFPProject', rfpProjectSchema);

export default RFPProject;
